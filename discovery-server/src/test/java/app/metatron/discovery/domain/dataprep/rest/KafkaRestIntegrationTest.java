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

package app.metatron.discovery.domain.dataprep.rest;

import static com.jayway.restassured.RestAssured.given;
import static org.junit.Assert.assertEquals;

import app.metatron.discovery.AbstractRestIntegrationTest;
import app.metatron.discovery.core.oauth.OAuthRequest;
import app.metatron.discovery.core.oauth.OAuthTestExecutionListener;
import app.metatron.discovery.domain.dataprep.entity.PrDataset.DS_TYPE;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import com.facebook.presto.jdbc.internal.jackson.core.JsonProcessingException;
import com.jayway.restassured.RestAssured;
import com.jayway.restassured.http.ContentType;
import com.jayway.restassured.response.Response;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.http.HttpStatus;
import org.junit.Before;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.test.context.TestExecutionListeners;

@TestExecutionListeners(value = OAuthTestExecutionListener.class, mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
public class KafkaRestIntegrationTest extends AbstractRestIntegrationTest {

  private static final Logger LOGGER = LoggerFactory.getLogger(KafkaRestIntegrationTest.class);

  @Value("${local.server.port}")
  private int serverPort;

  @Before
  public void setUp() throws URISyntaxException, TeddyException {
    RestAssured.port = serverPort;
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void test_dummy() throws JsonProcessingException {
  }

  //  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void test_create_kafka_dataset() throws JsonProcessingException {
    Map<String, Object> body = new HashMap();
    body.put("dsName", "kafka ds");
    body.put("dsDesc", "dataset with kafka");
    body.put("dsType", "IMPORTED");
    body.put("importType", "KAFKA");
    body.put("dbName", "localhost:9092");   // Use dbName column as bootstrap.servers parameter
    body.put("tblName", "test");            // Use tblName column as topic name

    // CREATE DATASET
    Response response = given()
            .auth()
            .oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .accept(ContentType.JSON)
            .when()
            .content(body)
            .post("/api/preparationdatasets")
            .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all()
            .extract()
            .response();

    body = new HashMap();
    body.put("dfName", "kafka df");
    body.put("dfDesc", "dataflow with kafka");

    List<String> datasets = new ArrayList();
    datasets.add(response.path("_links.self.href"));
    body.put("datasets", datasets);

    // CREATE DATAFLOW
    response = given()
            .auth()
            .oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .accept(ContentType.JSON)
            .when()
            .content(body)
            .post("/api/preparationdataflows")
            .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all()
            .extract()
            .response();

    List<HashMap<String, Object>> dsInfos = response.path("datasets");
    String wrangledDsId = null;
    for (HashMap dsInfo : dsInfos) {
      if (dsInfo.get("dsType").equals(DS_TYPE.WRANGLED.name())) {
        wrangledDsId = (String) dsInfo.get("dsId");
        break;
      }
    }
    assert wrangledDsId != null : response;

    // TRANSFORM
    String rule0 = "rename col: column1 to 'c1'";
    String rule1 = "split col: c1 on: ',' limit: 4";
    String rule2 = "rename col: split_c11, split_c12, split_c13, split_c14 to: 'seq', 'ingest_ts', 'uid', 'birth'";

    response = transform(wrangledDsId, "APPEND", 0, rule0);
    response = transform(wrangledDsId, "APPEND", 1, rule1);
    response = transform(wrangledDsId, "APPEND", 2, rule2);

    assertEquals(Integer.valueOf(3), response.path("ruleCurIdx"));
  }

  private Response transform(String wrangledDsId, String op, int ruleIdx, String ruleString) {
    Map<String, Object> request = new HashMap();

    request.put("count", 100);
    request.put("op", op);
    request.put("ruleIdx", ruleIdx);
    request.put("ruleString", ruleString);

    Response response = given()
            .auth()
            .oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .accept(ContentType.JSON)
            .when()
            .content(request)
            .put("/api/preparationdatasets/" + wrangledDsId + "/transform")
            .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all()
            .extract()
            .response();

    assert response.path("errorMsg") == null : response;
    return response;
  }
}
