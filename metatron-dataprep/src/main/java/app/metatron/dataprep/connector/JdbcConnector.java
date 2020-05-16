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

package app.metatron.dataprep.connector;

import static app.metatron.dataprep.db.JdbcUtil.dropTblSuppressed;
import static app.metatron.dataprep.db.JdbcUtil.getDbTypeOfBoolean;
import static app.metatron.dataprep.db.JdbcUtil.getDbTypeOfDouble;
import static app.metatron.dataprep.db.JdbcUtil.getDbTypeOfLong;
import static app.metatron.dataprep.db.JdbcUtil.getDbTypeOfString;
import static app.metatron.dataprep.db.JdbcUtil.getIdentifierQuoteChar;
import static app.metatron.dataprep.db.JdbcUtil.getTblRenameSql;
import static app.metatron.dataprep.teddy.TeddyUtil.getDateTimeStr;

import app.metatron.dataprep.SourceDesc;
import app.metatron.dataprep.TargetDesc;
import app.metatron.dataprep.exception.PrepException;
import app.metatron.dataprep.teddy.ColumnDescription;
import app.metatron.dataprep.teddy.ColumnType;
import app.metatron.dataprep.teddy.DataFrame;
import app.metatron.dataprep.teddy.Row;
import app.metatron.dataprep.teddy.exceptions.TeddyException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Types;

public class JdbcConnector {

  private String driver;
  private String connStr;
  private String user;
  private String pw;
  private String dbName;
  private String tblName;
  private String queryStmt;
  private Integer fetchCnt;
  private Integer limitRows;

  private char quote;
  private String dbTblName;

  Connection conn;
  DataFrame df;

  public JdbcConnector() {
  }

  public JdbcConnector(SourceDesc src) {
    driver = src.getDriver();
    connStr = src.getConnStr();
    user = src.getUser();
    pw = src.getPw();
    dbName = src.getDbName();
    tblName = src.getTblName();
    queryStmt = src.getQueryStmt();
    fetchCnt = src.getFetchCnt();
    limitRows = src.getLimit();
    quote = getIdentifierQuoteChar(driver);

    if (queryStmt == null) {
      dbTblName = q(dbName) + "." + q(tblName);
      queryStmt = "SELECT * FROM " + dbTblName;
    }
  }

  public JdbcConnector(TargetDesc target) {
    driver = target.getDriver();
    connStr = target.getConnStr();
    user = target.getUser();
    pw = target.getPw();
    dbName = target.getDbName();
    tblName = target.getTblName();
    quote = getIdentifierQuoteChar(driver);
    dbTblName = q(dbName) + "." + q(tblName);
  }

  private String q(String str) {
    return quote + uq(str) + quote;
  }

  private String uq(String str) {
    if (str.length() <= 2) {
      return str;
    }

    if (str.startsWith(String.valueOf(quote)) && str.endsWith(String.valueOf(quote))) {
      str = str.substring(1, str.length() - 1);
    }
    return str;
  }

  private void connect() {
    if (conn == null) {
      try {
        Class.forName(driver);
        conn = DriverManager.getConnection(connStr, user, pw);
        conn.setAutoCommit(false);
      } catch (ClassNotFoundException e) {
        e.printStackTrace();
      } catch (SQLException e) {
        e.printStackTrace();
      }
    }
  }

