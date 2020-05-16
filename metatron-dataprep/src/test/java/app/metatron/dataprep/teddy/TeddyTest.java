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

package app.metatron.dataprep.teddy;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

import app.metatron.dataprep.file.PrepCsvUtil;
import app.metatron.dataprep.file.PrepParseResult;
import app.metatron.dataprep.teddy.exceptions.TeddyException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class TeddyTest {

  public static Map<String, PrepParseResult> grids = new HashMap<>();

  private static String getResourcePath(String relPath, boolean fromHdfs) {
    if (fromHdfs) {
      throw new IllegalArgumentException("HDFS not supported yet");
    }
    URL url = DataFrameTest.class.getClassLoader().getResource(relPath);
    return url.toString();
  }

  private static String getResourcePath(String relPath) {
    return getResourcePath(relPath, false);
  }
}
