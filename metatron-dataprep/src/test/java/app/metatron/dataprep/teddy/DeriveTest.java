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
import static app.metatron.dataprep.TestUtil.loadNullContained;
import static app.metatron.dataprep.teddy.ColumnType.BOOLEAN;
import static app.metatron.dataprep.teddy.ColumnType.DOUBLE;
import static app.metatron.dataprep.teddy.ColumnType.LONG;
import static app.metatron.dataprep.teddy.ColumnType.STRING;
import static org.junit.Assert.assertEquals;

import app.metatron.dataprep.PrepContext;
import org.junit.BeforeClass;
import org.junit.Test;

public class DeriveTest {

  private static PrepContext pc;

  @BeforeClass
  public static void setUp() {
    pc = PrepContext.DEFAULT.withCacheMB(1000);
  }

  // original dataset
  // +----------+-------------+------+-----------+-----+------+
  // |birth_date|contract_date|itemNo|       name|speed|weight|
  // +----------+-------------+------+-----------+-----+------+
  // |2010-01-01|   2017-01-01|     1|    Ferrari|  259|   800|
  // |2000-01-01|   2017-01-01|  null|     Jaguar|  274|   998|
  // |1990-01-01|   2017-01-01|     3|   Mercedes|  340|  1800|
  // |1980-01-01|   2017-01-01|     4|       Audi|  345|   875|
  // |1970-01-01|   2017-01-01|     5|Lamborghini|  355|  1490|
  // |1970-01-01|   2017-01-01|     6|       null| null|  1490|
  // +----------+-------------+------+-----------+-----+------+

