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

package app.metatron.dataprep.exec;

import app.metatron.dataprep.teddy.DataFrame;
import app.metatron.dataprep.teddy.Row;
import java.util.List;
import java.util.concurrent.Callable;

public class RowCollector implements Callable<List<Row>> {

  private DataFrame df;
  private DataFrame prevDf;
  private List<Object> preparedArgs;
  private int offset;
  private int length;
  private int limitRows;

  public RowCollector(DataFrame df, DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limitRows) {
    this.df = df;
    this.prevDf = prevDf;
    this.preparedArgs = preparedArgs;
    this.offset = offset;
    this.length = length;
    this.limitRows = limitRows;
  }

  @Override
  public List<Row> call() throws Exception {
    return df.gather(prevDf, preparedArgs, offset, length, limitRows);
  }
}
