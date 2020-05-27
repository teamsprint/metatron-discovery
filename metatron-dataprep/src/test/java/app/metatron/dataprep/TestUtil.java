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

package app.metatron.dataprep;

import static app.metatron.dataprep.SourceDesc.Type.DATABASE;
import static app.metatron.dataprep.SourceDesc.Type.URI;
import static app.metatron.dataprep.db.JdbcUtil.dropTblSuppressed;
import static app.metatron.dataprep.teddy.TeddyUtil.getDateTimeStr;

import app.metatron.dataprep.TargetDesc.Type;
import app.metatron.dataprep.exception.PrepException;
import app.metatron.dataprep.teddy.ColumnDescription;
import app.metatron.dataprep.teddy.ColumnType;
import app.metatron.dataprep.teddy.DataFrame;
import app.metatron.dataprep.teddy.Row;
import app.metatron.dataprep.teddy.exceptions.TeddyException;
import java.net.URL;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Types;
import java.util.List;
import org.apache.commons.io.FilenameUtils;

public class TestUtil {

  public static String getResourcePath(String relPath) {
    URL url = TestUtil.class.getClassLoader().getResource(relPath);
    return url.toString();
  }

  public static String loadCsv(PrepContext pc, String relPath, boolean autoType) {
    SourceDesc src = new SourceDesc(URI);
    src.setStrUri(getResourcePath(relPath));
    String dsId = pc.load(src, FilenameUtils.getBaseName(relPath));

    if (autoType) {
      DataFrame df = pc.fetch(dsId);
      List<String> ruleStrs = null;

      try {
        ruleStrs = pc.getAutoTypingRules(df);
      } catch (TeddyException e) {
        System.err.println(e.getMessage());
        assert false;
      }

      int stageIdx = 0;
      for (String ruleStr : ruleStrs) {
        pc.append(dsId, stageIdx++, ruleStr, null, true);   // suppress
      }
    }

    pc.fetch(dsId).show();
    return dsId;
  }

  public static String loadSalesNamed(PrepContext pc) {
    return loadCsv(pc, "sales_named.csv", true);
  }

  public static String loadSample(PrepContext pc) {
    return loadCsv(pc, "teddy/sample.csv", true);
  }

  public static String loadContract(PrepContext pc) {
    return loadCsv(pc, "teddy/contract.csv", true);
  }

  public static String loadStore(PrepContext pc) {
    return loadCsv(pc, "teddy/store.csv", true);
  }

  public static String loadProduct(PrepContext pc) {
    return loadCsv(pc, "teddy/product.csv", true);
  }

  public static String loadNullContained(PrepContext pc) {
    String dsId = loadCsv(pc, "teddy/null_contained.csv", false);

    pc.append(dsId, "header rownum: 1");
    pc.append(dsId, "set col: itemNo value: if(itemNo=='NULL', null, itemNo)");
    pc.append(dsId, "set col: name value: if(name=='NULL', null, name)");
    pc.append(dsId, "set col: speed value: if(speed=='NULL', null, speed)");
    pc.append(dsId, "settype col: itemNo type: long");
    pc.append(dsId, "settype col: speed type: long");
    pc.append(dsId, "settype col: weight type: long");

    return dsId;
  }

  public static String loadPivotTestMultipleColumn(PrepContext pc) {
    return loadCsv(pc, "teddy/pivot_test_multiple_column.csv", true);
  }

  public static String loadDateSample(PrepContext pc) {
    String dsId = loadCsv(pc, "teddy/date_sample.csv", false);

    pc.append(dsId, "header rownum: 1");
    pc.append(dsId, "settype col: birth_date type: timestamp format: 'MM.dd.yyyy HH:mm:ss'");
    pc.append(dsId, "set col: memo value: if(memo=='null', null, memo)");

    return dsId;
  }

  public static void append(PrepContext pc, String dsId, String ruleStr) {
    try {
      pc.append(dsId, ruleStr).show();
    } catch (PrepException e) {
      System.err.println(e.getMessageKey() + ": " + e.getMessageDetail());
      assert false;
    }
  }

  public static String loadTblSales(PrepContext pc) {
    SourceDesc src = new SourceDesc(DATABASE);
    src.setDriver("com.mysql.jdbc.Driver");
    src.setConnStr("jdbc:mysql://localhost:3306");
    src.setUser("polaris");
    src.setPw("polaris");
    src.setDbName("test");
    src.setTblName("sales");

    return pc.load(src, "sales from db");
  }

