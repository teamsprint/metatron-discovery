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

import static app.metatron.dataprep.exception.PrepMessageKey.MSG_DP_ALERT_FAILED_TO_PARSE_SQL;
import static app.metatron.dataprep.util.PrepUtil.datasetError;

import com.google.common.collect.Lists;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.Reader;
import org.apache.hadoop.conf.Configuration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PrepSqlUtil extends PrepFileUtil {

  private static Logger LOGGER = LoggerFactory.getLogger(PrepSqlUtil.class);

  private static void readSql(Reader reader, int limitRows, Integer manualColCnt, boolean onlyCount,
          PrepParseResult result) {
    Integer colCnt = manualColCnt != null ? manualColCnt : null;

    String line;

    BufferedReader br = new BufferedReader(reader);

    try {
      result.colNames = Lists.newArrayList("SQL_STATEMENTS");

      while ((line = br.readLine()) != null && result.totalRows < limitRows) {
        if (onlyCount) {
          result.totalRows++;
          continue;
        }
        String[] row = {line.toString()};
        result.grid.add(row);
      }
    } catch (IOException e) {
      e.printStackTrace();
      throw datasetError(MSG_DP_ALERT_FAILED_TO_PARSE_SQL);
    }
  }

  /**
   * @param strUri URI as String (to be java.net.URI)
   * @param limitRows Read not more than this
   * @param manualColCnt Manually set column count from UI
   * @param conf Hadoop configuration which is mandatory when the url's protocol is hdfs
   * @param onlyCount If true, just fill result.totalRows and result.totalBytes
   * @return PrepParseResult: grid, colNames
   */
  public static PrepParseResult parse(String strUri, int limitRows, Integer manualColCnt, Configuration conf,
          boolean onlyCount) {
    PrepParseResult result = new PrepParseResult();

    LOGGER.debug("PrepSqlUtil.parse(): strUri={} conf={}", strUri, conf);

    Reader reader = PrepSqlUtil.getReader(strUri, conf, onlyCount, result);
    readSql(reader, limitRows, manualColCnt, onlyCount, result);

    return result;
  }

  public static PrepParseResult parse(String strUri, int limitRows, Integer manualColCnt, Configuration conf) {
    return parse(strUri, limitRows, manualColCnt, conf, false);
  }
}
