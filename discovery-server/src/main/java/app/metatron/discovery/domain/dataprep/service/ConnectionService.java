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
package app.metatron.discovery.domain.dataprep.service;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.datasource.DataType;
import app.metatron.discovery.common.exception.FunctionWithException;
import app.metatron.discovery.domain.dataprep.entity.Dataset;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.dataprep.teddy.DataFrame;
import app.metatron.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.SelectQueryBuilder;
import app.metatron.discovery.domain.dataprep.repository.ConnectionRepository;
import app.metatron.discovery.domain.dataprep.repository.DatasetRepository;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.querydsl.core.types.Predicate;

import app.metatron.discovery.domain.dataprep.entity.Connection;
import app.metatron.discovery.domain.dataprep.util.ConnectionUtil;
import org.apache.commons.lang3.StringUtils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.joda.time.DateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;

import java.sql.*;
import java.util.*;


@Service
@Transactional
public class ConnectionService {

    private static Logger LOGGER = LoggerFactory.getLogger(ConnectionService.class);
    private static final String ANONYMOUS_COLUMN_PREFIX = "anonymous";
    private static final String RESULTSET_COLUMN_PREFIX = SelectQueryBuilder.TEMP_TABLE_NAME + ".";

    @Autowired
    private ConnectionRepository connectionRepository;

    @Autowired
    private DatasetRepository datasetRepository;


    public void patchAllowedOnly(Connection connection, Connection patchConnection) {
        // Only a few fields are allowed to be changed.
        // It can be changed.
        List<String> allowKeys = Lists.newArrayList();
        allowKeys.add("name");
        allowKeys.add("description");

        List<String> ignoreKeys = Lists.newArrayList();
        ignoreKeys.add("connId");

        if (patchConnection.getName() != null) {
            connection.setName(patchConnection.getName());
        }
        if (patchConnection.getDescription() != null) {
            connection.setDescription(patchConnection.getDescription());
        }

        ObjectMapper objectMapper = GlobalObjectMapper.getDefaultMapper();
        Map<String, Object> mapDataset = objectMapper.convertValue(patchConnection, Map.class);
        for (String key : mapDataset.keySet()) {
            if (false == ignoreKeys.contains(key)) {
                continue;
            }

            if (false == allowKeys.contains(key)) {
                LOGGER.debug("'" + key + "' of connection is an attribute to which patch is not applied");
            }
        }
    }




    public Map<String, Object> checkConnection(Connection connection) {
        Map<String, Object> resultMap = Maps.newHashMap();
        resultMap.put("connected", true);

        java.sql.Connection conn = null;
        Statement stmt = null;
        try {
            conn = this.getConnection(connection);
            stmt = conn.createStatement();
            stmt.execute(ConnectionUtil.getTestQuery(connection.getImplementor()));
        } catch (Exception e) {
            LOGGER.error("Fail to check query : {}", e.getMessage());
            resultMap.put("connected", false);
            resultMap.put("message", e.getMessage());
        } finally { if(conn!=null) { try{ conn.close(); }catch (Exception e) { LOGGER.error(e.getMessage()); }}}
        return resultMap;
    }


    public Map<String, Object> getDatabases(Connection connection) {
        List<String> dataBaseNames = Lists.newArrayList();
        Map<String, Object> databaseMap = Maps.newHashMap();
        java.sql.Connection conn = null;
        Statement stmt = null;
        ResultSet rs = null;
        try {
            conn = this.getConnection(connection);
            if("HIVE".equals(connection.getImplementor())) {
                rs =  conn.getMetaData().getSchemas();
            }else{
                stmt = conn.createStatement();
                rs = stmt.executeQuery(ConnectionUtil.getDataBaseQuery(connection));
            }

            while (rs.next()) {
                dataBaseNames.add(rs.getString(1));
            }
        } catch (Exception e) {
            LOGGER.error("Fail to getDatabases : {}", e.getMessage());
        } finally { if(conn!=null) { try{ conn.close(); }catch (Exception e) { LOGGER.error(e.getMessage()); }}}

        databaseMap.put("databases", dataBaseNames);
        databaseMap.put("page", createPageInfoMap(dataBaseNames.size(), dataBaseNames.size(), 0));
        return databaseMap;
    }

