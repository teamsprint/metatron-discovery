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
import static app.metatron.dataprep.TestUtil.loadCsv;
import static org.junit.Assert.assertEquals;

import app.metatron.dataprep.PrepContext;
import org.junit.BeforeClass;
import org.junit.Test;

public class UnionTest {

  private static PrepContext pc;

  @BeforeClass
  public static void setUp() {
    pc = PrepContext.DEFAULT.withCacheMB(1000);
  }

  @Test
  public void same_schema() {
    String dsId1 = loadCsv(pc, "teddy/union1.csv", true);
    String dsId2 = loadCsv(pc, "teddy/union2.csv", true);

    int dsSize1 = pc.fetch(dsId1).rows.size();
    int dsSize2 = pc.fetch(dsId2).rows.size();

    append(pc, dsId1, String.format("union dataset2: '%s'", dsId2));
    assertEquals(dsSize1 + dsSize2, pc.fetch(dsId1).rows.size());
    pc.fetch(dsId1).show();
  }

  @Test
  public void drop_col_end() {
    String dsId1 = loadCsv(pc, "teddy/union1.csv", true);
    String dsId3 = loadCsv(pc, "teddy/union3.csv", true);

    int dsSize1 = pc.fetch(dsId1).rows.size();
    int dsSize3 = pc.fetch(dsId3).rows.size();

    append(pc, dsId1, String.format("union dataset2: '%s' masterCol: date,platform,camp_nm,imp,clk"
            + " type: 'timestamp','string','string','long','long'"
            + " format: 'yyyy-MM-dd','','','',''"
            + " slaveCol:"
            + " 'date','platform','camp_nm','imp','clk','date','media','campaignName','impression','click'", dsId3));
    assertEquals(dsSize1 + dsSize3, pc.fetch(dsId1).rows.size());
  }

  @Test
  public void drop_col_middle() {
    String dsId1 = loadCsv(pc, "teddy/union1.csv", true);
    String dsId4 = loadCsv(pc, "teddy/union4.csv", true);

    int dsSize1 = pc.fetch(dsId1).rows.size();
    int dsSize4 = pc.fetch(dsId4).rows.size();

    append(pc, dsId1, String.format("union dataset2: '%s' masterCol: date,platform,imp,clk,spend,etc"
            + " type: 'timestamp','string','string','long','long','string'"
            + " format: 'yyyy-MM-dd','','','','',''"
            + " slaveCol: '','platform','imp','clk','','','date','media','impression','click','cost',''", dsId4));
    assertEquals(dsSize1 + dsSize4, pc.fetch(dsId1).rows.size());
  }
}
