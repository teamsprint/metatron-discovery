/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.engine.monitoring;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;

import org.datanucleus.util.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.MatrixResponse;
import app.metatron.discovery.domain.datasource.data.result.ChartResultFormat;
import app.metatron.discovery.domain.datasource.data.result.ObjectResultFormat;
import app.metatron.discovery.domain.engine.DruidEngineRepository;
import app.metatron.discovery.domain.workbook.configurations.Pivot;
import app.metatron.discovery.domain.workbook.configurations.datasource.DefaultDataSource;
import app.metatron.discovery.domain.workbook.configurations.field.MeasureField;
import app.metatron.discovery.domain.workbook.configurations.field.TimestampField;
import app.metatron.discovery.domain.workbook.configurations.filter.TimeFilter;
import app.metatron.discovery.domain.workbook.configurations.format.CustomDateTimeFormat;
import app.metatron.discovery.query.druid.Aggregation;
import app.metatron.discovery.query.druid.Filter;
import app.metatron.discovery.query.druid.PostAggregation;
import app.metatron.discovery.query.druid.Query;
import app.metatron.discovery.query.druid.aggregations.CountAggregation;
import app.metatron.discovery.query.druid.aggregations.LongSumAggregation;
import app.metatron.discovery.query.druid.filters.SelectorFilter;
import app.metatron.discovery.query.druid.postaggregations.ArithmeticPostAggregation;
import app.metatron.discovery.query.druid.postaggregations.FieldAccessorPostAggregator;
import app.metatron.discovery.query.druid.queries.MonitoringQuery;

import static app.metatron.discovery.domain.datasource.DataSource.ConnectionType.ENGINE;

@Component
public class EngineMonitoringService {

  @Autowired
  DruidEngineRepository engineRepository;

  @Autowired
  EngineMonitoringProperties monitoringProperties;

  @Value("${polaris.engine.monitoring.emitter.datasource:druid-metric}")
  String datasourceName;

  public Object query(Object query) {
    EngineMonitoringRequest request = new EngineMonitoringRequest();
    request.setResultFormat(new ObjectResultFormat(ENGINE));

    String queryString = GlobalObjectMapper.writeValueAsString(query);
    Optional<JsonNode> engineResult = engineRepository.query(queryString, JsonNode.class);
    Object result = request.getResultFormat()
                           .makeResult(
                               engineResult.orElseGet(
                                   () -> GlobalObjectMapper.getDefaultMapper().createArrayNode())
                           );
    if (result instanceof MatrixResponse && request.getResultFormat() instanceof ChartResultFormat) {
      MatrixResponse response = (MatrixResponse) result;
      return response;
    } else {
      return result;
    }

  }

  public Object search(EngineMonitoringRequest request) {

    List<Filter> filters = Lists.newArrayList();
    setFiltersByType(filters, request.getMonitoringTarget());

    List<Aggregation> aggregations = Lists.newArrayList();
    List<PostAggregation> postAggregations = Lists.newArrayList();
    aggregations.add(new LongSumAggregation("value", "value"));
    if (request.getMonitoringTarget().isIncludeCount()) {
      aggregations.add(new CountAggregation("count"));

      List<PostAggregation> fields = Lists.newArrayList();
      fields.add(new FieldAccessorPostAggregator("value", "value"));
      fields.add(new FieldAccessorPostAggregator("count", "count"));
      postAggregations.add(new ArithmeticPostAggregation("avg_value", ArithmeticPostAggregation.AggregationFunction.DIVISION, fields));
    }

    Pivot pivot = new Pivot();
    pivot.addColumn(new TimestampField("event_time", null, new CustomDateTimeFormat("yyyy-MM-dd HH:mm:ss.SSS")));

    pivot.addAggregation(new MeasureField("value", null, MeasureField.AggregationType.SUM));

    request.setPivot(pivot);

    if (request.getResultFormat() == null) {
      request.setResultFormat(new ObjectResultFormat(ENGINE));
    } else {
      request.getResultFormat().setConnType(ENGINE);
    }

    if (StringUtils.isEmpty(request.getFromDate())) {
      request.setFromDate(TimeFilter.MIN_DATETIME.toString());
    }
    if (StringUtils.isEmpty(request.getToDate())) {
      request.setToDate(TimeFilter.MAX_DATETIME.toString());
    }

    Query query = MonitoringQuery.builder(new DefaultDataSource(datasourceName))
                           .filters(filters)
                           .granularity(request.getGranularity())
                           .aggregation(aggregations)
                           .postAggregation(postAggregations)
                           .format(request.getResultFormat())
                           .intervals(Lists.newArrayList(request.getFromDate(), request.getToDate()))
                           .build();

    String queryString = GlobalObjectMapper.writeValueAsString(query);

    System.out.println(queryString);

    Optional<JsonNode> engineResult = engineRepository.query(queryString, JsonNode.class);

    Object result = request.getResultFormat()
                           .makeResult(engineResult.orElseGet(
                               () -> GlobalObjectMapper.getDefaultMapper().createArrayNode()
                                       )
                           );

    return result;
  }

