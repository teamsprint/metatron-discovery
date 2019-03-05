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

import com.fasterxml.jackson.databind.JsonNode;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.datasource.data.result.ObjectResultFormat;
import app.metatron.discovery.domain.engine.DruidEngineRepository;
import app.metatron.discovery.domain.workbook.configurations.Pivot;
import app.metatron.discovery.domain.workbook.configurations.datasource.DefaultDataSource;
import app.metatron.discovery.domain.workbook.configurations.field.MeasureField;
import app.metatron.discovery.domain.workbook.configurations.field.TimestampField;
import app.metatron.discovery.domain.workbook.configurations.format.CustomDateTimeFormat;
import app.metatron.discovery.query.druid.Aggregation;
import app.metatron.discovery.query.druid.Filter;
import app.metatron.discovery.query.druid.Query;
import app.metatron.discovery.query.druid.aggregations.LongSumAggregation;
import app.metatron.discovery.query.druid.filters.SelectorFilter;
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

  public Object search(EngineMonitoringRequest request) {

    List<Filter> filters = Lists.newArrayList();
    setFiltersByType(filters, request.getMonitoringTarget());

    List<Aggregation> aggregations = Lists.newArrayList();
    aggregations.add(new LongSumAggregation("value", "value"));


    Pivot pivot = new Pivot();
    pivot.addColumn(new TimestampField("event_time", null, new CustomDateTimeFormat("yyyy-MM-dd HH:mm:ss.SSS")));

    pivot.addAggregation(new MeasureField("value", null, MeasureField.AggregationType.SUM));

    request.setPivot(pivot);


    if (request.getResultFormat() == null) {
      request.setResultFormat(new ObjectResultFormat(ENGINE));
    } else {
      request.getResultFormat().setConnType(ENGINE);
    }

    Query query;

    query = MonitoringQuery.builder(new DefaultDataSource(datasourceName))
        .filters(filters)
        .granularity(request.getGranularity())
        .aggregation(aggregations)
        .format(request.getResultFormat())
        .intervals(Lists.newArrayList(request.getFromDate(), request.getToDate()))
        .build();

    String queryString = GlobalObjectMapper.writeValueAsString(query);

    Optional<JsonNode> engineResult = engineRepository.query(queryString, JsonNode.class);

    Object result = request.getResultFormat()
        .makeResult(engineResult.orElseGet(
            () -> GlobalObjectMapper.getDefaultMapper().createArrayNode()
            )
        );

    return result;

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
