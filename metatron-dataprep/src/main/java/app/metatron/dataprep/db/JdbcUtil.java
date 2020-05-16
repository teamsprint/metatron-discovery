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

package app.metatron.dataprep.db;

import java.sql.SQLException;
import java.sql.Statement;

public class JdbcUtil {

  public static String getDriverByConnStr(String connStr) {
    if (connStr.startsWith("jdbc:mysql:")) {
      return "com.mysql.jdbc.Driver";
    } else if (connStr.startsWith("jdbc:postgresql:")) {
      return "org.postgresql.Driver";
    } else if (connStr.startsWith("jdbc:oracle:")) {
      return "oracle.jdbc.driver.OracleDriver";
    } else if (connStr.startsWith("jdbc:hive2:")) {
      return "org.apache.hadoop.hive.jdbc.HiveDriver";
    }
    throw new IllegalArgumentException(connStr);
  }

  public static char getIdentifierQuoteChar(String driver) {
    switch (driver) {
      case "oracle.jdbc.driver.OracleDriver":
      case "org.postgresql.Driver":
        return '"';
      case "com.mysql.jdbc.Driver":
      case "org.apache.hadoop.hive.jdbc.HiveDriver":
      default:
        break;
    }
    return '`';
  }

  public static String getDbTypeOfString(String driver) {
    switch (driver) {
      case "oracle.jdbc.driver.OracleDriver":
        return "clob";
      case "org.postgresql.Driver":
        return "text";
      case "com.mysql.jdbc.Driver":
        return "longtext";
      case "org.apache.hadoop.hive.jdbc.HiveDriver":
        return "string";
      default:
        break;
    }
    return "text";  // MS SQL Server uses this
  }

  public static String getDbTypeOfLong(String driver) {
    switch (driver) {
      case "oracle.jdbc.driver.OracleDriver":
      case "org.postgresql.Driver":
        return "numeric";
      case "com.mysql.jdbc.Driver":
      case "org.apache.hadoop.hive.jdbc.HiveDriver":
        return "bigint";
      default:
        break;
    }
    return "int";   // MS SQL Server uses this
  }

  public static String getDbTypeOfDouble(String driver) {
    switch (driver) {
      case "oracle.jdbc.driver.OracleDriver":
      case "org.postgresql.Driver":
        return "numeric";
      case "com.mysql.jdbc.Driver":
      case "org.apache.hadoop.hive.jdbc.HiveDriver":
      default:
        break;
    }
    return "double";
  }

  public static String getDbTypeOfBoolean(String driver) {
    switch (driver) {
      case "oracle.jdbc.driver.OracleDriver":
        return "number";
      case "org.postgresql.Driver":
      case "com.mysql.jdbc.Driver":
      case "org.apache.hadoop.hive.jdbc.HiveDriver":
        return "boolean";
      default:
        break;
    }
    return "bit";   // MS SQL Server uses this
  }

  public static String getTblRenameSql(String driver, String srcDbTbl, String targetDbTbl) {
    switch (driver) {
      case "com.mysql.jdbc.Driver":
        return String.format("RENAME TABLE %s TO %s", srcDbTbl, targetDbTbl);
      case "oracle.jdbc.driver.OracleDriver":
      case "org.postgresql.Driver":
      case "org.apache.hadoop.hive.jdbc.HiveDriver":
      default:
        break;
    }
    return String.format("ALTER TABLE %s RENAME TO %s", srcDbTbl, targetDbTbl);
  }

  public static void dropTblSuppressed(Statement stmt, String dbTblName) {
    try {
      stmt.execute("DROP TABLE " + dbTblName);
    } catch (SQLException e) {
    }
  }
}
