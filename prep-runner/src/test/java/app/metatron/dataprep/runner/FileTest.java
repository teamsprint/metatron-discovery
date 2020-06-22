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

package app.metatron.dataprep.runner;

import static app.metatron.dataprep.runner.TestUtil.getResourceUrl;

import app.metatron.dataprep.teddy.exceptions.TeddyException;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.junit.Test;

public class FileTest {

  @Test
  public void testBasic() throws URISyntaxException, IOException, TeddyException {
    List<String> args = new ArrayList<>();
    args.addAll(Arrays.asList("--job-spec-file", TestUtil.getResourceUrl("jobspec/file.json")));
    args.addAll(Arrays.asList("--src-type", "URI", "--src-uri", getResourceUrl("csv/sales_named.csv")));
    args.addAll(Arrays.asList("--target-type", "URI", "--target-uri", "file:///tmp/test_output.csv", "-v"));
    PrepRunner.run(args.toArray(new String[0]));
  }

//  @Test
  public void testHdfs() throws URISyntaxException, IOException, TeddyException {
    // Prepare this manually before the test.
    String srcUri = "hdfs://localhost/tmp/sales_named.csv";
    String targetUri = "hdfs://localhost/tmp/test_output.csv";

    List<String> args = new ArrayList<>();
    args.addAll(Arrays.asList("--job-spec-file", TestUtil.getResourceUrl("jobspec/hdfs.json")));
    args.addAll(Arrays.asList("--src-type", "URI", "--src-uri", srcUri));
    args.addAll(Arrays.asList("--target-type", "URI", "--target-uri", targetUri, "-v"));
    PrepRunner.run(args.toArray(new String[0]));
  }
}