    public Map<String, Object> getTableNames(Connection connection, String databaseName) {
        List<Map<String, String>> tableInfos = Lists.newArrayList();

        java.sql.Connection conn = null;
        Statement stmt = null;
        ResultSet rs = null;
        Map<String, String> tableInfo  = null;
        try{
            conn = this.getConnection(connection);
            if("HIVE".equals(connection.getImplementor())) {
                rs = conn.getMetaData().getTables(databaseName,null,null,null);
                while (rs.next()) {
                    tableInfo = Maps.newHashMap();
                    // LOGGER.debug("SCHEMA: {} - NAME: {} - TYPE: {}", rs.getString(2), rs.getString(3), rs.getString(4));
                    String tableType = rs.getString(4);
                    if (!("TABLE".equals(tableType) || "VIEW".equals(tableType))) { continue; }
                    if(!databaseName.toLowerCase().equals(rs.getString(2))) { continue; }
                    tableInfo.put("name", rs.getString(3));
                    tableInfo.put("type", rs.getString(4));
                    tableInfo.put("comment", rs.getString(5));
                    tableInfos.add(tableInfo);
                }
            }else{
                stmt = conn.createStatement();
                rs = stmt.executeQuery(ConnectionUtil.getTableQuery(connection.getImplementor(), databaseName));
                while (rs.next()) {
                    tableInfo = Maps.newHashMap();
                    tableInfo.put("name", rs.getString(1));
                    tableInfo.put("type", rs.getString(2));
                    tableInfo.put("comment", rs.getString(3));
                    tableInfos.add(tableInfo);
                }
            }

        } catch (Exception e) {
            LOGGER.error("Fail to getTableNames : {}", e.getMessage());
        } finally { if(conn!=null) { try{ conn.close(); }catch (Exception e) { LOGGER.error(e.getMessage()); }}}
        Map<String, Object> tableMap = new LinkedHashMap<>();

        int tableCount = tableInfos.size();
        tableMap.put("tables", tableInfos);
        tableMap.put("page", createPageInfoMap(tableCount, tableCount, 0));
        return tableMap;
    }

    public ConnectionResultResponse selectQueryForPreview(Connection connection, String schema, String type, String query, int limit, boolean extractColumnName) {
        if("TABLE".equals(type)) {
            query = "SELECT * FROM " + schema + "." + query;
        }
        java.sql.Connection conn = null;
        Statement stmt = null;
        ResultSet rs = null;
        ConnectionResultResponse queryResultSet = null;
        try{
            conn = this.getConnection(connection);
            stmt = conn.createStatement();

            if (limit > 0)
                stmt.setMaxRows(limit);

            rs = stmt.executeQuery(query);
            queryResultSet = getJdbcQueryResult(rs, extractColumnName);

        }catch (Exception e) {
            LOGGER.error("Fail to selectQueryForPreview : {}", e.getMessage());
        } finally { if(conn!=null) { try{ conn.close(); }catch (Exception e) { LOGGER.error(e.getMessage()); }}}

        return queryResultSet;
    }

    public ConnectionResultResponse getJdbcQueryResult(ResultSet rs, boolean extractColumnName) throws SQLException {
        List<Field> fields = getFieldList(rs, extractColumnName);
        List<Map<String, Object>> data = getDataList(rs, fields, null);
        return new ConnectionResultResponse(fields, data);
    }

    public DataFrame getPreviewLinesFromJdbcForDataFrame(Dataset dataset, String size) {
        DataFrame dataFrame;
        String connId = dataset.getConnId();
        Connection connection = this.connectionRepository.findOne(connId);

        Long totalCount = 0L;
        if(connection == null) {
            dataset.setTotalLines(totalCount);
            return null;
        }

        int limit = Integer.parseInt(size);
        String sql = dataset.getRsType() == Dataset.RS_TYPE.QUERY ? dataset.getQueryStmt() :
                "SELECT * FROM " + dataset.getDbName() + "." + dataset.getTblName();
        // String sql = dataset.getQueryStmt();
        java.sql.Connection conn = null;
        Statement stmt = null;
        try{
            conn = this.getConnection(connection);
            stmt = conn.createStatement();
            if (limit > 0)
                stmt.setMaxRows(limit);
        }catch (Exception e) {
            LOGGER.error("Fail to getPreviewLinesFromJdbcForDataFrame : {}", e.getMessage());
        }

        DataFrame df = new DataFrame(dataset.getName());
        try {
            df.setByJDBC(stmt, sql, limit);
        } catch (TeddyException e) {
            LOGGER.error("loadJdbaDataFrame(): TeddyException occurred", e);
            throw PrepException.fromTeddyException(e);
        } finally { if(conn!=null) { try{ conn.close(); }catch (Exception e) { LOGGER.error(e.getMessage()); }}}

        // ????
        countTotalLines(dataset, connection, sql);

        return df;
    }

    public DataFrame loadJdbcDataFrame(Connection connection, String sql, int limit, String recipeName) {
        java.sql.Connection conn = null;
        Statement stmt = null;
        try{
            conn = this.getConnection(connection);
            stmt = conn.createStatement();
            if (limit > 0)
                stmt.setMaxRows(limit);
        }catch (Exception e) {
            LOGGER.error("Fail to loadJdbcDataFrame : {}", e.getMessage());
        }
        DataFrame df = new DataFrame(recipeName);
        try {
            df.setByJDBC(stmt, sql, limit);
        } catch (TeddyException e) {
            LOGGER.error("loadJdbaDataFrame(): TeddyException occurred", e);
            throw PrepException.fromTeddyException(e);
        } finally { if(conn!=null) { try{ conn.close(); }catch (Exception e) { LOGGER.error(e.getMessage()); }}}
        return df;
    }




