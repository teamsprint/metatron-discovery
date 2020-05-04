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

package app.metatron.discovery.domain.dataprep.transform;

import java.io.Serializable;
import java.util.List;
import app.metatron.dataprep.teddy.histogram.Histogram;

public class PrepHistogramResponse implements Serializable {

  List<Histogram> colHists;

  public PrepHistogramResponse() {
  }

  public PrepHistogramResponse(List<Histogram> colHists) {
    this.colHists = colHists;
  }

  public List<Histogram> getColHists() {
    return colHists;
  }
}
