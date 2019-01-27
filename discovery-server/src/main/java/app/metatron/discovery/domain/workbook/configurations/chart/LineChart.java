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

package app.metatron.discovery.domain.workbook.configurations.chart;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;

import java.util.List;

import app.metatron.discovery.domain.workbook.configurations.chart.properties.LineCurveStyle;
import app.metatron.discovery.domain.workbook.configurations.chart.properties.LinePointStyle;
import app.metatron.discovery.domain.workbook.configurations.chart.properties.LineProperties;
import app.metatron.discovery.domain.workbook.configurations.format.FieldFormat;
import app.metatron.discovery.util.EnumUtils;

/**
 * Line Chart 스타일 정의
 */
@JsonTypeName("line")
public class LineChart extends Chart {

  /**
   * 선형/면적형  여부
   */
  MarkType mark;

  /**
   * 라인/포인트 여부
   */
  LinePointStyle lineStyle;

  /**
   * 라인 곡선 스타일
   */
  LineCurveStyle curveStyle;


  /**
   * 기본형, 누적형
   */
  LineMode lineMode;

  /**
   * 선 굵기
   */
  LineThickness lineThickness;

  /**
   * Style of line
   */
  LineProperties style;

  /**
   * X 축 설정
   */
  ChartAxis xAxis;

  /**
   * Y 축 설정
   */
  ChartAxis yAxis;

  public LineChart() {
    // Empty Constructor
  }

  @JsonCreator
  public LineChart(@JsonProperty("color") ChartColor color,
                   @JsonProperty("valueFormat") FieldFormat valueFormat,
                   @JsonProperty("legend") ChartLegend legend,
                   @JsonProperty("chartZooms") List<ChartZoom> chartZooms,
                   @JsonProperty("fontSize") String fontSize,
                   @JsonProperty("dataLabel") ChartDataLabel dataLabel,
                   @JsonProperty("toolTip") ChartToolTip toolTip,
                   @JsonProperty("limit") Integer limit,
                   @JsonProperty("mark") String mark,
                   @JsonProperty("lineMode") String lineMode,
                   @JsonProperty("lineStyle") String lineStyle,
                   @JsonProperty("curveStyle") String curveStyle,
                   @JsonProperty("lineThickness") String lineThickness,
                   @JsonProperty("style") LineProperties style,
                   @JsonProperty("xAxis") ChartAxis xAxis,
                   @JsonProperty("yAxis") ChartAxis yAxis) {
    super(color, valueFormat, legend, chartZooms, fontSize, dataLabel, toolTip, limit);
    this.mark = EnumUtils.getUpperCaseEnum(MarkType.class, mark, MarkType.LINE);
    this.lineMode = EnumUtils.getUpperCaseEnum(LineMode.class, lineMode, LineMode.NORMAL);

    // for backward compatibility, need to remove the 'lineStyle', 'curveStyle', 'lineThickness' properties later
    this.lineStyle = EnumUtils.getUpperCaseEnum(LinePointStyle.class, lineStyle, LinePointStyle.POINT_LINE);
    this.curveStyle = EnumUtils.getUpperCaseEnum(LineCurveStyle.class, curveStyle, LineCurveStyle.STRAIGHT);
    this.lineThickness = EnumUtils.getUpperCaseEnum(LineThickness.class, lineThickness, LineThickness.MEDIUM);
    this.style = style;
    if (this.style == null) {
      this.style = new LineProperties(null, lineThickness, curveStyle, lineStyle);
    }
    this.xAxis = xAxis;
    this.yAxis = yAxis;
  }

  public MarkType getMark() {
    return mark;
  }

  public LinePointStyle getLineStyle() {
    return lineStyle;
  }

  public LineCurveStyle getCurveStyle() {
    return curveStyle;
  }

  public LineMode getLineMode() {
    return lineMode;
  }

  public LineThickness getLineThickness() {
    return lineThickness;
  }

  public LineProperties getStyle() {
    return style;
  }

  public ChartAxis getxAxis() {
    return xAxis;
  }

  public ChartAxis getyAxis() {
    return yAxis;
  }

  @Override
  public String toString() {
    return "LineChart{" +
        "mark=" + mark +
        ", lineMode=" + lineMode +
        ", style=" + style +
        ", xAxis=" + xAxis +
        ", yAxis=" + yAxis +
        "} " + super.toString();
  }

  public enum MarkType {
    LINE,       // display only line
    AREA        // include area
  }

  public enum LineMode {
    NORMAL,             // Normal mode
    CUMULATIVE          // Cumulative mode
  }

  public enum LineThickness {
    MEDIUM,                // Normal
    THIN,                  // Thin
    THICK                  // Thick
  }
}
