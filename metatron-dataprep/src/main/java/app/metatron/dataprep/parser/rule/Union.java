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

package app.metatron.dataprep.parser.rule;

import app.metatron.dataprep.parser.rule.expr.Expression;

public class Union implements Rule, Rule.Factory {

  Expression masterCol;
  Expression dataset2;
  Expression slaveCol;
  Expression type;
  Expression format;

  public Union() {
  }

  public Union(Expression masterCol, Expression dataset2, Expression slaveCol, Expression type) {
    this.masterCol = masterCol;
    this.dataset2 = dataset2;
    this.slaveCol = slaveCol;
    this.type = type;
    this.format = format;
  }

  public Expression getMasterCol() {
    return masterCol;
  }

  public void setMasterCol(Expression masterCol) {
    this.masterCol = masterCol;
  }

  public Expression getDataset2() {
    return dataset2;
  }

  public void setDataset2(Expression dataset2) {
    this.dataset2 = dataset2;
  }

  public Expression getSlaveCol() {
    return slaveCol;
  }

  public void setSlaveCol(Expression slaveCol) {
    this.slaveCol = slaveCol;
  }

  public Expression getType() {
    return type;
  }

  public void setType(Expression type) {
    this.type = type;
  }

  public Expression getFormat() {
    return format;
  }

  public void setFormat(Expression format) {
    this.format = format;
  }

  @Override
  public String getName() {
    return "union";
  }

  @Override
  public Rule get() {
    return new Union();
  }

  @Override
  public String toString() {
    return "Union{" +
            "dataset2=" + dataset2 +
            ", masterCol=" + masterCol +
            ", slaveCol=" + slaveCol +
            ", type=" + type +
            ", format=" + format +
            '}';
  }
}
