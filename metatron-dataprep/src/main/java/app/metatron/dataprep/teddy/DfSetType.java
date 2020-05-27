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

import static app.metatron.dataprep.teddy.TeddyUtil.getColTypeFromString;

import app.metatron.dataprep.teddy.exceptions.TeddyException;
import app.metatron.dataprep.teddy.exceptions.WrongTargetColumnExpressionException;
import app.metatron.dataprep.parser.rule.Rule;
import app.metatron.dataprep.parser.rule.SetType;
import app.metatron.dataprep.parser.rule.expr.Expression;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class DfSetType extends DataFrame {

  private static Logger LOGGER = LoggerFactory.getLogger(DfSetType.class);

  public DfSetType(String dsName, String ruleString) {
    super(dsName, ruleString);
  }

  @Override
  public List<Object> prepare(DataFrame prevDf, Rule rule, List<DataFrame> slaveDfs) throws TeddyException {
    List<Object> preparedArgs = new ArrayList<>();
    SetType setType = (SetType) rule;

    Expression targetColExpr = setType.getCol();
    String timestampFormat = setType.getFormat();
    ColumnType toType = getColTypeFromString(setType.getType());

    List<String> targetColNames = TeddyUtil.getIdentifierList(targetColExpr);
    if (targetColNames.isEmpty()) {
      throw new WrongTargetColumnExpressionException("DfSetType.prepare(): no target column: " + setType);
    }
    interestedColNames.addAll(targetColNames);

    List<Integer> targetColnos = new ArrayList<>();
    for (String colName : targetColNames) {
      targetColnos.add(prevDf.getColnoByColName(colName));
    }

    for (int colno = 0; colno < prevDf.getColCnt(); colno++) {
      if (targetColnos.contains(colno)) {
        if (toType == ColumnType.TIMESTAMP) {
          addColumnWithTimestampStyle(prevDf.getColName(colno), toType, timestampFormat);
        } else {
          addColumnWithTimestampStyle(prevDf.getColName(colno), toType, null);
        }
      } else {
        addColumn(prevDf.getColName(colno), prevDf.getColDesc(colno));
      }
    }

    preparedArgs.add(targetColnos);
    preparedArgs.add(toType);
    preparedArgs.add(timestampFormat);
    return preparedArgs;
  }

  @Override
  @SuppressWarnings("unchecked")
  public List<Row> gather(DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limit)
          throws InterruptedException, TeddyException {
    List<Row> rows = new ArrayList<>();
    List<Integer> targetColnos = (List<Integer>) preparedArgs.get(0);
    ColumnType toType = (ColumnType) preparedArgs.get(1);
    String timestampFormat = (String) preparedArgs.get(2);

    LOGGER.debug("DfSetType.gather(): start: offset={} length={} targetColnos={} toType={} timestampFormat={}",
            offset, length, targetColnos, toType, timestampFormat);

    for (int rowno = offset; rowno < offset + length; cancelCheck(++rowno)) {
      Row row = prevDf.rows.get(rowno);
      Row newRow = new Row();
      for (int colno = 0; colno < getColCnt(); colno++) {
        newRow.add(getColName(colno),
                targetColnos.contains(colno) ? cast(row.get(colno), toType, timestampFormat) : row.get(colno));
      }
      rows.add(newRow);
    }

    LOGGER.debug("DfSetType.gather(): end: offset={} length={} targetColnos={} toType={} timestampFormat={}",
            offset, length, targetColnos, toType, timestampFormat);
    return rows;
  }
}

