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

import static app.metatron.dataprep.TargetDesc.Type.URI;

public class TargetDesc {

  public enum Type {
    URI,
    DATABASE,
    STAGING_DB
  }

  // Common properties
  private Type type;
  private Integer limit;
  private boolean append;

  private String callbackUrl;
  private String oauthToken;

  // File kinds
  private String strUri;

  // Hadoop special
  private String hadoopConfDir;

  // DB kinds
  private String driver;
  private String connStr;
  private String user;
  private String pw;
  private String dbName;
  private String tblName;

  // All extra information, like dsId, dsName, and so on, in a JSON form.
  private String custom;

  public TargetDesc() {
    this(URI);
  }

  public TargetDesc(Type type) {
    this.type = type;
    this.limit = 1000;
    this.append = false;

    switch (type) {
      case URI:
        strUri = "/tmp/prep.csv";
        break;
      case DATABASE:
        break;
      case STAGING_DB:
        break;
    }
  }

  public TargetDesc(String strType) {
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

  public boolean isAppend() {
    return append;
  }

  public void setAppend(boolean append) {
    this.append = append;
  }

  public String getCallbackUrl() {
    return callbackUrl;
  }

  public void setCallbackUrl(String callbackUrl) {
    this.callbackUrl = callbackUrl;
  }

  public String getOauthToken() {
    return oauthToken;
  }

  public void setOauthToken(String oauthToken) {
    this.oauthToken = oauthToken;
  }

  public String getStrUri() {
    return strUri;
  }

  public void setStrUri(String strUri) {
    this.strUri = strUri;
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

  public String getCustom() {
    return custom;
  }

  public void setCustom(String custom) {
    this.custom = custom;
  }
}
