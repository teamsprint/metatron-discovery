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

import static app.metatron.dataprep.TestUtil.getResourcePath;

import app.metatron.dataprep.PrepContext;
import java.io.IOException;
import java.net.URISyntaxException;
import org.junit.Test;

public class JobSpecTest {

  private static PrepContext pc;

  @Test
  public void single() throws IOException, URISyntaxException {
    JobSpec job = JobSpec.readJson(getResourcePath("jobspec/single_recipe.json"));
    System.out.print(job);
  }

  @Test
  public void multi() throws IOException, URISyntaxException {
    JobSpec job = JobSpec.readJson(getResourcePath("jobspec/multi_recipe.json"));
    System.out.print(job);
  }

  @Test
  public void complex() throws IOException, URISyntaxException {
    JobSpec job = JobSpec.readJson(getResourcePath("jobspec/marketing_union.json"));
    System.out.print(job);
  }
}
