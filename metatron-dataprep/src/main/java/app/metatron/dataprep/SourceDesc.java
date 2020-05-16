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
}
