/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.dataprep.etl;

import static app.metatron.discovery.domain.dataprep.PrepProperties.ETL_CORES;
import static app.metatron.discovery.domain.dataprep.PrepProperties.ETL_LIMIT_ROWS;
import static app.metatron.discovery.domain.dataprep.PrepProperties.ETL_MAX_FETCH_SIZE;
import static app.metatron.discovery.domain.dataprep.PrepProperties.ETL_TIMEOUT;
import static app.metatron.discovery.domain.dataprep.entity.PrSnapshot.STATUS.CANCELED;
import static app.metatron.discovery.domain.dataprep.entity.PrSnapshot.STATUS.FAILED;
import static app.metatron.discovery.domain.dataprep.entity.PrSnapshot.STATUS.RUNNING;
import static app.metatron.discovery.domain.dataprep.entity.PrSnapshot.STATUS.SUCCEEDED;
import static app.metatron.discovery.domain.dataprep.entity.PrSnapshot.STATUS.WRITING;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_SNAPSHOT_TYPE_IS_MISSING;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_SNAPSHOT_TYPE_NOT_SUPPORTED_YET;
import static app.metatron.discovery.domain.dataprep.util.PrepUtil.snapshotError;

import app.metatron.dataprep.PrepContext;
import app.metatron.dataprep.teddy.DataFrame;
import app.metatron.dataprep.teddy.Row;
import app.metatron.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.dataprep.entity.PrSnapshot;
import app.metatron.discovery.domain.dataprep.entity.PrSnapshot.STATUS;
import app.metatron.discovery.domain.dataprep.service.PrSnapshotService;
import app.metatron.discovery.domain.dataprep.util.DbInfo;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.google.common.collect.Maps;
import java.io.IOException;
import java.net.URISyntaxException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CancellationException;
import java.util.concurrent.Future;
import java.util.concurrent.TimeoutException;
import org.apache.commons.io.FilenameUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.AsyncResult;
import org.springframework.stereotype.Service;

@Service
public class TeddyExecutor {

  private static Logger LOGGER = LoggerFactory.getLogger(TeddyExecutor.class);

  Map<String, Object> jobList = Maps.newHashMap();

  @Autowired
  PrSnapshotService snapshotService;

  @Autowired
  TeddyExecCallback callback;

  @Autowired
  TeddyFileService fileService;

  @Autowired
  TeddyDatabaseService databaseService;

  @Autowired
  TeddyStagingDbService stagingDbService;

  PrepContext pc;

  public Integer timeout;
  public Integer cores;
  public Integer limitRows;
  public Integer maxFetchSize;

  Map<String, String> replaceMap = new HashMap(); // origTeddyDsId -> newFullDsId
  Map<String, String> reverseMap = new HashMap(); // newFullDsId -> origTeddyDsId

  private void setPrepPropertiesInfo(Map<String, Object> prepPropertiesInfo) {
    cores = (Integer) prepPropertiesInfo.get(ETL_CORES);
    timeout = (Integer) prepPropertiesInfo.get(ETL_TIMEOUT);
    limitRows = (Integer) prepPropertiesInfo.get(ETL_LIMIT_ROWS);
    maxFetchSize = (Integer) prepPropertiesInfo.get(ETL_MAX_FETCH_SIZE);
  }

  private void putStackTraceIntoCustomField(String ssId, Exception e) {
    StringBuffer sb = new StringBuffer();

    for (StackTraceElement ste : e.getStackTrace()) {
      sb.append("\n");
      sb.append(ste.toString());
    }
    callback.updateSnapshot(ssId, "custom", "{'fail_msg':'" + sb.toString() + "'}");
  }