    public void countTotalLines(Dataset dataset, Connection connection, String sql) {
        Integer totalLines = 0;
        java.sql.Connection conn = null;
        Statement stmt = null;

        try{
            conn = this.getConnection(connection);
            stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT count(*) from (" + sql + ") AS query_stmt");
            while (rs.next()) {
                totalLines = rs.getInt(1);
                break;
            }
            if (totalLines != null) {
                dataset.setTotalLines(totalLines.longValue());
                datasetRepository.saveAndFlush(dataset);
            }
        }catch (Exception e) {
            LOGGER.error("Fail to getPreviewLinesFromJdbcForDataFrame : {}", e.getMessage());
        } finally { if(conn!=null) { try{ conn.close(); }catch (Exception e) { LOGGER.error(e.getMessage()); }}}

    }


    public List<Field> getFieldList(ResultSet rs, boolean extractColumnName) throws SQLException {
        ResultSetMetaData metaData = rs.getMetaData();

        int colNum = metaData.getColumnCount();

        List<Field> fields = Lists.newArrayList();
        for (int i = 1; i <= colNum; i++) {

            String columnLabel = metaData.getColumnLabel(i);

            if (StringUtils.isEmpty(columnLabel)) {
                columnLabel = ANONYMOUS_COLUMN_PREFIX + i;
            }

            String fieldName;

            if (extractColumnName) {
                fieldName = extractColumnName(columnLabel);
            } else {
                fieldName = removeDummyPrefixColumnName(columnLabel);
            }
            Field field = new Field();
            field.setName(fieldName);
            field.setOriginalName(fieldName);
            field.setSqlName(columnLabel);
            field.setType(DataType.jdbcToFieldType((metaData.getColumnType(i))));
            field.setRole(field.getType().toRole());
            fields.add(field);
        }
        Field.checkDuplicatedField(fields, true);
        return fields;
    }

    public List<Map<String, Object>> getDataList(ResultSet rs,
                                                 List<Field> fields,
                                                 FunctionWithException<Object, Object, SQLException> objectConverter)
            throws SQLException {
        ResultSetMetaData metaData = rs.getMetaData();
        int colNum = metaData.getColumnCount();

        List<Map<String, Object>> dataList = Lists.newArrayList();
        while (rs.next()) {
            Map<String, Object> rowMap = Maps.newLinkedHashMap();
            for (int i = 1; i <= colNum; i++) {
                String fieldName = fields.get(i - 1).getName();
                Object resultObject = rs.getObject(i);
                if (objectConverter != null) {
                    rowMap.put(fieldName, objectConverter.apply(resultObject));
                } else {
                    rowMap.put(fieldName, resultObject);
                }
            }
            dataList.add(rowMap);
        }
        return dataList;
    }


    public Page<Connection> findConnectionByFilter(
            List<String> implementors,
            DateTime createdTimeFrom,
            DateTime createdTimeTo,
            DateTime modifiedTimeFrom,
            DateTime modifiedTimeTo,
            String containsText,
            Pageable pageable){
        // Get Predicate
        Predicate searchPredicated = ConnectionUtil.searchList(implementors, createdTimeFrom, createdTimeTo, modifiedTimeFrom, modifiedTimeTo, containsText);
        // Find by predicated
        Page<Connection> connectionPage = connectionRepository.findAll(searchPredicated, pageable);
        return connectionPage;
    }

    /**
     * Remove prefix for dummy table
     */
    private String removeDummyPrefixColumnName(String name) {
        return StringUtils.removeStartIgnoreCase(name, RESULTSET_COLUMN_PREFIX);
    }
    /**
     * Remove table name
     */
    private String extractColumnName(String name) {
        if (StringUtils.contains(name, ".")) {
            return StringUtils.substring(name, StringUtils.lastIndexOf(name, ".") + 1, name.length());
        }
        return name;
    }

    protected Map<String, Integer> createPageInfoMap(int size, int totalElements, int page) {
        Map<String, Integer> pageInfoMap = new HashMap<>();
        pageInfoMap.put("size", size);
        pageInfoMap.put("totalElements", totalElements);
        pageInfoMap.put("totalPages", (int) Math.ceil((double) totalElements / (double) size));
        pageInfoMap.put("number", page);
        return pageInfoMap;
    }

    private java.sql.Connection getConnection(Connection connection) {
        String driver_string = ConnectionUtil.getDriver(connection.getImplementor());
        String url = null;
        if(connection.getUrl() == null || connection.getUrl().isEmpty()) {
            url = ConnectionUtil.makeJdbcUrlBuilder(connection);
        }else{
            url = connection.getUrl();
        }
        Properties properties = new Properties();
        String userName = connection.getUsername();
        String password = connection.getPassword();
        if(StringUtils.isNotEmpty(userName)){ properties.setProperty("user", userName); }
        if(StringUtils.isNotEmpty(password)){ properties.setProperty("password", password); }
        try{
            Class.forName(driver_string);
            return DriverManager.getConnection(url, properties);
        } catch(ClassNotFoundException e){
            LOGGER.error("settingHiveConnection : " + e.getMessage());
        } catch (SQLException e){
            LOGGER.error("DriverManager.getConnection : " + e.getMessage());
        }
        return null;
    }



}