  public Object getEngineData(EngineMonitoringRequest queryRequest) {
    Object data = search(queryRequest);
    if (data instanceof MatrixResponse && queryRequest.getResultFormat() instanceof ChartResultFormat) {
      MatrixResponse response = (MatrixResponse) data;
      return response;
    } else {
      Map<String, Object> result = Maps.newHashMap();
      ArrayNode engineData = (ArrayNode) data;
      List<String> timeList = Lists.newArrayList();
      List<Long> valueList = Lists.newArrayList();
      List<Long> countList = Lists.newArrayList();
      List<Float> avgList = Lists.newArrayList();
      for (JsonNode rowNode : engineData) {
        Map<String, Object> row = GlobalObjectMapper.getDefaultMapper().convertValue(rowNode, Map.class);
        timeList.add(String.valueOf(row.get("event_time")));
        valueList.add(Long.parseLong(String.valueOf(row.get("value"))));
        if (queryRequest.getMonitoringTarget().isIncludeCount()) {
          countList.add(Long.parseLong(String.valueOf(row.get("count"))));
          avgList.add(Float.parseFloat(String.valueOf(row.get("avg_value"))));
        }
      }
      result.put("time", timeList);
      result.put("value", valueList);
      result.put("total_value", valueList.stream().mapToLong(Long::longValue).sum());
      if (queryRequest.getMonitoringTarget().isIncludeCount()) {
        result.put("count", timeList);
        result.put("avg_value", avgList);
        result.put("total_count", countList.stream().mapToLong(Long::longValue).sum());
      }
      return result;
    }
  }

  public List getMemory(EngineMonitoringRequest queryRequest) {
    if (queryRequest.getMonitoringTarget() == null) {
      queryRequest.setMonitoringTarget(new EngineMonitoringTarget());
    }
    EngineMonitoringTarget engineMonitoringTarget = queryRequest.getMonitoringTarget();
    engineMonitoringTarget.setIncludeCount(true);
    engineMonitoringTarget.setMetric(EngineMonitoringTarget.MetricType.MEM_USED);
    queryRequest.setMonitoringTarget(engineMonitoringTarget);
    Map result = (Map) getEngineData(queryRequest);
    float useMem = new Float(String.valueOf(result.get("total_value")));

    engineMonitoringTarget.setMetric(EngineMonitoringTarget.MetricType.MEM_MAX);
    queryRequest.setMonitoringTarget(engineMonitoringTarget);
    result = (Map) getEngineData(queryRequest);
    float maxMem = new Float(String.valueOf(result.get("total_value")));

    float percentage = 100 * useMem / maxMem;
    List memList = Lists.newArrayList();
    Map<String, Object> useMemMap = Maps.newHashMap();
    useMemMap.put("name", "useMem");
    useMemMap.put("value", useMem);
    useMemMap.put("percentage", percentage);

    Map<String, Object> maxMemMap = Maps.newHashMap();
    maxMemMap.put("name", "maxMem");
    maxMemMap.put("value", maxMem);
    maxMemMap.put("percentage", 100 - percentage);

    memList.add(useMemMap);
    memList.add(maxMemMap);
    return memList;
  }

  public HashMap getConfigs(String configName) {
    Map<String, Object> paramMap = Maps.newHashMap();
    paramMap.put("configName", configName);
    Optional<HashMap> result = engineRepository.getConfigs(paramMap, HashMap.class);
    return result.orElse(Maps.newHashMap());
  }

  public Map getSize() {
    Map<String, Object> sizeMap = Maps.newHashMap();
    Optional<List> historicalNodes = engineRepository.getHistoricalNodes();
    for (Object o : historicalNodes.get()) {
      Map<String, Object> k = (Map<String, Object>) o;
      sizeMap.put("currSize", Long.parseLong(String.valueOf(k.get("currSize"))));
      sizeMap.put("maxSize", Long.parseLong(String.valueOf(k.get("maxSize"))));
    }
    return sizeMap;
  }

  public List getDatasourceList() {
    Optional<List> results = engineRepository.sql("SELECT datasource FROM sys.segments GROUP BY 1");
    return results.get();
  }

  public List getPendingTasks() {
    Optional<List> tasks = engineRepository.getPendingTasks();
    return tasks.get();
  }

  public List getRunningTasks() {
    Optional<List> tasks = engineRepository.getRunningTasks();
    return tasks.get();
  }

  public List getWaitingTasks() {
    Optional<List> tasks = engineRepository.getWaitingTasks();
    return tasks.get();
  }

  public List getCompleteTasks() {
    Optional<List> tasks = engineRepository.getCompleteTasks();
    return tasks.get();
  }

  private void setFiltersByType(List<Filter> filters, EngineMonitoringTarget monitoringTarget) {
    if ( monitoringTarget.getHost() != null ) {
      filters.add(new SelectorFilter("host", monitoringTarget.getHost()));
    }

    if ( monitoringTarget.getService() != null ) {
      filters.add(new SelectorFilter("service", monitoringTarget.getService()));
    }

    switch (monitoringTarget.getMetric()) {
      case GC_COUNT:
        filters.add(new SelectorFilter("metric", "jvm/gc/count"));
        break;
      case GC_CPU:
        filters.add(new SelectorFilter("metric", "jvm/gc/cpu"));
        break;
      case MEM_MAX:
        filters.add(new SelectorFilter("metric", "jvm/mem/max"));
        break;
      case MEM_USED:
        filters.add(new SelectorFilter("metric", "jvm/mem/used"));
        break;
      case QUERY_TIME:
        filters.add(new SelectorFilter("metric", "query/time"));
        break;
    }
  }

  private List<String> getMonitoringColumns(EngineMonitoringTarget.MetricType type) {

    List<String> columns = Lists.newArrayList("__time","metric","service","host","count","value");


    if(type == EngineMonitoringTarget.MetricType.GC_COUNT
        || type == EngineMonitoringTarget.MetricType.GC_CPU) {
      columns.add("gcGen");
      columns.add("gcName");
    } else if (type == EngineMonitoringTarget.MetricType.MEM_MAX
        || type == EngineMonitoringTarget.MetricType.MEM_USED){
      columns.add("memKind");
    }

    return columns;
  }
}
