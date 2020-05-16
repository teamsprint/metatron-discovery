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

package app.metatron.dataprep;

import static app.metatron.dataprep.TestUtil.loadCsv;
import static app.metatron.dataprep.TestUtil.loadSalesNamed;
import static org.junit.Assert.assertEquals;

import app.metatron.dataprep.teddy.DataFrame;
import app.metatron.dataprep.teddy.exceptions.TeddyException;
import org.junit.BeforeClass;
import org.junit.Test;

public class PrepContextTest {

  private static PrepContext pc;

  @BeforeClass
  public static void setUp() {
    pc = PrepContext.DEFAULT.withCacheMB(1000);
  }

  @Test
  public void testLoad() throws TeddyException {
    String dsId = loadCsv(pc, "sales_named.csv", false);
    DataFrame df = pc.fetch(dsId);
    df.show();
  }

  @Test
  public void testAutoTypingPreview() throws TeddyException {
    String dsId = loadSalesNamed(pc);
    DataFrame df = pc.getAutoTypingPreview(pc.fetch(dsId));
    df.show();
  }

  @Test
  public void testCreate() throws TeddyException {
    String dsId = loadSalesNamed(pc);
    assertEquals(5, pc.getCurStageIdx(dsId));
  }

  @Test
  public void testDrop() throws TeddyException {
    String dsId = loadSalesNamed(pc);
    assertEquals(5, pc.getCurStageIdx(dsId));

    pc.append(dsId, "drop col: due").show();
    assertEquals(6, pc.getCurStageIdx(dsId));
  }
}
