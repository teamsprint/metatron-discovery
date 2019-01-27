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

import org.junit.Before;
import org.junit.Test;

import java.io.IOException;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.workbook.configurations.chart.properties.LineCurveStyle;
import app.metatron.discovery.domain.workbook.configurations.chart.properties.LinePointStyle;

/**
 * Line chart spec. Test
 */
public class LineChartTest extends ChartTest {

  @Before
  public void setUp() {
  }

  @Test
  public void de_serialize() throws IOException {

    ChartLegend legend = new ChartLegend();

    ChartAxis xAxis = new ChartAxis(true, "test", true, null, null, null);
    ChartAxis yAxis = new ChartAxis(true, null, true, null, null, null);

    LineChart chart = new LineChart(colorByMeasureForGradient(), null, legend, null, fontLargerSize(), null, null,
                                    500,
                                    LineChart.MarkType.LINE.name(),
                                    LinePointStyle.POINT_LINE.name(),
                                    LineCurveStyle.SMOOTH.name(),
                                    LineChart.LineMode.CUMULATIVE.name(),
                                    LineChart.LineThickness.THIN.name(),
                                    null,
                                    xAxis, yAxis);

    System.out.println(chart.toString());

    String chartStr = GlobalObjectMapper.getDefaultMapper().writeValueAsString(chart);

    System.out.println(chartStr);

    Chart deSerialized = GlobalObjectMapper.getDefaultMapper().readValue(chartStr, Chart.class);

    System.out.println("Result : " + deSerialized.toString());

  }

}
