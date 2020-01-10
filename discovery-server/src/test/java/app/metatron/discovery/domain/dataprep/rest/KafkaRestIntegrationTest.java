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

import app.metatron.discovery.AbstractRestIntegrationTest;
import app.metatron.discovery.core.oauth.OAuthRequest;
import app.metatron.discovery.core.oauth.OAuthTestExecutionListener;
import app.metatron.discovery.domain.dataprep.kafka.KafkaContext;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import com.facebook.presto.jdbc.internal.jackson.core.JsonProcessingException;
import com.jayway.restassured.RestAssured;
import java.net.URISyntaxException;
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

  private KafkaContext kafka;

  @Before
  public void setUp() throws URISyntaxException, TeddyException {
    RestAssured.port = serverPort;
    kafka = new KafkaContext();
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void test_add_csv() throws JsonProcessingException {
    kafka.addCsvMessages(10000);
    return;
  }
}