  @Async("prepThreadPoolTaskExecutor")
  public Future<String> run(String[] argv) throws JsonProcessingException {
    String ssId = "";
    Exception exception = null;

    // 1. Prepare the arguments and settings
    Map<String, Object> prepPropertiesInfo = GlobalObjectMapper.readValue(argv[0], HashMap.class);
    Map<String, Object> dsInfo = GlobalObjectMapper.readValue(argv[1], HashMap.class);
    Map<String, Object> snapshotInfo = GlobalObjectMapper.readValue(argv[2], HashMap.class);
    Map<String, Object> callbackInfo = GlobalObjectMapper.readValue(argv[3], HashMap.class);

    setPrepPropertiesInfo(prepPropertiesInfo);
    fileService.setPrepPropertiesInfo(prepPropertiesInfo);
    databaseService.setPrepPropertiesInfo(prepPropertiesInfo);
    stagingDbService.setPrepPropertiesInfo(prepPropertiesInfo);

    callback.setCallbackInfo(callbackInfo);

    ssId = (String) snapshotInfo.get("ssId");
    String masterTeddyDsId = ((String) dsInfo.get("origTeddyDsId"));

    callback.updateSnapshot(ssId, "ruleCntTotal", String.valueOf(countAllRules(dsInfo)));
    callback.updateStatus(ssId, RUNNING);

    String ssType = (String) snapshotInfo.get("ssType");
    if (ssType == null) {
      callback.updateStatus(ssId, FAILED);
      throw snapshotError(MSG_DP_ALERT_SNAPSHOT_TYPE_IS_MISSING, "The request does not contain snapshot type.");
    }

    pc = PrepContext.DEFAULT;

    // 2. Transform the DataFrame with rule strings
    if (!transformDf(ssId, dsInfo)) {
      return new AsyncResult("Dummy");
    }

    // 3. Write the transformed DataFrame.
    String masterFullDsId = replaceMap.get(masterTeddyDsId);
    DataFrame df = pc.fetch(masterFullDsId);
    callback.updateSnapshot(ssId, "totalLines", String.valueOf(df.rows.size()));
    callback.updateStatus(ssId, WRITING);

    try {
      switch (PrSnapshot.SS_TYPE.valueOf(ssType)) {
        case URI:
          fileService.createSnapshot(df, snapshotInfo);
          break;
        case STAGING_DB:
          stagingDbService.createSnapshot(df, snapshotInfo);
          break;
        case DATABASE:
        case DRUID:
          callback.updateStatus(ssId, FAILED);
          throw snapshotError(MSG_DP_ALERT_SNAPSHOT_TYPE_NOT_SUPPORTED_YET, ssType);
      }
    } catch (CancellationException e) {
      LOGGER.info("run(): snapshot canceled: ", e);
      callback.updateStatus(ssId, CANCELED);
      exception = e;
    } catch (IOException | SQLException | ClassNotFoundException | TeddyException | TimeoutException | URISyntaxException e) {
      LOGGER.error("run(): error while creating a snapshot: ", e);
      callback.updateStatus(ssId, FAILED);
      exception = e;
    }

    if (exception != null) {
      putStackTraceIntoCustomField(ssId, exception);
      LOGGER.info("runTeddy(): Failure: ssid={}", ssId);
      return new AsyncResult("Dummy");
    }

    String jsonColDescs = GlobalObjectMapper.getDefaultMapper().writeValueAsString(df.colDescs);
    callback.updateSnapshot(ssId, "custom", "{'colDescs':" + jsonColDescs + "}");

    // Remove all full datasets from PrepContext
    for (String fullDsId : reverseMap.keySet()) {
      pc.remove(fullDsId);
    }

    callback.updateStatus(ssId, SUCCEEDED);

    LOGGER.info("runTeddy(): Success: ssid={}", ssId);
    return new AsyncResult("Dummy");
  }

  private boolean transformDf(String ssId, Map<String, Object> dsInfo) {
    Exception exception = null;
    STATUS status = SUCCEEDED;

    try {
      transformRecursive(ssId, dsInfo);
    } catch (CancellationException | InterruptedException e) {
      LOGGER.info("runTeddy(): interrupted or canceled: ssid={}", ssId);
      status = CANCELED;
      exception = e;
    } catch (ClassNotFoundException | URISyntaxException | TimeoutException | TeddyException | SQLException e) {
      LOGGER.error("runTeddy(): error while transform: ssid={}", ssId);
      LOGGER.error("runTeddy(): with exception: ", e);
      status = FAILED;
      exception = e;
    }

    if (exception == null) {
      return true;
    }

    putStackTraceIntoCustomField(ssId, exception);
    LOGGER.info("runTeddy(): stopped: ssid={} status={}", ssId, status.name());
    return false;
  }

