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

import static app.metatron.dataprep.teddy.ColumnType.ARRAY;
import static app.metatron.dataprep.teddy.ColumnType.BOOLEAN;
import static app.metatron.dataprep.teddy.ColumnType.DOUBLE;
import static app.metatron.dataprep.teddy.ColumnType.LONG;
import static app.metatron.dataprep.teddy.ColumnType.MAP;
import static app.metatron.dataprep.teddy.ColumnType.STRING;
import static app.metatron.dataprep.teddy.ColumnType.TIMESTAMP;
import static app.metatron.dataprep.util.GlobalObjectMapper.getDefaultMapper;

import app.metatron.dataprep.util.GlobalObjectMapper;
import app.metatron.dataprep.teddy.exceptions.CannotSerializeIntoJsonException;
import app.metatron.dataprep.teddy.exceptions.ColumnNotFoundException;
import app.metatron.dataprep.teddy.exceptions.InvalidJsonException;
import app.metatron.dataprep.teddy.exceptions.TeddyException;
import app.metatron.dataprep.teddy.exceptions.WorksOnlyOnArrayOrMapException;
import app.metatron.dataprep.parser.rule.Rule;
import app.metatron.dataprep.parser.rule.Unnest;
import app.metatron.dataprep.parser.rule.expr.Expression;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class DfUnnest extends DataFrame {

  private static Logger LOGGER = LoggerFactory.getLogger(DfUnnest.class);

  public DfUnnest(String dsName, String ruleString) {
    super(dsName, ruleString);
  }

  @Override
  public List<Object> prepare(DataFrame prevDf, Rule rule, List<DataFrame> slaveDfs) throws TeddyException {
    List<Object> preparedArgs = new ArrayList<>();
    Unnest unnest = (Unnest) rule;
    String targetColName = unnest.getCol();
    Expression idxExpr = unnest.getIdx();
    List<String> newColNames = new ArrayList<>();

    int targetColno = prevDf.getColnoByColName(targetColName);
    ColumnType prevType = prevDf.getColType(targetColno);

    if (prevType != MAP && prevType != ARRAY) {
      throw new WorksOnlyOnArrayOrMapException("doUnnest(): works only on ARRAY/MAP: " + prevType);
    }

    addColumnWithDfAll(prevDf);

    List<String> idxs = TeddyUtil.getStringList(idxExpr);

    for (int i = 0; i < idxs.size(); i++) {
      String idx = idxs.get(i);
      String newColName;
      if (prevType == MAP) {
        newColName = modifyDuplicatedColName(makeParsable(idx));
      } else {
        newColName = modifyDuplicatedColName(targetColName + "_" + idx);
      }
      newColNames.add(newColName);
      addColumn(targetColno + 1 + i, newColName, ColumnType.STRING);  // Later, will be converted into a proper type
    }

    interestedColNames.addAll(newColNames);

    preparedArgs.add(targetColno);
    preparedArgs.add(prevType);
    preparedArgs.add(idxs);
    preparedArgs.add(newColNames);
    return preparedArgs;
  }

  private Object getElem(String jsonStr, String idx, ColumnType colType) {
    try {
      if (colType == MAP) {
        Map<String, Object> map = GlobalObjectMapper.getDefaultMapper().readValue(jsonStr, Map.class);
        Object obj = map.get(idx);
        return obj == null ? null : obj;
      } else {
        List<Object> list = GlobalObjectMapper.getDefaultMapper().readValue(jsonStr, List.class);
        int i = Integer.valueOf(idx);
        assert i >= 0 : i;
        return i >= list.size() ? null
                : GlobalObjectMapper.getDefaultMapper().writeValueAsString(list.get(Integer.valueOf(idx)));
      }
    } catch (IOException e) {
      LOGGER.warn("DfUnnest.gather(): cannot deserialize array/map type value", e);
      LOGGER.warn("DfUnnest.gather(): failed to get element: colType={} idx={}", colType, idx);
      return null;
    }
  }

  private Object convertColTypeByValue(int colno, Object obj)
          throws ColumnNotFoundException, CannotSerializeIntoJsonException {
    if (obj == null) {
      return null;
    }

    if (obj instanceof Map) {
      setColType(colno, MAP);
      /* need to jsonize */
    } else if (obj instanceof List) {
      setColType(colno, ARRAY);
      /* need to jsonize */
    } else if (obj instanceof Integer) {
      setColType(colno, LONG);
      return ((Integer) obj).longValue();
    } else if (obj instanceof Long) {
      setColType(colno, LONG);
      return obj;
    } else if (obj instanceof Float) {
      setColType(colno, DOUBLE);
      return ((Float) obj).doubleValue();
    } else if (obj instanceof Double) {
      setColType(colno, DOUBLE);
      return obj;
    } else if (obj instanceof DateTime) {
      setColType(colno, TIMESTAMP);
      return obj;
    } else if (obj instanceof Boolean) {
      setColType(colno, BOOLEAN);
      return obj;
    } else {
      setColType(colno, STRING);
      return obj;
    }

    String jsonStr;
    try {
      jsonStr = getDefaultMapper().writeValueAsString(obj);
    } catch (JsonProcessingException e) {
      throw new CannotSerializeIntoJsonException(e.getMessage());
    }
    return jsonStr;
  }

  @Override
  @SuppressWarnings("unchecked")
  public List<Row> gather(DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limit)
          throws InterruptedException, TeddyException {
    List<Row> rows = new ArrayList<>();
    int targetColno = (int) preparedArgs.get(0);
    ColumnType prevType = (ColumnType) preparedArgs.get(1);
    List<String> idxs = (List<String>) preparedArgs.get(2);
    List<String> newColNames = (List<String>) preparedArgs.get(3);

    LOGGER.debug("DfUnnest.gather(): start: offset={} length={} newColName={}", offset, length, newColNames);

    for (int rowno = offset; rowno < offset + length; cancelCheck(++rowno)) {
      Row row = prevDf.rows.get(rowno);
      Row newRow = new Row();

      // Add until the new column
      int colno = 0;
      for (/* NOP */; colno <= targetColno; colno++) {
        newRow.add(prevDf.getColName(colno), row.get(colno));
      }

      String jsonStr = (String) row.get(targetColno);

      // Add new generated columns
      for (int i = 0; i < idxs.size(); i++) {
        String idx = idxs.get(i);
        String newColName = newColNames.get(i);
        Object elem = getElem(jsonStr, idx, prevType);
        newRow.add(newColName, convertColTypeByValue(colno + i, elem));
      }

      // Add the rest.
      for (colno = targetColno + 1; colno < prevDf.getColCnt(); colno++) {
        newRow.add(prevDf.getColName(colno), row.get(colno));
      }

      rows.add(newRow);
    }

    LOGGER.debug("DfUnnest.gather(): end: offset={} length={} newColName={}", offset, length, newColNames);
    return rows;
  }
}
