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

import static app.metatron.dataprep.TestUtil.append;
import static app.metatron.dataprep.TestUtil.loadContract;
import static app.metatron.dataprep.TestUtil.loadNullContained;
import static app.metatron.dataprep.TestUtil.loadProduct;
import static app.metatron.dataprep.TestUtil.loadSample;
import static app.metatron.dataprep.TestUtil.loadStore;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;

import app.metatron.dataprep.PrepContext;
import app.metatron.dataprep.exception.PrepException;
import org.junit.BeforeClass;
import org.junit.Test;

public class DataFrameTest {

  private static PrepContext pc;

  @BeforeClass
  public static void setUp() {
    pc = PrepContext.DEFAULT.withCacheMB(1000);
  }

  @Test
  public void testShow() {
    String dsId = loadSample(pc);
    pc.fetch(dsId, pc.getCurStageIdx(dsId)).show();

    dsId = loadContract(pc);
    pc.fetch(dsId, pc.getCurStageIdx(dsId)).show();

    dsId = loadStore(pc);
    pc.fetch(dsId, pc.getCurStageIdx(dsId)).show();
  }

  @Test
  public void testDrop() {
    String dsId = loadSample(pc);
    pc.append(dsId, "drop col: contract_date, itemNo").show();
  }

  @Test
  public void test_rename() {
    String dsId = loadSample(pc);
    pc.append(dsId, "rename col: speed to: 'speed new'").show();
    pc.append(dsId, "rename col: `speed new`, name to: 'speed', 'new name'").show();
  }

  @Test
  public void test_rename_duplicated() {
    String dsId = loadSample(pc);
    pc.append(dsId, "rename col: itemNo, speed, weight to: 'speed', 'speed', 'speed_1'").show();

    DataFrame df = pc.fetch(dsId);
    assertEquals("speed", df.getColName(2));
    assertEquals("speed_1", df.getColName(4));
    assertEquals("speed_1_1", df.getColName(5));
  }

  @Test
  public void test_set_plus() {
    String dsId = loadSample(pc);
    pc.append(dsId, "set col: speed value: speed + 1000").show();
  }

  @Test
  public void test_set_plus_multi() {
    String dsId = loadSample(pc);
    pc.append(dsId, "set col: speed, itemNo value: $col + 1000").show();
  }

  @Test
  public void test_set_plus_multi_but_on_single_col() {
    String dsId = loadSample(pc);
    pc.append(dsId, "set col: speed value: $col + 1000").show();
  }

  @Test
  public void test_set_minus() {
    String dsId = loadSample(pc);
    pc.append(dsId, "set col: speed value: speed - 300").show();
  }

  @Test
  public void test_set_mul() {
    String dsId = loadSample(pc);
    pc.append(dsId, "set col: speed value: speed * 10").show();
  }

  @Test
  public void test_set_if() {
    String dsId = loadSample(pc);
    pc.append(dsId, "set col: name value: if(length(name) > 5, 'long_name', 'short_name')").show();
  }

  @Test
  public void test_derive_mul() {
    String dsId = loadSample(pc);
    pc.append(dsId, "derive as: Turbo value: speed * 10").show();
  }

  @Test
  public void test_set_div() {
    String dsId = loadSample(pc);
    pc.append(dsId, "set col: speed value: speed / 10").show();
  }

  @Test
  public void test_set_div_double() {
    String dsId = loadSample(pc);
    pc.append(dsId, "set col: speed value: 3.0 / speed").show();
  }

  @Test
  public void test_set_type_mismatch() {
    String dsId = loadSample(pc);
    boolean success = true;

    try {
      pc.append(dsId, "set col: speed value: speed * '10'").show();
    } catch (PrepException e) {
      System.out.println(e);
      success = false;
    }

    assertFalse(success);
  }

  @Test
  public void test_join_by_string() {
    String dsId1 = loadContract(pc);
    String dsId2 = loadStore(pc);

    pc.append(dsId1, "set col: customer_id value: substring(customer_id, 0, 7)");
    pc.append(dsId2, "set col: customer_id value: substring(customer_id, 0, 7)");

    DataFrame df1 = pc.fetch(dsId1);
    DataFrame df2 = pc.fetch(dsId2);

    String colList1 = String.join(",", df1.colNames);
    String colList2 = String.join(",", df2.colNames);
    String condition = "customer_id = customer_id";
    String joinType = "inner";

    String ruleStr = String
            .format("join leftSelectCol: %s rightSelectCol: %s condition: %s joinType: '%s' dataset2: '%s'", colList1,
                    colList2, condition, joinType, dsId2);
    pc.append(dsId1, ruleStr).show();
  }