  void transformRecursive(String ssId, Map<String, Object> dsInfo) throws ClassNotFoundException, SQLException,
          TeddyException, URISyntaxException, TimeoutException, InterruptedException {
    snapshotService.cancelCheck(ssId);
    String origTeddyDsId = (String) dsInfo.get("origTeddyDsId");

    String newFullDsId = createStage0(dsInfo);
    replaceMap.put(origTeddyDsId, newFullDsId);
    reverseMap.put(newFullDsId, origTeddyDsId);

    List<Map<String, Object>> upstreamDatasetInfos;
    upstreamDatasetInfos = (List<Map<String, Object>>) dsInfo.get("upstreamDatasetInfos");
    for (Map<String, Object> upstreamDatasetInfo : upstreamDatasetInfos) {
      transformRecursive(ssId, upstreamDatasetInfo);
    }

    List<String> ruleStrings = (List<String>) dsInfo.get("ruleStrings");
    List<String> replacedRuleStrings = new ArrayList();
    for (String ruleString : ruleStrings) {
      String replacedRuleString = ruleString;
      for (String key : replaceMap.keySet()) {
        if (ruleString.contains(key)) {
          replacedRuleString = replacedRuleString.replace(key, replaceMap.get(key));
        }
      }
      replacedRuleStrings.add(replacedRuleString);
    }
    applyRuleStrings(ssId, newFullDsId, replacedRuleStrings);
  }

  // returns total rule count of the snapshot (including slave datasets)
  long countAllRules(Map<String, Object> dsInfo) {
    long ruleCntTotal = 0L;

    for (Map<String, Object> upstreamDatasetInfo : (List<Map<String, Object>>) dsInfo.get("upstreamDatasetInfos")) {
      ruleCntTotal += countAllRules(upstreamDatasetInfo);
    }

    return ruleCntTotal + ((List<String>) dsInfo.get("ruleStrings")).size();
  }

  private void applyRuleStrings(String ssId, String masterFullDsId, List<String> ruleStrings)
          throws TeddyException, TimeoutException, InterruptedException {
    long ruleCntDone = 0L;

    LOGGER.trace("applyRuleStrings(): start");

    // multi-thread
    for (String ruleString : ruleStrings) {     // create rule has been removed already
      snapshotService.cancelCheck(ssId);

      DataFrame df = pc.fetch(masterFullDsId);
      df = pc.apply(df, ruleString);
      pc.put(masterFullDsId, df);

      callback.updateSnapshot(ssId, "ruleCntDone", String.valueOf(++ruleCntDone));
    }

    LOGGER.trace("applyRuleStrings(): end");
  }

  public String createStage0(Map<String, Object> dsInfo)
          throws URISyntaxException, TeddyException, SQLException, ClassNotFoundException {
    String newFullDsId = UUID.randomUUID().toString();

    LOGGER.trace("TeddyExecutor.createStage0(): newFullDsId={}", newFullDsId);

    if (dsInfo.get("importType") == null) {
      throw new IllegalArgumentException("TeddyExecutor.createStage0(): importType should not be null");
    }

    String importType = (String) dsInfo.get("importType");
    switch (importType) {
      case "UPLOAD":
      case "URI":
        String storedUri = (String) dsInfo.get("storedUri");
        Integer manualColCnt = (Integer) dsInfo.get("manualColumnCount");
        String extensionType = FilenameUtils.getExtension(storedUri).toLowerCase();
        if (extensionType.equals("json")) {
          pc.put(newFullDsId, fileService.loadJsonFile(newFullDsId, storedUri, manualColCnt));
        } else {
          String delimiter = (String) dsInfo.get("delimiter");
          String quoteChar = (String) dsInfo.get("quoteChar");
          pc.put(newFullDsId, fileService.loadCsvFile(newFullDsId, storedUri, delimiter, quoteChar, manualColCnt));
        }
        break;

      case "DATABASE":
        String sql = (String) dsInfo.get("sourceQuery");
        pc.put(newFullDsId, databaseService.loadDatabaseTable(newFullDsId, sql, new DbInfo(dsInfo)));
        break;

      case "STAGING_DB":
        pc.put(newFullDsId, stagingDbService.loadHiveTable(newFullDsId, (String) dsInfo.get("sourceQuery")));
        break;

      default:
        throw new IllegalArgumentException("TeddyExecutor.createStage0(): not supported importType: " + importType);
    }

    LOGGER.trace("TeddyExecutor.createStage0(): end");
    return newFullDsId;
  }

  public List<Future<List<Row>>> getJob(String key) {
    return (List<Future<List<Row>>>) jobList.get(key);
  }

  synchronized private void addJob(String key, Object value) {
    jobList.put(key, value);
  }

  private void removeJob(String key) {
    jobList.remove(key);
  }
}