  @Test
  public void testDuplicate() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: itemNo as: 'new_col'");
    assertEquals(1L, pc.fetch(dsId).rows.get(0).get("new_col"));      // 1
    assertEquals(null, pc.fetch(dsId).rows.get(1).get("new_col"));    // null
  }

  @Test
  public void testDeriveBoolean() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: if(itemNo) as: 'new_col'");
    assertEquals(BOOLEAN, pc.fetch(dsId).getColType(3));
    assertEquals(true, pc.fetch(dsId).rows.get(0).get("new_col"));    // 1
    assertEquals(false, pc.fetch(dsId).rows.get(1).get("new_col"));   // null
    assertEquals(true, pc.fetch(dsId).rows.get(2).get("new_col"));    // 3
  }

  @Test
  public void testDeriveString() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: if(isnull(itemNo), '1', '2') as: 'new_col'");
    assertEquals(STRING, pc.fetch(dsId).getColType(3));
    assertEquals("2", pc.fetch(dsId).rows.get(0).get("new_col"));     // 1
    assertEquals("1", pc.fetch(dsId).rows.get(1).get("new_col"));     // null
    assertEquals("2", pc.fetch(dsId).rows.get(2).get("new_col"));     // 3
  }

  @Test
  public void testDeriveLong() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: if(isnull(itemNo), 1, 2) as: 'new_col'");
    assertEquals(LONG, pc.fetch(dsId).getColType(3));
    assertEquals(2L, pc.fetch(dsId).rows.get(0).get("new_col"));      // 1
    assertEquals(1L, pc.fetch(dsId).rows.get(1).get("new_col"));      // null
    assertEquals(2L, pc.fetch(dsId).rows.get(0).get("new_col"));      // 3
  }

  @Test
  public void testDeriveIfOnNonBoolean() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: if(itemNo, 1, 2) as: 'new_col'");
    assertEquals(LONG, pc.fetch(dsId).getColType(3));
    assertEquals(1L, pc.fetch(dsId).rows.get(0).get("new_col"));      // 1
    assertEquals(2L, pc.fetch(dsId).rows.get(1).get("new_col"));      // null
    assertEquals(1L, pc.fetch(dsId).rows.get(2).get("new_col"));      // 3
  }

  @Test
  public void testDeriveEqualsOnNull() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: if(itemNo == 3) as: 'new_col'");
    assertEquals(BOOLEAN, pc.fetch(dsId).getColType(3));
    assertEquals(false, pc.fetch(dsId).rows.get(0).get("new_col"));   // 1
    assertEquals(false, pc.fetch(dsId).rows.get(1).get("new_col"));   // null
    assertEquals(true, pc.fetch(dsId).rows.get(2).get("new_col"));    // 3
  }

  @Test
  public void testDeriveEqualsOnString() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: if(name == 'Ferrari') as: 'new_col'");
    assertEquals(BOOLEAN, pc.fetch(dsId).getColType(4));    // The new column is right after the interested column.
    assertEquals(true, pc.fetch(dsId).rows.get(0).get("new_col"));    // Ferrari
    assertEquals(false, pc.fetch(dsId).rows.get(1).get("new_col"));   // Jaguar
    assertEquals(false, pc.fetch(dsId).rows.get(5).get("new_col"));   // null
  }

  @Test
  public void testDeriveAsString() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: if(name == 'Ferrari', '1', '0') as: 'new_col'");
    assertEquals(STRING, pc.fetch(dsId).getColType(4));   // The new column is right after the interested column.
    assertEquals("1", pc.fetch(dsId).rows.get(0).get("new_col"));   // Ferrari
    assertEquals("0", pc.fetch(dsId).rows.get(1).get("new_col"));   // Jaguar
    assertEquals("0", pc.fetch(dsId).rows.get(5).get("new_col"));   // null
  }

  @Test
  public void testDeriveAsLong() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: if(name == 'Ferrari', 1, 0) as: 'new_col'");
    assertEquals(LONG, pc.fetch(dsId).getColType(4));   // The new column is right after the interested column.
    assertEquals(1L, pc.fetch(dsId).rows.get(0).get("new_col"));   // Ferrari
    assertEquals(0L, pc.fetch(dsId).rows.get(1).get("new_col"));   // Jaguar
    assertEquals(0L, pc.fetch(dsId).rows.get(5).get("new_col"));   // null
  }

  @Test
  public void testDeriveAsDouble() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: if(name == 'Ferrari', 99.9, 0.01) as: 'new_col'");
    assertEquals(DOUBLE, pc.fetch(dsId).getColType(4));   // The new column is right after the interested column.
    assertEquals(99.9, pc.fetch(dsId).rows.get(0).get("new_col"));   // Ferrari
    assertEquals(0.01, pc.fetch(dsId).rows.get(1).get("new_col"));   // Jaguar
    assertEquals(0.01, pc.fetch(dsId).rows.get(5).get("new_col"));   // null
  }

  @Test
  public void testDeriveNumCompareIntoLong() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: if(itemNo <= 3, 1, 0) as: 'new_col'");
    assertEquals(LONG, pc.fetch(dsId).getColType(3));   // The new column is right after the interested column.
    assertEquals(1L, pc.fetch(dsId).rows.get(0).get("new_col"));   // 1
    assertEquals(0L, pc.fetch(dsId).rows.get(1).get("new_col"));   // null
    assertEquals(0L, pc.fetch(dsId).rows.get(4).get("new_col"));   // 4
  }

  @Test
  public void testDeriveNumCompareIntoString() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: if (weight > 1000, 'heavy', 'light') as: 'new_col'");
    assertEquals(LONG, pc.fetch(dsId).getColType(5));   // The new column is right after the interested column.
    assertEquals("light", pc.fetch(dsId).rows.get(0).get("new_col"));   // 800
    assertEquals("light", pc.fetch(dsId).rows.get(1).get("new_col"));   // 998
    assertEquals("heavy", pc.fetch(dsId).rows.get(2).get("new_col"));   // 1800
  }

  @Test
  public void testDeriveNumCompareIntoBoolean() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: if (itemNo < 3) as: 'new_col'");
    assertEquals(BOOLEAN, pc.fetch(dsId).getColType(3));   // The new column is right after the interested column.
    assertEquals(true, pc.fetch(dsId).rows.get(0).get("new_col"));    // 1
    assertEquals(false, pc.fetch(dsId).rows.get(1).get("new_col"));   // null
    assertEquals(false, pc.fetch(dsId).rows.get(2).get("new_col"));   // 3
  }

  @Test
  public void testDeriveNumCompareMultiIntoBoolean() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: if (speed > 300 && speed < 400) as: 'new_col'");
    assertEquals(BOOLEAN, pc.fetch(dsId).getColType(5));   // The new column is right after the interested column.
    assertEquals(false, pc.fetch(dsId).rows.get(0).get("new_col"));   // 259
    assertEquals(true, pc.fetch(dsId).rows.get(2).get("new_col"));    // 340
    assertEquals(false, pc.fetch(dsId).rows.get(5).get("new_col"));   // null
  }

  @Test
  public void testDeriveNumCompareTripleIntoBoolean() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: if (speed > 300 && speed < 400 || weight < 1000) as: 'new_col'");
    assertEquals(BOOLEAN, pc.fetch(dsId).getColType(6));   // The new column is right after the interested column.
    assertEquals(true, pc.fetch(dsId).rows.get(0).get("new_col"));    // 259, 800
    assertEquals(true, pc.fetch(dsId).rows.get(1).get("new_col"));    // 274, 998
    assertEquals(true, pc.fetch(dsId).rows.get(2).get("new_col"));    // 340, 1800
    assertEquals(false, pc.fetch(dsId).rows.get(5).get("new_col"));   // null, 1490
  }

  @Test
  public void testDeriveNumCompareTripleIntoString() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: if (speed > 300 && speed < 400 && weight < 1000, 'good', 'bad') as: 'new_col'");
    assertEquals(STRING, pc.fetch(dsId).getColType(6));   // The new column is right after the interested column.
    assertEquals("bad", pc.fetch(dsId).rows.get(0).get("new_col"));   // 259, 800
    assertEquals("bad", pc.fetch(dsId).rows.get(1).get("new_col"));   // 274, 998
    assertEquals("good", pc.fetch(dsId).rows.get(3).get("new_col"));  // 355, 1490
    assertEquals("bad", pc.fetch(dsId).rows.get(5).get("new_col"));   // null, 1490
  }

  @Test
  public void testDeriveNumCompareTripleIntoLong() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: if (speed > 300 && speed < 400 && weight < 1000, 1, 0) as: 'new_col'");
    assertEquals(LONG, pc.fetch(dsId).getColType(6));   // The new column is right after the interested column.
    assertEquals(0L, pc.fetch(dsId).rows.get(0).get("new_col"));   // 259, 800
    assertEquals(0L, pc.fetch(dsId).rows.get(1).get("new_col"));   // 274, 998
    assertEquals(1L, pc.fetch(dsId).rows.get(3).get("new_col"));   // 355, 1490
    assertEquals(0L, pc.fetch(dsId).rows.get(5).get("new_col"));   // null, 1490
  }

  @Test
  public void testDeriveNumCompareTripleIntoDouble() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: if (speed > 300 && speed < 400 && weight < 1000, 10.0, 1.0) as: 'new_col'");
    assertEquals(DOUBLE, pc.fetch(dsId).getColType(6));   // The new column is right after the interested column.
    assertEquals(1.0, pc.fetch(dsId).rows.get(0).get("new_col"));   // 259, 800
    assertEquals(1.0, pc.fetch(dsId).rows.get(1).get("new_col"));   // 274, 998
    assertEquals(10.0, pc.fetch(dsId).rows.get(3).get("new_col"));  // 355, 1490
    assertEquals(1.0, pc.fetch(dsId).rows.get(5).get("new_col"));   // null, 1490
  }

  @Test
  public void testDeriveUpper() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: upper(name) as: 'new_col'");
    assertEquals("FERRARI", pc.fetch(dsId).rows.get(0).get("new_col"));
  }

  @Test
  public void testDeriveIsNull() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: isnull(name) as: 'new_col'");
    assertEquals(false, pc.fetch(dsId).rows.get(0).get("new_col"));   // Ferrari
    assertEquals(true, pc.fetch(dsId).rows.get(5).get("new_col"));    // null
  }

  @Test
  public void testDeriveLength() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: length(name) as: 'new_col'");
    assertEquals(7L, pc.fetch(dsId).rows.get(0).get("new_col"));      // Ferrari
    assertEquals(null, pc.fetch(dsId).rows.get(5).get("new_col"));    // null
  }

  @Test
  public void testDeriveNullOnInnerFunc() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: if(length(name)) as: 'new_col'");
    assertEquals(true, pc.fetch(dsId).rows.get(0).get("new_col"));    // Ferrari
    assertEquals(false, pc.fetch(dsId).rows.get(5).get("new_col"));   // null
  }

  @Test
  public void testDeriveNullInComparison() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: if(length(name) > 5, '1', '0') as: 'new_col'");
    assertEquals("1", pc.fetch(dsId).rows.get(0).get("new_col"));  // Ferrari
    assertEquals("0", pc.fetch(dsId).rows.get(3).get("new_col"));  // Audi
    assertEquals("0", pc.fetch(dsId).rows.get(5).get("new_col"));  // null
  }

  @Test
  public void testDeriveNullInComparisonIntoLong() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: if(length(name) < 7, 1, 0) as: 'new_col'");
    assertEquals(0L, pc.fetch(dsId).rows.get(0).get("new_col"));  // Ferrari
    assertEquals(1L, pc.fetch(dsId).rows.get(3).get("new_col"));  // Audi
    assertEquals(0L, pc.fetch(dsId).rows.get(5).get("new_col"));  // null
  }

  @Test
  public void testDeriveNullInComparisonIntoDouble() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: if(length(name) < 7, 10.0, 1.0) as: 'new_col'");
    assertEquals(1.0, pc.fetch(dsId).rows.get(0).get("new_col"));   // Ferrari
    assertEquals(10.0, pc.fetch(dsId).rows.get(3).get("new_col"));  // Audi
    assertEquals(1.0, pc.fetch(dsId).rows.get(5).get("new_col"));   // null
  }

  @Test
  public void testDeriveNullInEquation() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: if(length(name) == 4, '4c', 'others') as: 'new_col'");
    assertEquals("others", pc.fetch(dsId).rows.get(0).get("new_col"));  // Ferrari
    assertEquals("4c", pc.fetch(dsId).rows.get(3).get("new_col"));      // Audi
    assertEquals("others", pc.fetch(dsId).rows.get(5).get("new_col"));  // null
  }

  @Test
  public void testDerivePlus() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: weight + 100 as: 'new_col'");
    assertEquals(900L, pc.fetch(dsId).rows.get(0).get("new_col"));  // 800
  }

  @Test
  public void testDerivePlusDiffType() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: weight + 100.78 as: 'new_col'");
    assertEquals(900.78, pc.fetch(dsId).rows.get(0).get("new_col"));  // 800
  }

  @Test
  public void testDeriveMinus() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: weight - 100 as: 'new_col'");
    assertEquals(700L, pc.fetch(dsId).rows.get(0).get("new_col"));  // 800
  }

  @Test
  public void testDeriveMul() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: weight * 100 as: 'new_col'");
    assertEquals(80000L, pc.fetch(dsId).rows.get(0).get("new_col"));  // 800
  }

  @Test
  public void testDeriveDiv() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: weight / 100 as: 'new_col'");
    assertEquals(8.0, pc.fetch(dsId).rows.get(0).get("new_col"));  // 800
  }

  @Test
  public void testDerivePlusVar() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: speed + weight as: 'new_col'");
    assertEquals(1059L, pc.fetch(dsId).rows.get(0).get("new_col"));  // 259, 800
  }

  @Test
  public void testDerivePlusVarTriple() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: speed + weight + itemNo as: 'new_col'");
    assertEquals(1060L, pc.fetch(dsId).rows.get(0).get("new_col"));  // 259, 800, 1
  }

  @Test
  public void testDeriveVarConstMix() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: speed + 100 - weight + 2 - 3 as: 'new_col'");
    assertEquals(-442L, pc.fetch(dsId).rows.get(0).get("new_col"));  // 259, 800
  }

  @Test
  public void testDeriveVarConstFuncMix() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: length(name) + speed + itemNo + 100 as: 'new_col'");
    assertEquals(367L, pc.fetch(dsId).rows.get(0).get("new_col"));  // Ferrari, 259, 1
  }

  @Test
  public void testDeriveMathFunc() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: math.sqrt(speed) + math.sqrt(weight) as: 'new_col'");
    assertEquals("44.377", pc.fetch(dsId).rows.get(0).get("new_col").toString().substring(0, 6));  // 259, 800
  }

  @Test
  public void testDerivePlusRev() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: 5 + weight as: 'new_col'");
    assertEquals(805L, pc.fetch(dsId).rows.get(0).get("new_col"));  // 800
  }

  @Test
  public void testDeriveConst() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: 1 as: 'new_col'");
    assertEquals(1L, pc.fetch(dsId).rows.get(0).get("new_col"));
  }

  @Test
  public void testDeriveEqualsRev() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: if('Ferrari' == name) as: 'new_col'");
    assertEquals(true, pc.fetch(dsId).rows.get(0).get("new_col"));  // 800
    assertEquals(false, pc.fetch(dsId).rows.get(5).get("new_col"));  // null
  }

  @Test
  public void testOperatorPriority() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: if(length(name) + 1 == length(name) + 2) as: 'new_col'");
    assertEquals(false, pc.fetch(dsId).rows.get(0).get("new_col"));  // 800
    assertEquals(false, pc.fetch(dsId).rows.get(5).get("new_col"));  // null
  }

  @Test
  public void testDeriveDuplicatedColName() {
    String dsId = loadNullContained(pc);
    append(pc, dsId, "derive value: if(name == 'Ferrari', itemNo, speed) as: 'name'");
    assertEquals(1L, pc.fetch(dsId).rows.get(0).get("name_1"));     // Ferrari, 1, 259
    assertEquals(null, pc.fetch(dsId).rows.get(5).get("name_1"));   // null, 6, null
  }
}