  @Test
  public void test_join_multi_key() {
    String dsId1 = loadContract(pc);
    String dsId2 = loadProduct(pc);

    DataFrame df1 = pc.fetch(dsId1);
    DataFrame df2 = pc.fetch(dsId2);

    String colList1 = String.join(",", df1.colNames);
    String colList2 = String.join(",", df2.colNames);
    String condition = "pcode1 = pcode1 && pcode2 = pcode2 && pcode3 = pcode3 && pcode4 = pcode4";
    String joinType = "inner";

    String ruleStr = String
            .format("join leftSelectCol: %s rightSelectCol: %s condition: %s joinType: '%s' dataset2: '%s'", colList1,
                    colList2, condition, joinType, dsId2);
    append(pc, dsId1, ruleStr);
    pc.fetch(dsId1);
  }

  @Test
  public void test_join_by_long() {
    String dsId1 = loadContract(pc);
    String dsId2 = loadStore(pc);

    append(pc, dsId1, "derive value: pcode3 + pcode2 + pcode3 + pcode4 as: 'code_sum'");

    DataFrame df1 = pc.fetch(dsId1);
    DataFrame df2 = pc.fetch(dsId2);

    String colList1 = String.join(",", df1.colNames);
    String colList2 = String.join(",", df2.colNames);
    String condition = "code_sum = detail_store_code";
    String joinType = "inner";

    String ruleStr = String
            .format("join leftSelectCol: %s rightSelectCol: %s condition: %s joinType: '%s' dataset2: '%s'", colList1,
                    colList2, condition, joinType, dsId2);
    append(pc, dsId1, ruleStr);
  }

  @Test
  public void test_union() {
    String dsId1 = loadStore(pc);
    String dsId2 = loadStore(pc);
    String dsId3 = loadStore(pc);
    String dsId4 = loadStore(pc);

    append(pc, dsId1, String.format("union dataset2: '%s', '%s', '%s'", dsId2, dsId3, dsId4));
    assertEquals(pc.fetch(dsId1).rows.size(), pc.fetch(dsId2).rows.size() * 4);
  }

  @Test
  public void test_nest_unnest_map() {
    String dsId = loadContract(pc);
    append(pc, dsId, "nest col: pcode1, pcode2, pcode3, pcode4 into: map as: pcode");
    append(pc, dsId, "unnest col: pcode idx: 'pcode3'");
  }

  @Test
  public void test_unnest_map_all() {
    String dsId = loadContract(pc);
    append(pc, dsId, "nest col: pcode1, pcode2, pcode3, pcode4 into: map as: pcode");
    append(pc, dsId, "unnest col: pcode idx: 'pcode1', 'pcode2', 'pcode3', 'pcoe4'");
  }

  @Test
  public void test_aggregate_sum() {
    String dsId = loadContract(pc);
    append(pc, dsId, "sort order: pcode1, pcode2, pcode3");
    append(pc, dsId, "aggregate value: sum(pcode4) group: pcode1, pcode2, pcode3");
    append(pc, dsId, "sort order: pcode1, pcode2, pcode3");
  }

  @Test
  public void test_aggregate_count() {
    String dsId = loadContract(pc);
    append(pc, dsId, "sort order: pcode1, pcode2, pcode3");
    append(pc, dsId, "aggregate value: count() group: pcode1, pcode2, pcode3");
    append(pc, dsId, "sort order: pcode1, pcode2, pcode3");
  }

  @Test
  public void test_aggregate_avg() {
    String dsId = loadContract(pc);
    append(pc, dsId, "sort order: pcode1, pcode2, pcode3");
    append(pc, dsId, "aggregate value: avg(pcode4) group: pcode1, pcode2, pcode3");
    append(pc, dsId, "sort order: pcode1, pcode2, pcode3");
  }

  @Test
  public void test_aggregate_min_max() {
    String dsId = loadContract(pc);
    append(pc, dsId, "derive value: pcode3 + pcode2 + pcode3 + pcode4 as: 'code_sum'");
    append(pc, dsId, "sort order: pcode1, pcode2, pcode3");
    append(pc, dsId, "aggregate value: min(code_sum), max(code_sum) group: pcode1, pcode2, pcode3");
    append(pc, dsId, "sort order: pcode1, pcode2, pcode3");
  }

  @Test
  public void test_sort() {
    String dsId = loadContract(pc);
    append(pc, dsId, "sort order: pcode4");
  }

  @Test
  public void test_sort_multi() {
    String dsId = loadContract(pc);
    append(pc, dsId, "sort order: pcode1, pcode2, pcode3");
  }

  @Test
  public void test_sort_str() {
    String dsId = loadContract(pc);
    append(pc, dsId, "sort order: pcode1, pcode2, pcode3, customer_id");
  }