  private Statement getStmt() {
    Statement stmt = null;

    connect();

    try {
      stmt = conn.createStatement();
      if (fetchCnt != null) {
        stmt.setFetchSize(fetchCnt);
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }

    return stmt;
  }

  private PreparedStatement getPreparedStmt(String tmpDbTblName) {
    PreparedStatement pstmt = null;
    StringBuilder sb = new StringBuilder();

    sb.append(String.format("INSERT INTO %s (", tmpDbTblName));
    for (int i = 0; i < df.getColCnt(); i++) {
      sb.append(q(df.getColName(i))).append(", ");
    }
    sb.setLength(sb.length() - 2);

    sb.append(") VALUES (");
    for (int i = 0; i < df.getColCnt(); i++) {
      sb.append("?, ");
    }
    sb.setLength(sb.length() - 2);
    sb.append(")");

    connect();

    try {
      pstmt = conn.prepareStatement(sb.toString());
    } catch (SQLException e) {
      e.printStackTrace();
    }

    return pstmt;
  }

  public void close() {
    try {
      conn.close();
    } catch (SQLException e) {
      e.printStackTrace();
    }
    conn = null;
  }

  public DataFrame load(String dsName) {
    Statement stmt = getStmt();

    DataFrame df = new DataFrame(dsName);
    try {
      df.setByJDBC(stmt, queryStmt, limitRows);
      stmt.close();
    } catch (TeddyException e) {
      e.printStackTrace();
      throw PrepException.fromTeddyException(e);
    } catch (SQLException e) {
      e.printStackTrace();
    }

    return df;
  }

  public void save(DataFrame df, boolean append) throws SQLException {
    this.df = df;
    if (append) {
      insertIntoTbl(dbTblName);
    } else {
      String tmpDbTblName = createTmpTbl();
      insertIntoTbl(tmpDbTblName);
      renameTbl(tmpDbTblName);
    }
  }

  private String createTmpTbl() throws SQLException {
    String tmpDbTblName = q(dbName) + "." + q(uq(tblName) + "_tmp");

    Statement stmt = getStmt();
    dropTblSuppressed(stmt, tmpDbTblName);
    StringBuilder sb = new StringBuilder();
    sb.append(String.format("CREATE TABLE %s (", tmpDbTblName));
    for (int i = 0; i < df.getColCnt(); i++) {
      String colName = df.getColName(i);
      sb.append(String.format("%s %s, ", q(colName), getDbTypeStr(df.getColType(i))));
    }
    sb.setLength(sb.length() - 2);
    sb.append(")");

    stmt.execute(sb.toString());
    stmt.close();

    return tmpDbTblName;
  }

  private void bindAllCols(PreparedStatement pstmt, Row row) throws SQLException {
    for (int i = 0; i < df.getColCnt(); i++) {
      ColumnType type = df.getColType(i);
      Object obj = row.get(i);

      switch (type) {
        case STRING:
        case ARRAY:
        case MAP:
          if (obj == null) {
            pstmt.setNull(i + 1, Types.VARCHAR);
          } else {
            pstmt.setString(i + 1, obj.toString());
          }
          break;
        case TIMESTAMP:
          if (obj == null) {
            pstmt.setNull(i + 1, Types.VARCHAR);
          } else {
            ColumnDescription colDesc = df.getColDesc(i);
            pstmt.setString(i + 1, getDateTimeStr(colDesc, obj));
          }
          break;
        case LONG:
          if (obj == null) {
            pstmt.setNull(i + 1, Types.BIGINT);
          } else {
            pstmt.setLong(i + 1, (Long) obj);
          }
          break;
        case DOUBLE:
          if (obj == null) {
            pstmt.setNull(i + 1, Types.DOUBLE);
          } else {
            pstmt.setDouble(i + 1, (Double) obj);
          }
          break;
        case BOOLEAN:
          if (obj == null) {
            pstmt.setNull(i + 1, Types.BOOLEAN);
          } else {
            pstmt.setBoolean(i + 1, (Boolean) obj);
          }
          break;
        case UNKNOWN:
          assert false;
      }
    }
  }

  private void insertIntoTbl(String dbTblName) throws SQLException {
    PreparedStatement pstmt = getPreparedStmt(dbTblName);

    for (int i = 0; i < df.rows.size(); i++) {
      bindAllCols(pstmt, df.rows.get(i));
      pstmt.addBatch();
      pstmt.clearParameters();

      if ((i + 1) % 1000 == 0) {
        pstmt.executeBatch();
        pstmt.clearBatch();
        //        conn.commit();          // leave on stop (Note: it's a tmp table)
      }
    }
    pstmt.executeBatch();
    pstmt.close();
    conn.commit();
  }

  public void renameTbl(String tmpDbTblName) throws SQLException {
    Statement stmt = getStmt();
    dropTblSuppressed(stmt, dbTblName);
    stmt.execute(getTblRenameSql(driver, tmpDbTblName, dbTblName));
  }

  private String getDbTypeStr(ColumnType colType) {
    switch (colType) {
      case STRING:
      case ARRAY:
      case MAP:
      case TIMESTAMP:
      case UNKNOWN:
        return getDbTypeOfString(driver);
      case LONG:
        return getDbTypeOfLong(driver);
      case DOUBLE:
        return getDbTypeOfDouble(driver);
      case BOOLEAN:
        return getDbTypeOfBoolean(driver);
    }
    assert false;
    return null;
  }
}
