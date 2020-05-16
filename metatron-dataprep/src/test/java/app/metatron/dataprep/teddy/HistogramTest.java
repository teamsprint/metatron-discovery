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
import static app.metatron.dataprep.TestUtil.loadContract;
import static app.metatron.dataprep.TestUtil.loadSalesNamed;

import app.metatron.dataprep.PrepContext;
import app.metatron.dataprep.teddy.exceptions.ColumnNotFoundException;
import app.metatron.dataprep.teddy.histogram.Histogram;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.BeforeClass;
import org.junit.Test;

public class HistogramTest {

  private static PrepContext pc;

  @BeforeClass
  public static void setUp() {
    pc = PrepContext.DEFAULT.withCacheMB(1000);
  }

  @Test
  public void test_hist_string_raw() {    // This is just for thinking of histogram's logic.
    String dsId = loadContract(pc);
    DataFrame df = pc.fetch(dsId);

    Map<String, Integer> map = new HashMap<>();
    for (int rowno = 0; rowno < df.rows.size(); rowno++) {
      String key = df.rows.get(rowno).get(5).toString();
      Integer val = map.get(key);
      map.put(key, val == null ? 1 : val + 1);
    }

    List<String> labels = new ArrayList<>();
    List<Integer> counts = new ArrayList<>();

    map.entrySet().stream()
            .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
            .forEach(entry -> {
              labels.add(entry.getKey());
              counts.add(entry.getValue());
            });

    df.show();
  }

  private Histogram createHist(DataFrame df, String colName) {
    int colno = -1;

    try {
      colno = df.getColnoByColName(colName);
    } catch (ColumnNotFoundException e) {
      System.err.println(e.getMessage());
      assert false;
    }

    return Histogram.createHist(colName, df.getColType(colno), df.rows, colno, null);
  }

  @Test
  public void test_hist_string() {
    String dsId = loadSalesNamed(pc);
    Histogram hist = createHist(pc.fetch(dsId), "state");

    String[] labels = hist.labels.stream().toArray(String[]::new);
    String[] counts = hist.counts.stream().map(Object::toString).toArray(String[]::new);
    List<String[]> strGrid = Arrays.asList(labels, counts);
    List<String> colNames = Arrays.asList("labels", "counts");

    DataFrame df = new DataFrame();
    df.setByColumnarGrid(strGrid, colNames);
    df.show();
  }

  @Test
  public void test_hist_double() {
    String dsId = loadSalesNamed(pc);
    Histogram hist = createHist(pc.fetch(dsId), "price");

    String[] labels = hist.labels.stream().toArray(String[]::new);
    String[] counts = hist.counts.stream().map(Object::toString).toArray(String[]::new);
    List<String[]> strGrid = Arrays.asList(labels, counts);
    List<String> colNames = Arrays.asList("labels", "counts");

    DataFrame df = new DataFrame();
    df.setByColumnarGrid(strGrid, colNames);
    df.show();
  }

  @Test
  public void test_hist_long() {
    String dsId = loadSalesNamed(pc);
    append(pc, dsId, "sort order: guaranty_days");
    append(pc, dsId, "aggregate value: count() group: guaranty_days");
    pc.undo(dsId);
    Histogram hist = createHist(pc.fetch(dsId), "guaranty_days");

    String[] labels = hist.labels.stream().toArray(String[]::new);
    String[] counts = hist.counts.stream().map(Object::toString).toArray(String[]::new);
    List<String[]> strGrid = Arrays.asList(labels, counts);
    List<String> colNames = Arrays.asList("labels", "counts");

    DataFrame df = new DataFrame();
    df.setByColumnarGrid(strGrid, colNames);
    df.show();
  }

  private void test_long_label_single(long min, long max, int barCnt) {
    System.err.print(String.format("min=%d max=%d barCnt=%d ==> ", min, max, barCnt));
    List<Long> labels = Histogram.getLongLabels(min, max, barCnt);
    assert labels != null;
    assert labels.size() > 1 : labels.size();
    System.err.println("longLabels: " + labels.toString());
  }

  @Test
  public void test_long_labels() {
    test_long_label_single(100, 119, 5);
    test_long_label_single(1, 120, 30);
    test_long_label_single(1, 120, 11);
    test_long_label_single(1, 1200, 11);
    test_long_label_single(1, 1199, 11);
    test_long_label_single(50, 60, 10);
    test_long_label_single(50, 60, 11);
    test_long_label_single(1, 25, 5);
    test_long_label_single(1, 26, 5);
    test_long_label_single(1, 2, 3);
    test_long_label_single(-2, -1, 3);
    test_long_label_single(-2, -1, 2);
    test_long_label_single(-200, -100, 2);
    test_long_label_single(-2000, -1123, 20);
    test_long_label_single(-2001, -1123, 20);
    test_long_label_single(-2001, 1123, 20);
  }

  private void test_double_label_single(double min, double max, int barCnt) {
    System.err.print(String.format("min=%.16f max=%.16f barCnt=%d ==> ", min, max, barCnt));
    List<Double> labels = Histogram.getDoubleLabels(min, max, barCnt);
    assert labels != null;
    assert labels.size() > 1 : labels.size();
    System.err.println("doubleLabels: " + labels.toString());
  }

  @Test
  public void test_double_labels() {
    test_double_label_single(1.0, 1.19, 5);
    test_double_label_single(1.0, 1.21, 5);
    test_double_label_single(1.0, 12.0, 5);
    test_double_label_single(1.0, 120.0, 30);
    test_double_label_single(0.1, 0.12, 11);
    test_double_label_single(0.1, 11.99, 11);
    test_double_label_single(0.0005, 0.0006, 10);
    test_double_label_single(0.0005, 0.0006, 11);
    test_double_label_single(0.0005, 0.0016, 10);
    test_double_label_single(0.0005, 0.0016, 11);
    test_double_label_single(10000.0, 10000.25, 5);
    test_double_label_single(10001.0, 10002.26, 5);
    test_double_label_single(1.0, 2.0, 3);
    test_double_label_single(-2.0, -1.0, 3);
    test_double_label_single(-2.0, -1.0, 2);
    test_double_label_single(-0.02, -0.01, 2);
    test_double_label_single(-0.002, -0.001123, 20);
    test_double_label_single(-0.00021, -0.0001123, 20);
    test_double_label_single(-0.000002001, 0.000001123, 20);
    test_double_label_single(-0.000002001, 0.000001123, 1);
  }
}
