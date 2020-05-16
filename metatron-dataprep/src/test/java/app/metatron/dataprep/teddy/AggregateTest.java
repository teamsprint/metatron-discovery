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
import static app.metatron.dataprep.TestUtil.loadPivotTestMultipleColumn;
import static org.junit.Assert.assertEquals;

import app.metatron.dataprep.PrepContext;
import org.junit.BeforeClass;
import org.junit.Test;

public class AggregateTest {

  private static PrepContext pc;

  @BeforeClass
  public static void setUp() {
    pc = PrepContext.DEFAULT.withCacheMB(1000);
  }

  @Test
  public void test_aggregate1() {
    String dsId = loadPivotTestMultipleColumn(pc);
    append(pc, dsId, "aggregate value: count(), sum(measure), avg(measure) group: machine_code,module_code");
    append(pc, dsId, "sort order: module_code");
    assertEquals(36L, pc.fetch(dsId).rows.get(0).get("sum_measure"));
  }

  @Test
  public void test_aggregate2() {
    String dsId = loadPivotTestMultipleColumn(pc);
    append(pc, dsId, "aggregate value: count(), sum(measure), avg(measure) group: machine_code,module_code,measure");
    append(pc, dsId, "sort order: row_count, module_code");
    assertEquals(30L, pc.fetch(dsId).rows.get(0).get("sum_measure"));
  }

  @Test
  public void test_aggregate_all() {
    String dsId = loadPivotTestMultipleColumn(pc);
    append(pc, dsId, "aggregate value: count(), sum(measure), avg(measure)");
    assertEquals(205L, pc.fetch(dsId).rows.get(0).get("sum_measure"));
  }
}