  public static void createSalesTbl() {
    String driver = "com.mysql.jdbc.Driver";
    String connStr = "jdbc:mysql://localhost:3306";
    String user = "polaris";
    String pw = "polaris";
    String dbName = "test";
    String tblName = "sales";
    String dbTblName = dbName + "." + tblName;

    // Just for test setup
    PrepContext pc = new PrepContext();
    String dsId = loadSalesNamed(pc);
    DataFrame df = pc.fetch(dsId);

    Connection conn = null;
    Statement stmt = null;
    try {
      Class.forName(driver);
      conn = DriverManager.getConnection(connStr, user, pw);
      stmt = conn.createStatement();
    } catch (ClassNotFoundException e) {
      e.printStackTrace();
    } catch (SQLException e) {
      e.printStackTrace();
    }

    dropTblSuppressed(stmt, dbTblName);

    try {
      StringBuilder sb = new StringBuilder();
      sb.append("CREATE TABLE " + dbTblName + " (");
      sb.append("contract_date text, ");
      sb.append("guaranty_days int, ");
      sb.append("due text, ");
      sb.append("result text, ");
      sb.append("ship_class text, ");
      sb.append("business text, ");
      sb.append("region text, ");
      sb.append("city text, ");
      sb.append("name text, ");
      sb.append("zip int, ");
      sb.append("description text, ");
      sb.append("state text, ");
      sb.append("prod_category text, ");
      sb.append("lat double, ");
      sb.append("lon double, ");
      sb.append("price double)");
      stmt.execute(sb.toString());
      stmt.close();

      sb.setLength(0);
      sb.append("INSERT INTO " + dbTblName + " (");
      sb.append("contract_date, ");
      sb.append("guaranty_days, ");
      sb.append("due, ");
      sb.append("result, ");
      sb.append("ship_class, ");
      sb.append("business, ");
      sb.append("region, ");
      sb.append("city, ");
      sb.append("name, ");
      sb.append("zip, ");
      sb.append("description, ");
      sb.append("state, ");
      sb.append("prod_category, ");
      sb.append("lat, ");
      sb.append("lon, ");
      sb.append("price) VALUES (");
      for (int i = 0; i < df.getColCnt(); i++) {
        sb.append("?, ");
      }
      sb.setLength(sb.length() - 2);
      sb.append(")");
      PreparedStatement pstmt = conn.prepareStatement(sb.toString());

      for (int rowno = 0; rowno < df.rows.size(); rowno++) {
        Row row = df.rows.get(rowno);
        for (int i = 0; i < df.getColCnt(); i++) {
          ColumnType type = df.getColType(i);
          Object obj = row.get(i);

          switch (type) {
            case STRING:
            case ARRAY:
            case MAP:
              pstmt.setString(i + 1, obj == null ? null : obj.toString());
              break;
            case TIMESTAMP:
              ColumnDescription colDesc = df.getColDesc(i);
              pstmt.setString(i + 1, obj == null ? null : getDateTimeStr(colDesc, obj));
              break;
            case LONG:
              pstmt.setLong(i + 1, (Long) obj);
              break;
            case DOUBLE:
              pstmt.setDouble(i + 1, (Double) obj);
              break;
            case BOOLEAN:
              if (pstmt.getMetaData().getColumnType(i + 1) == Types.NUMERIC) {
                Integer intObj = (Boolean) obj ? 1 : 0;
                pstmt.setInt(i + 1, intObj);
              } else {
                pstmt.setBoolean(i + 1, (Boolean) obj);
              }
              break;
            default:
              assert false;
          }
        }
        pstmt.executeUpdate();
      }

      pstmt.close();
    } catch (SQLException e) {
      e.printStackTrace();
    }
  }

  public static String loadFromMySql(PrepContext pc, String hostname, String tblName) {
    SourceDesc src = new SourceDesc(DATABASE);
    src.setDriver("com.mysql.jdbc.Driver");
    if (hostname.equals("c5")) {
      src.setConnStr("jdbc:mysql://c5:3306");
      src.setUser("polaris");
      src.setPw("Metatron123$");
      src.setDbName("campaign");
    } else {
      src.setConnStr("jdbc:mysql://localhost:3306");
      src.setUser("polaris");
      src.setPw("polaris");
      src.setDbName("test");
    }
    src.setTblName(tblName);

    String dsId = pc.load(src, tblName);
    pc.fetch(dsId).show();
    return dsId;
  }

  public static void saveToMySql(PrepContext pc, String dsId, String hostname, String tblName) {
    TargetDesc target = new TargetDesc(Type.DATABASE);
    target.setDriver("com.mysql.jdbc.Driver");
    if (hostname.equals("c5")) {
      target.setConnStr(String.format("jdbc:mysql://%s:3306", hostname));
      target.setUser("polaris");
      target.setPw("Metatron123$");
      target.setDbName("campaign");
    } else {
      target.setConnStr("jdbc:mysql://localhost:3306");
      target.setUser("polaris");
      target.setPw("polaris");
      target.setDbName("test");
    }
    target.setTblName(tblName);
    pc.save(dsId, target);
  }
}
