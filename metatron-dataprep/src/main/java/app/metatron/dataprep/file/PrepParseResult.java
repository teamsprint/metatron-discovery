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

package app.metatron.dataprep.file;

import java.util.ArrayList;
import java.util.List;

public class PrepParseResult {

  public List<String[]> grid;
  public List<String> colNames;

  // Used only in PrepCsvUtil.parse() when onlyCount is true
  public long totalRows;
  public long totalBytes;

  public PrepParseResult() {
    grid = new ArrayList<>();
    totalRows = 0L;
    totalBytes = 0L;
  }
}
