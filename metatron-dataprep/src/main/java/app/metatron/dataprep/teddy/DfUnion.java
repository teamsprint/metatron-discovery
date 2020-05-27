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

import static app.metatron.dataprep.teddy.TeddyUtil.getColTypeListFromExpr;
import static app.metatron.dataprep.teddy.TeddyUtil.getIdentifierList;
import static app.metatron.dataprep.teddy.TeddyUtil.getStringList;

import app.metatron.dataprep.parser.rule.Rule;
import app.metatron.dataprep.parser.rule.Union;
import app.metatron.dataprep.parser.rule.expr.Expression;
import app.metatron.dataprep.teddy.exceptions.TeddyException;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class DfUnion extends DataFrame {

  private static Logger LOGGER = LoggerFactory.getLogger(DfUnion.class);

  public DfUnion(String dsName, String ruleString) {
    super(dsName, ruleString);
  }

  @Override
  public List<Object> prepare(DataFrame prevDf, Rule rule, List<DataFrame> slaveDfs) throws TeddyException {
    List<Object> preparedArgs = new ArrayList<>();

    Union union = (Union) rule;
    Expression masterCol = union.getMasterCol();
    Expression slaveCol = union.getSlaveCol();
    Expression type = union.getType();
    Expression format = union.getFormat();

    List<String> masterColNames = getIdentifierList(masterCol);
    List<String> slaveColNames = getStringList(slaveCol);
    List<ColumnType> colTypes = getColTypeListFromExpr(type);
    List<String> strFormats = getStringList(format);

    if (slaveColNames.size() == 0) {
      addColumnWithDfAll(prevDf);
    } else {
      for (int i = 0; i < masterColNames.size(); i++) {
        addColumnWithTimestampStyle(masterColNames.get(i), colTypes.get(i), strFormats.get(i));
      }
    }

    // Add the master dataset as one of the participants.
    slaveDfs.add(0, prevDf);

    preparedArgs.add(slaveDfs);
    preparedArgs.add(masterColNames);
    preparedArgs.add(slaveColNames);
    return preparedArgs;
  }

  @Override
  @SuppressWarnings("unchecked")
  public List<Row> gather(DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limit)
          throws InterruptedException {
    List<DataFrame> slaveDfs = (List<DataFrame>) preparedArgs.get(0);
    List<String> masterColNames = (List<String>) preparedArgs.get(1);
    List<String> slaveColNames = (List<String>) preparedArgs.get(2);

    List<Row> rows = new ArrayList<>();

    // Old style union which has only dataset2 -> Add the master dataset, too
    if (slaveColNames.size() == 0) {
      for (int rowno = offset; rowno < offset + length; cancelCheck(++rowno)) {
        if (rows.size() >= limit) {
          return rows;
        }
        rows.add(prevDf.rows.get(rowno));   // prevDf of Union rule is used for each slave datasets.
        cancelCheck(rows.size());
      }
      return rows;
    }

    // New style union which has slave column names, type, and so on.
    int colCnt = masterColNames.size();

    int slaveDfIdx = slaveDfs.indexOf(prevDf);
    LOGGER.debug("DfUnion(): add: slaveDfIdx={}", slaveDfIdx);

    for (int rowno = offset; rowno < offset + length; cancelCheck(++rowno)) {
      Row row = new Row(colCnt);

      for (int colno = 0; colno < colCnt; colno++) {
        Row slaveRow = prevDf.rows.get(rowno);
        int slaveColNameIdx = colno + slaveDfIdx * colCnt;
        String slaveColName = slaveColNames.get(slaveColNameIdx);
        row.add(masterColNames.get(colno), slaveRow.get(slaveColName));
      }
      rows.add(row);
    }
    return rows;
  }
}