  @Test
  public void test_pivot_sum() {
    String dsId = loadContract(pc);
    append(pc, dsId, "derive value: pcode3 + pcode2 + pcode3 + pcode4 as: 'code_sum'");
    append(pc, dsId, "pivot col: pcode1 value: sum(code_sum), count() group: pcode3, pcode4");
  }

  @Test
  public void test_pivot_avg() {
    String dsId = loadContract(pc);
    append(pc, dsId, "derive value: pcode3 + pcode2 + pcode3 + pcode4 as: 'code_sum'");
    append(pc, dsId, "pivot col: pcode1 value: avg(code_sum) group: pcode3, pcode4");
  }

  @Test
  public void test_unpivot_sum() {
    String dsId = loadContract(pc);
    append(pc, dsId, "derive value: pcode3 + pcode2 + pcode3 + pcode4 as: 'code_sum'");
    append(pc, dsId, "pivot col: pcode1 value: sum(code_sum) group: pcode3, pcode4");
    append(pc, dsId, "unpivot col: sum_code_sum_1, sum_code_sum_2, sum_code_sum_3, sum_code_sum_4 groupEvery: 1");
  }

  @Test
  public void test_unpivot_sum_every() {
    String dsId = loadContract(pc);
    append(pc, dsId, "derive value: pcode3 + pcode2 + pcode3 + pcode4 as: 'code_sum'");
    append(pc, dsId, "pivot col: pcode1 value: sum(code_sum) group: pcode3, pcode4");
    append(pc, dsId, "unpivot col: sum_code_sum_1, sum_code_sum_2, sum_code_sum_3, sum_code_sum_4 groupEvery: 4");
  }

  @Test
  public void test_keep() {
    String dsId = loadContract(pc);
    append(pc, dsId, "keep row: if(pcode4 < 10)");
  }

  @Test
  public void test_keep_literal() {
    String dsId = loadStore(pc);
    append(pc, dsId, "keep row: if(substring(customer_id, 0, 6) == 'uid000')");
  }

  @Test
  public void test_delete() {
    String dsId = loadContract(pc);
    append(pc, dsId, "delete row: if(pcode4 < 10)");
  }

  @Test
  public void test_delete2() {
    String dsId = loadContract(pc);
    append(pc, dsId, "delete row: if(pcode1 == 1 || pcode4 > 20)");

    DataFrame df = pc.fetch(dsId);
    assertEquals("uid00416119", df.rows.get(0).get("customer_id"));
    assertEquals("uid01923289", df.rows.get(1).get("customer_id"));
    assertEquals("uid00035874", df.rows.get(2).get("customer_id"));
  }

  @Test
  public void test_move_before() {
    String dsId = loadContract(pc);
    append(pc, dsId, "move col: pcode4 before: pcode1");
  }

  @Test
  public void test_move_after() {
    String dsId = loadContract(pc);
    append(pc, dsId, "move col: pcode4 after: customer_id");
  }

  @Test
  public void test_move_after_last() {
    String dsId = loadContract(pc);
    append(pc, dsId, "move col: pcode4 after: detail_store_code");
  }

  @Test

  public void test_move_before_multi() {
    String dsId = loadContract(pc);
    append(pc, dsId, "move col: pcode3, pcode4 before: cdate");
  }

  @Test
  public void test_move_after_multi() {
    String dsId = loadContract(pc);
    append(pc, dsId, "move col: pcode2, pcode3, pcode4 after: customer_id");
  }

  @Test
  public void test_move_after_last_multi() {
    String dsId = loadContract(pc);
    append(pc, dsId, "move col: pcode1, pcode2, pcode3, pcode4 after: detail_store_code");
  }

  @Test
  public void test_move_not_continuous_columns() {
    String dsId = loadContract(pc);

    try {
      pc.append(dsId, "move col: pcode1, pcode4 after: detail_store_code").show();
    } catch (PrepException e) {
      System.err.println(e.getMessageKey() + ": " + e.getMessageDetail());
    }
  }

  @Test
  public void test_header_exceptional_case() {
    String dsId = loadNullContained(pc);

    append(pc, dsId, "header rownum: 1");
    assertEquals("2010_01_01", pc.fetch(dsId).getColName(0));

    pc.undo(dsId);
    append(pc, dsId, "header rownum: 2");
    assertEquals("column1", pc.fetch(dsId).getColName(2));  // Put a sequential column name when header target is null.

    pc.undo(dsId);
    append(pc, dsId, "header rownum: 6");
    assertEquals("column1", pc.fetch(dsId).getColName(3));
    assertEquals("column2", pc.fetch(dsId).getColName(4));
  }
}
