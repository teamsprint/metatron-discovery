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

import static app.metatron.dataprep.SourceDesc.Type.URI;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class SourceDesc {

  public enum Type {
    URI,
    DATABASE,
    STAGE_DB
  }

  // Common properties
  private Type type;
  private Integer limit;

  // File kinds
  private String strUri;
  private String delim;
  private String quoteChar;
  private Integer colCnt;

  // Hadoop special
  private String hadoopConfDir;

  // DB kinds
  private String driver;
  private String connStr;
  private String user;
  private String pw;
  private String dbName;
  private String tblName;
  private String queryStmt;
  private Integer fetchCnt;

  // All extra information, like dsId, dsName, and so on, in a JSON form.
  private String custom;

  private List<String> ruleStrs;
  private List<SourceDesc> upstreams;

  private String dsId;  // W.DS ID for join, union

  public SourceDesc() {
    this(URI);
  }

  public SourceDesc(Type type) {
    this.type = type;
    this.limit = 1000;

    switch (type) {
      case URI:
        delim = ",";
        quoteChar = "\"";
        break;
      case DATABASE:
        this.fetchCnt = 50;
        break;
      case STAGE_DB:
        break;
    }
  }

  public SourceDesc(String strType) {
    this(Type.valueOf(strType));
  }

  public Type getType() {
    return type;
  }

  public void setType(Type type) {
    this.type = type;
  }

  public Integer getLimit() {
    return limit;
  }

  public void setLimit(Integer limit) {
    this.limit = limit;
  }

  public String getStrUri() {
    return strUri;
  }

  public void setStrUri(String strUri) {
    this.strUri = strUri;
  }

  public String getDelim() {
    return delim;
  }

  public void setDelim(String delim) {
    this.delim = delim;
  }

  public String getQuoteChar() {
    return quoteChar;
  }

  public void setQuoteChar(String quoteChar) {
    this.quoteChar = quoteChar;
  }

  public Integer getColCnt() {
    return colCnt;
  }

  public void setColCnt(Integer colCnt) {
    this.colCnt = colCnt;
  }

  public String getHadoopConfDir() {
    return hadoopConfDir;
  }

  public void setHadoopConfDir(String hadoopConfDir) {
    this.hadoopConfDir = hadoopConfDir;
  }

  public String getDriver() {
    return driver;
  }

  public void setDriver(String driver) {
    this.driver = driver;
  }

  public String getConnStr() {
    return connStr;
  }

  public void setConnStr(String connStr) {
    this.connStr = connStr;
  }

  public String getUser() {
    return user;
  }

  public void setUser(String user) {
    this.user = user;
  }

  public String getPw() {
    return pw;
  }

  public void setPw(String pw) {
    this.pw = pw;
  }

  public String getDbName() {
    return dbName;
  }

  public void setDbName(String dbName) {
    this.dbName = dbName;
  }

  public String getTblName() {
    return tblName;
  }

  public void setTblName(String tblName) {
    this.tblName = tblName;
  }

  public String getQueryStmt() {
    return queryStmt;
  }

  public void setQueryStmt(String queryStmt) {
    this.queryStmt = queryStmt;
  }

  public Integer getFetchCnt() {
    return fetchCnt;
  }

  public void setFetchCnt(Integer fetchCnt) {
    this.fetchCnt = fetchCnt;
  }

  public String getCustom() {
    return custom;
  }

  public void setCustom(String custom) {
    this.custom = custom;
  }

  public List<String> getRuleStrs() {
    return ruleStrs;
  }

  public void setRuleStrs(List<String> ruleStrs) {
    this.ruleStrs = ruleStrs;
  }

  public List<SourceDesc> getUpstreams() {
    return upstreams;
  }

  public void setUpstreams(List<SourceDesc> upstreams) {
    this.upstreams = upstreams;
  }

  public String getDsId() {
    return dsId;
  }

  public void setDsId(String dsId) {
    this.dsId = dsId;
  }

  public void setByMap(Map<String, Object> map) {
    List<Object> upstreams = (List<Object>) map.get("upstreams");
    if (upstreams != null) {
      for (Object upstream : upstreams) {
        if (this.upstreams == null) {
          this.upstreams = new ArrayList<>();
        }
        SourceDesc src = new SourceDesc();
        src.setByMap((Map<String, Object>) upstream);
        this.upstreams.add(src);
      }
    }

    setStrUri((String) map.get("strUri"));
    if (map.get("delim") != null) {
      setDelim((String) map.get("delim"));
    }
    if (map.get("quoteChar") != null) {
      setQuoteChar((String) map.get("quoteChar"));
    }
    setHadoopConfDir((String) map.get("hadoopConfDir"));
    setDriver((String) map.get("driver"));
    setConnStr((String) map.get("connStr"));
    setUser((String) map.get("user"));
    setPw((String) map.get("pw"));
    setDbName((String) map.get("dbName"));
    setTblName((String) map.get("tblName"));
    setQueryStmt((String) map.get("queryStmt"));
    setCustom((String) map.get("custom"));
    setDsId((String) map.get("dsId"));

    String type = (String) map.get("type");
    if (type != null) {
      setType(Type.valueOf(type));
    }

    Integer limit = (Integer) map.get("limit");
    if (limit != null) {
      setLimit(limit);
    }

    String colCnt = (String) map.get("colCnt");
    if (colCnt != null) {
      setColCnt(Integer.valueOf(colCnt));
    }

    Integer fetchCnt = (Integer) map.get("fetchCnt");
    if (fetchCnt != null) {
      setFetchCnt(fetchCnt);
    }

    List<String> ruleStrs = (List<String>) map.get("ruleStrs");
    if (ruleStrs != null) {
      this.ruleStrs = new ArrayList<>();
      this.ruleStrs.addAll(ruleStrs);
    }
  }

  @Override
  public String toString() {
    return "SourceDesc{" +
            "type=" + type +
            ", limit=" + limit +
            ", strUri='" + strUri + '\'' +
            ", delim='" + delim + '\'' +
            ", quoteChar='" + quoteChar + '\'' +
            ", colCnt=" + colCnt +
            ", hadoopConfDir='" + hadoopConfDir + '\'' +
            ", driver='" + driver + '\'' +
            ", connStr='" + connStr + '\'' +
            ", user='" + user + '\'' +
            ", pw='" + pw + '\'' +
            ", dbName='" + dbName + '\'' +
            ", tblName='" + tblName + '\'' +
            ", queryStmt='" + queryStmt + '\'' +
            ", fetchCnt=" + fetchCnt +
            ", custom='" + custom + '\'' +
            ", ruleStrs=" + ruleStrs +
            ", upstreams=" + upstreams +
            ", dsId='" + dsId + '\'' +
            '}';
  }
}
