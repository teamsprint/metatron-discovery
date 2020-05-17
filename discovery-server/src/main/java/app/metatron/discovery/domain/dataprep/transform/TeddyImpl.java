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

package app.metatron.discovery.domain.dataprep.transform;

import static app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes.PREP_TEDDY_ERROR_CODE;

import app.metatron.dataprep.PrepContext;
import app.metatron.dataprep.teddy.DataFrame;
import app.metatron.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.dataconnection.DataConnectionHelper;
import app.metatron.discovery.domain.dataprep.PrepKafkaService;
import app.metatron.discovery.domain.dataprep.PrepProperties;
import app.metatron.discovery.domain.dataprep.entity.PrDataset;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.storage.StorageProperties;
import app.metatron.discovery.domain.storage.StorageProperties.StageDBConnection;
import app.metatron.discovery.extension.dataconnection.jdbc.accessor.JdbcAccessor;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class TeddyImpl {

  private static Logger LOGGER = LoggerFactory.getLogger(TeddyImpl.class);

  @Autowired
  PrepProperties prepProperties;

  @Autowired(required = false)
  StorageProperties storageProperties;

  @Autowired
  PrepKafkaService kafkaService;

  private DataFrame createStage0(PrepContext pc, String dsId, DataFrame df) {
    pc.put(dsId, df);
    return df;
  }

  public DataFrame loadStageDBDataset(PrepContext pc, String dsId, String sql, String dsName) throws PrepException {

    DataConnection hiveConnection = new DataConnection();
    StageDBConnection stageDB = storageProperties.getStagedb();
    hiveConnection.setHostname(stageDB.getHostname());
    hiveConnection.setPort(stageDB.getPort());
    hiveConnection.setUsername(stageDB.getUsername());
    hiveConnection.setPassword(stageDB.getPassword());
    hiveConnection.setUrl(stageDB.getUrl());
    hiveConnection.setImplementor("HIVE");

    JdbcAccessor jdbcDataAccessor = DataConnectionHelper.getAccessor(hiveConnection);
    Connection conn;
    Statement stmt;

    try {
      conn = jdbcDataAccessor.getConnection();
      stmt = conn.createStatement();
      stmt.setFetchSize(prepProperties.getSamplingMaxFetchSize());
    } catch (SQLException e) {
      e.printStackTrace();
      throw PrepException.create(PREP_TEDDY_ERROR_CODE, e);
    }

    DataFrame df = new DataFrame(dsName);   // dsName is for join/union to display the dataset name instead of id)

    try {
      df.setByJDBC(stmt, sql, prepProperties.getSamplingLimitRows());
    } catch (TeddyException e) {
      LOGGER.error("loadStageDBDataset(): TeddyException occurred", e);
      throw PrepException.fromTeddyException(e);
    }

    return createStage0(pc, dsId, df);
  }

  public DataFrame loadKafkaDataset(PrepContext pc, PrDataset wrangledDataset, PrDataset importedDataset)
          throws PrepException {
    DataFrame df = kafkaService.createDataFrame(importedDataset, prepProperties.getSamplingLimitRows());
    return createStage0(pc, wrangledDataset.getDsId(), df);
  }

  public DataFrame loadJdbcDataFrame(DataConnection dataConnection, String sql, int limit, String dsName) {
    JdbcAccessor jdbcDataAccessor = DataConnectionHelper.getAccessor(dataConnection);
    Connection conn;
    Statement stmt = null;

    try {
      conn = jdbcDataAccessor.getConnection();
      stmt = conn.createStatement();
      stmt.setFetchSize(prepProperties.getSamplingMaxFetchSize());
    } catch (SQLException e) {
      e.printStackTrace();
    }

    DataFrame df = new DataFrame(dsName);   // dsName is for join/union to display the dataset name instead of id)

    try {
      df.setByJDBC(stmt, sql, limit);
    } catch (TeddyException e) {
      LOGGER.error("loadJdbaDataFrame(): TeddyException occurred", e);
      throw PrepException.fromTeddyException(e);
    }

    return df;
  }

  public DataFrame loadJdbcDataset(PrepContext pc, String dsId, DataConnection dataConnection, String sql,
          String dsName)
          throws PrepException {
    DataFrame df = loadJdbcDataFrame(dataConnection, sql, prepProperties.getSamplingLimitRows(), dsName);
    return createStage0(pc, dsId, df);
  }
}
