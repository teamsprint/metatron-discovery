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

package app.metatron.dataprep.util;

import java.util.Map;

public class CallbackInfo {

  private String hostname;
  private int port;

  private String jobResultId;
  private String authToken;

  public CallbackInfo() {
    port = 8180;
  }

  public CallbackInfo(Map<String, Object> map) {
    this();
    hostname = (String) map.get("hostname");
    jobResultId = (String) map.get("jobResultId");
    authToken = (String) map.get("authToken");

    String port = (String) map.get("port");
    if (port != null) {
      this.port = Integer.valueOf(port);
    }
  }

  public CallbackInfo(String hostname, int port, String jobResultId, String authToken) {
    this.hostname = hostname;
    this.port = port;
    this.jobResultId = jobResultId;
    this.authToken = authToken;
  }

  public String getHostname() {
    return hostname;
  }

  public void setHostname(String hostname) {
    this.hostname = hostname;
  }

  public int getPort() {
    return port;
  }

  public void setPort(int port) {
    this.port = port;
  }

  public String getJobResultId() {
    return jobResultId;
  }

  public void setJobResultId(String jobResultId) {
    this.jobResultId = jobResultId;
  }

  public String getAuthToken() {
    return authToken;
  }

  public void setAuthToken(String authToken) {
    this.authToken = authToken;
  }
}
