/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specic language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.workbook.configurations.chart.properties;

import java.io.Serializable;

import app.metatron.discovery.util.EnumUtils;

public class LineProperties implements Serializable {

  LineStyle style;

  LineThickness thickness;

  LineCurveStyle curve;

  LinePointStyle point;

  public LineProperties() {
    // Empty Constructor
  }

  public LineProperties(String style, String thickness, String curve, String point) {
    this.style = EnumUtils.getUpperCaseEnum(LineStyle.class, style, LineStyle.SOLID);
    // for backward compatibility
    if ("MEDIUM".equalsIgnoreCase(thickness)) {
      this.thickness = LineThickness.NORMAL;
    } else {
      this.thickness = EnumUtils.getUpperCaseEnum(LineThickness.class, thickness, LineThickness.NORMAL);
    }
    this.curve = EnumUtils.getUpperCaseEnum(LineCurveStyle.class, curve, LineCurveStyle.STRAIGHT);
    this.point = EnumUtils.getUpperCaseEnum(LinePointStyle.class, point, LinePointStyle.POINT_LINE);
  }

  public LineStyle getStyle() {
    return style;
  }

  public LineThickness getThickness() {
    return thickness;
  }

  public LineCurveStyle getCurve() {
    return curve;
  }

  public LinePointStyle getPoint() {
    return point;
  }

  @Override
  public String toString() {
    return "LineProperties{" +
        "style=" + style +
        ", thickness=" + thickness +
        ", curve=" + curve +
        ", point=" + point +
        '}';
  }
}
