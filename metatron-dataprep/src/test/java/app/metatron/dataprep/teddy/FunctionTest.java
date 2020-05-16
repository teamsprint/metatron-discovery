/*
 * Licensed under the Apache License, Version 2.0 (the "License";
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
import static app.metatron.dataprep.TestUtil.loadDateSample;
import static org.junit.Assert.assertEquals;

import app.metatron.dataprep.PrepContext;
import org.junit.BeforeClass;
import org.junit.Test;

public class FunctionTest {

  private static PrepContext pc;

  @BeforeClass
  public static void setUp() {
    pc = PrepContext.DEFAULT.withCacheMB(1000);
  }

  @Test
  public void testYear() {
    String dsId = loadDateSample(pc);
    append(pc, dsId, "derive value: year(birth_date) as: 'new_col'");
    assertEquals(ColumnType.TIMESTAMP, pc.fetch(dsId).colDescs.get(0).getType());
    assertEquals(2011L, pc.fetch(dsId).rows.get(0).get("new_col"));
  }

  @Test
  public void testMonth() {
    String dsId = loadDateSample(pc);
    append(pc, dsId, "derive value: month(birth_date) as: 'new_col'");
    assertEquals(1L, pc.fetch(dsId).rows.get(0).get("new_col"));
  }

  @Test
  public void testDay() {
    String dsId = loadDateSample(pc);
    append(pc, dsId, "derive value: day(birth_date) as: 'new_col'");
    assertEquals(1L, pc.fetch(dsId).rows.get(0).get("new_col"));
  }

  @Test
  public void testHour() {
    String dsId = loadDateSample(pc);
    append(pc, dsId, "derive value: hour(birth_date) as: 'new_col'");
    assertEquals(ColumnType.TIMESTAMP, pc.fetch(dsId).colDescs.get(0).getType());
    assertEquals(12L, pc.fetch(dsId).rows.get(0).get("new_col"));
  }

  @Test
  public void testMinute() {
    String dsId = loadDateSample(pc);
    append(pc, dsId, "derive value: minute(birth_date) as: 'new_col'");
    assertEquals(ColumnType.TIMESTAMP, pc.fetch(dsId).colDescs.get(0).getType());
    assertEquals(5L, pc.fetch(dsId).rows.get(0).get("new_col"));
  }

  @Test
  public void testSecond() {
    String dsId = loadDateSample(pc);
    append(pc, dsId, "derive value: second(birth_date) as: 'new_col'");
    assertEquals(ColumnType.TIMESTAMP, pc.fetch(dsId).colDescs.get(0).getType());
    assertEquals(1L, pc.fetch(dsId).rows.get(0).get("new_col"));
  }

  @Test
  public void testMillis() {
    String dsId = loadDateSample(pc);
    append(pc, dsId, "derive value: millisecond(birth_date) as: 'new_col'");
    assertEquals(ColumnType.TIMESTAMP, pc.fetch(dsId).colDescs.get(0).getType());
    assertEquals(0L, pc.fetch(dsId).rows.get(0).get("new_col"));
  }

  @Test
  public void testWeekday() {
    String dsId = loadDateSample(pc);
    append(pc, dsId, "derive value: weekday(birth_date) as: 'new_col'");
    assertEquals(ColumnType.TIMESTAMP, pc.fetch(dsId).colDescs.get(0).getType());
    assertEquals("Saturday", pc.fetch(dsId).rows.get(0).get("new_col"));
  }

  @Test
  public void testNow() {
    String dsId = loadDateSample(pc);
    append(pc, dsId, "derive value: now() as: 'new_col'");
    assertEquals(ColumnType.TIMESTAMP, pc.fetch(dsId).colDescs.get(8).getType());
  }

  @Test
  public void testAddTime() {
    String dsId = loadDateSample(pc);
    append(pc, dsId, "derive value: add_time(birth_date, 1, 'year') as: 'new_col'");
    append(pc, dsId, "derive value: year(new_col) as: 'new_col2'");
    assertEquals(2012L, pc.fetch(dsId).rows.get(0).get("new_col2"));
  }

  @Test
  public void testTimeDiff() {
    String dsId = loadDateSample(pc);
    append(pc, dsId, "derive value: add_time(birth_date, 1, 'minute') as: 'new_col'");
    append(pc, dsId, "derive value: time_diff(birth_date, new_col) as: 'new_col2'");
    assertEquals(60000L, pc.fetch(dsId).rows.get(0).get("new_col2"));
  }

  @Test
  public void testTimestamp() {
    String dsId = loadDateSample(pc);
    append(pc, dsId, "derive value: timestamp('2011-01-01 12:05:01', 'yyyy-MM-dd HH:mm:ss') as: 'new_col'");
    append(pc, dsId, "keep row: time_diff(birth_date, new_col)==0");
    assertEquals(1, pc.fetch(dsId).rows.size());
  }

  @Test
  public void testLength() {
    String dsId = loadDateSample(pc);
    append(pc, dsId, "derive value: length(name) as: 'new_col'");
    assertEquals(9L, pc.fetch(dsId).rows.get(0).get("new_col"));
  }

  @Test
  public void testIsNull() {
    String dsId = loadDateSample(pc);
    append(pc, dsId, "derive value: isnull(memo) as: 'new_col'");
    assertEquals(true, pc.fetch(dsId).rows.get(0).get("new_col"));
    assertEquals(false, pc.fetch(dsId).rows.get(1).get("new_col"));
    assertEquals(false, pc.fetch(dsId).rows.get(3).get("new_col"));
  }

  @Test
  public void testUpper() {
    String dsId = loadDateSample(pc);
    append(pc, dsId, "derive value: upper(name) as: 'new_col'");
    assertEquals("AUDI", pc.fetch(dsId).rows.get(3).get("new_col"));
  }

  @Test
  public void testLower() {
    String dsId = loadDateSample(pc);
    append(pc, dsId, "derive value: lower(name) as: 'new_col'");
    assertEquals("audi", pc.fetch(dsId).rows.get(3).get("new_col"));
  }

  @Test
  public void testTrim() {
    String dsId = loadDateSample(pc);
    append(pc, dsId, "derive value: trim(name) as: 'new_col'");
    assertEquals("Ferrari", pc.fetch(dsId).rows.get(0).get("new_col"));
    assertEquals("Mercedes", pc.fetch(dsId).rows.get(2).get("new_col"));
  }

  @Test
  public void testLtrim() {
    String dsId = loadDateSample(pc);
    append(pc, dsId, "derive value: ltrim(name) as: 'new_col'");
    assertEquals("Ferrari", pc.fetch(dsId).rows.get(0).get("new_col"));
    assertEquals("Jaguar  ", pc.fetch(dsId).rows.get(1).get("new_col"));
    assertEquals("Mercedes  ", pc.fetch(dsId).rows.get(2).get("new_col"));
  }

  @Test
  public void testRtrim() {
    String dsId = loadDateSample(pc);
    append(pc, dsId, "derive value: rtrim(name) as: 'new_col'");
    assertEquals("  Ferrari", pc.fetch(dsId).rows.get(0).get("new_col"));
    assertEquals("Jaguar", pc.fetch(dsId).rows.get(1).get("new_col"));
    assertEquals("  Mercedes", pc.fetch(dsId).rows.get(2).get("new_col"));
  }

  @Test
  public void testSubstring() {
    String dsId = loadDateSample(pc);
    append(pc, dsId, "derive value: substring(name, 1, 6) as: 'new_col'");
    assertEquals(" Ferra", pc.fetch(dsId).rows.get(0).get("new_col"));
    assertEquals("aguar ", pc.fetch(dsId).rows.get(1).get("new_col"));
    assertEquals("udi", pc.fetch(dsId).rows.get(3).get("new_col"));
  }

  @Test
  public void testConcat() {
    String dsId = loadDateSample(pc);
    append(pc, dsId, "derive value: concat('speed of ', name, ' is ', speed) as: 'new_col'");
    assertEquals("speed of   Ferrari is 259", pc.fetch(dsId).rows.get(0).get("new_col"));   // `name` contains spaces.
  }

  @Test
  public void testConcatWs() {
    String dsId = loadDateSample(pc);
    append(pc, dsId, "derive value: concat_ws('-', 'D', itemNo, speed, weight) as: 'new_col'");
    assertEquals("D-1-259-800", pc.fetch(dsId).rows.get(0).get("new_col"));
  }
}
