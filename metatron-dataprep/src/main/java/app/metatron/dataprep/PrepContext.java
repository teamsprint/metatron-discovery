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

import app.metatron.dataprep.cache.Revision;
import app.metatron.dataprep.cache.RevisionSet;
import app.metatron.dataprep.connector.FileConnector;
import app.metatron.dataprep.connector.JdbcConnector;
import app.metatron.dataprep.exception.PrepException;
import app.metatron.dataprep.exec.RuleExecutor;
import app.metatron.dataprep.parser.RuleVisitorParser;
import app.metatron.dataprep.parser.exception.RuleException;
import app.metatron.dataprep.parser.rule.Join;
import app.metatron.dataprep.parser.rule.Rule;
import app.metatron.dataprep.parser.rule.Union;
import app.metatron.dataprep.parser.rule.expr.Constant;
import app.metatron.dataprep.parser.rule.expr.Expression;
import app.metatron.dataprep.teddy.ColumnType;
import app.metatron.dataprep.teddy.DataFrame;
import app.metatron.dataprep.teddy.Row;
import app.metatron.dataprep.teddy.exceptions.IllegalColumnNameForHiveException;
import app.metatron.dataprep.teddy.exceptions.TeddyException;
import app.metatron.dataprep.teddy.exceptions.TransformExecutionFailedException;
import app.metatron.dataprep.teddy.exceptions.TransformTimeoutException;
import app.metatron.dataprep.teddy.histogram.Histogram;
import app.metatron.dataprep.util.PrepUtil;
import app.metatron.dataprep.util.SnapshotCallback;
import app.metatron.dataprep.util.TimestampTemplate;
import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeoutException;
import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PrepContext {

  private static Logger LOGGER = LoggerFactory.getLogger(PrepContext.class);

  private int cacheMB;
  private int limitRows;
  private String hadoopConfDir;
  private int dop;
  private int timeout;

  private Map<String, RevisionSet> rsCache = new HashMap<>();
  private RuleExecutor ruleExecutor;

  private void initThreadPool() {
    ruleExecutor = new RuleExecutor(dop, limitRows, timeout);
  }

  public PrepContext() {
    cacheMB = 1024;
    limitRows = 10000;
    hadoopConfDir = null;
    dop = 2;
    timeout = 3600;

    initThreadPool();
  }

  public static final PrepContext DEFAULT = new PrepContext();

  public PrepContext withCacheMB(int cacheMB) {
    this.cacheMB = cacheMB;
    return this;
  }

  public PrepContext withLimitRows(int samplingRows) {
    this.limitRows = samplingRows;
    initThreadPool();
    return this;
  }

  public PrepContext withDop(int dop) {
    this.dop = dop;
    initThreadPool();
    return this;
  }

  public PrepContext withTimeout(int timeout) {
    this.timeout = timeout;
    initThreadPool();
    return this;
  }

  private void setDefaultValue(SourceDesc src) {
    if (src.getLimit() == null) {
      src.setLimit(limitRows);
    }
    if (src.getHadoopConfDir() == null) {
      src.setHadoopConfDir(hadoopConfDir);
    }
  }

  public String load(SourceDesc src, String dsName) {
    DataFrame df = null;

    setDefaultValue(src);

    switch (src.getType()) {
      case URI:
        df = FileConnector.load(src, dsName);
        break;
      case DATABASE:
        JdbcConnector connector = new JdbcConnector(src);
        df = connector.load(dsName);
        connector.close();
        break;
      case STAGE_DB:
        break;
    }

    Revision rev = new Revision(df);
    RevisionSet rs = new RevisionSet(rev);

    String dsId = UUID.randomUUID().toString();
    rsCache.put(dsId, rs);

    return dsId;
  }

  public void save(String dsId, TargetDesc target) {
    save(fetch(dsId), target);
  }

  public void save(DataFrame df, TargetDesc target) {
    SnapshotCallback callback = null;

    if (target.getCallbackUrl() != null) {
      callback = new SnapshotCallback(target);
    }

    String status = "SUCCEEDED";
    switch (target.getType()) {
      case URI:
        FileConnector fileConnector = new FileConnector(target);
        fileConnector.save(df);
        break;
      case DATABASE:
        try {
          JdbcConnector jdbcConnector = new JdbcConnector(target);
          jdbcConnector.save(df, target.isAppend());
        } catch (SQLException e) {
          e.printStackTrace();
          status = "FAILED";
        }
        break;
      case STAGING_DB:
        break;
    }

    if (callback != null) {
      try {
        callback.updateStatus(status);
      } catch (IOException e) {
        e.printStackTrace();
      }
    }
  }

  public void checkNonAlphaNumericalColNames(String dsId) throws IllegalColumnNameForHiveException {
    Revision rev = getCurRev(dsId);
    DataFrame df = rev.get(-1);
    df.checkAlphaNumericalColNames();
  }

  public void remove(String dsId) throws PrepException {
    if (rsCache.containsKey(dsId)) {
      rsCache.remove(dsId);
    }
  }

  public boolean exists(String dsId) {
    return rsCache.containsKey(dsId);
  }

  // get revision
  private Revision getFirstRev(String dsId) {
    return rsCache.get(dsId).get(0);
  }

  private Revision getCurRev(String dsId) {
    return rsCache.get(dsId).get();
  }

  private Revision getLastRev(String dsId) {
    return rsCache.get(dsId).get(-1);
  }

  // add revision
  private void addRev(String dsId, Revision rev) {
    rsCache.get(dsId).add(rev);
  }

  public int getCurRevIdx(String dsId) {
    return rsCache.get(dsId).getCurRevIdx();
  }

  public int getCurStageIdx(String dsId) {
    RevisionSet rs = rsCache.get(dsId);
    return rs.get().getCurStageIdx();
  }

  public int getRevCnt(String dsId) {
    return rsCache.get(dsId).revs.size();
  }

  public void setCurStageIdx(String dsId, Integer dfIdx) {
    getCurRev(dsId).setCurStageIdx(dfIdx);
  }

  static private List<String> getLiteralList(Expression expr) {
    List<String> literals = new ArrayList<>();
    if (expr instanceof Constant.StringExpr) {
      literals.add(((Constant.StringExpr) expr).getEscapedValue());
    } else if (expr instanceof Constant.ArrayExpr) {
      List list = ((Constant.ArrayExpr) expr).getValue();
      for (int i = 0; i < list.size(); i++) {
        literals.add(i, ((String) list.get(i)).replaceAll("'", ""));

      }
    } else {
      assert false : expr;
    }
    return literals;
  }

  // Public for TeddyExecutor (change soon)
  static public List<String> getSlaveDsIds(String ruleString) {
    Rule rule;

    try {
      rule = new RuleVisitorParser().parse(ruleString);
    } catch (RuleException re) {
      LOGGER.error("getSlaveDsIds(): Rule exception occurred", re);
      throw PrepException.fromTeddyException(TeddyException.fromRuleException(re));
    }

    switch (rule.getName()) {
      case "join":
        return getLiteralList(((Join) rule).getDataset2());
      case "union":
        return getLiteralList(((Union) rule).getDataset2());
      default:
        return null;
    }
  }

  private Map<String, String> getSlaveDsNameMapOfRuleString(String ruleString) {
    Map<String, String> slaveDsNameMap = new HashMap<>();

    List<String> slaveDsIds = getSlaveDsIds(ruleString);
    if (slaveDsIds != null) {
      for (String slaveDsId : slaveDsIds) {
        slaveDsNameMap.put(slaveDsId, getFirstRev(slaveDsId).get(0).dsName);
      }
    }

    return slaveDsNameMap;
  }

  // apply trailing rules of the original revision into the new revision.
  private void appendNewDfs(Revision newRev, Revision rev, int startIdx) {
    for (int i = startIdx; i < rev.size(); i++) {
      DataFrame nextDf;
      String ruleString = rev.get(i).ruleString;
      String jsonRuleString = rev.get(i).jsonRuleString;

      try {
        nextDf = apply(newRev.get(-1), ruleString, jsonRuleString);
      } catch (Exception e) {
        nextDf = new DataFrame(newRev.get(-1));
        nextDf.setRuleString(ruleString);
        nextDf.setValid(false);
      }
      nextDf.setJsonRuleString(jsonRuleString);
      newRev.add(nextDf);
    }
  }

  public DataFrame append(String dsId, String ruleString) {
    return append(dsId, getCurStageIdx(dsId), ruleString, null, false);
  }

  // APPEND *AFTER* stageIdx
  public DataFrame append(String dsId, int stageIdx, String ruleString, String jsonRuleString, boolean suppress) {
    Revision rev = getCurRev(dsId);     // rule apply == revision generate, so always use the last one.
    Revision newRev = new Revision(rev, stageIdx + 1);
    DataFrame newDf = null;
    boolean suppressed = false;

    try {
      newDf = apply(rev.get(stageIdx), ruleString, jsonRuleString);
    } catch (TeddyException te) {
      if (suppress == false) {
        throw PrepException.fromTeddyException(te);   // RuntimeException
      }
      suppressed = true;
      LOGGER.info("append(): TeddyException is suppressed: {}", te.getMessage());
    }

    if (suppressed) {
      newDf = new DataFrame(rev.get(stageIdx));
      newDf.setRuleString(ruleString);
      newDf.setJsonRuleString(jsonRuleString);
      newDf.setValid(false);
    }

    newRev.add(newDf);  // this removes useless revisions

    appendNewDfs(newRev, rev, stageIdx + 1);

    newRev.saveSlaveDsNameMap(getSlaveDsNameMapOfRuleString(ruleString)); // APPEND, UPDATE have a new df
    newRev.setCurStageIdx(rev.getCurStageIdx() + 1);                      // APPEND's result grid is the new appended df

    addRev(dsId, newRev);
    return newDf;
  }

  public DataFrame preview(String dsId, int stageIdx, String ruleString)
          throws TeddyException, TimeoutException, InterruptedException {
    Revision rev = getCurRev(dsId);     // rule apply == revision generate, so always use the last one.
    return apply(rev.get(stageIdx), ruleString, null);
  }

  public DataFrame fetch(String dsId) {
    return fetch(dsId, getCurStageIdx(dsId));
  }

  public DataFrame fetch(String dsId, Integer stageIdx) {
    Revision rev = getCurRev(dsId);
    return rev.get(stageIdx); // if null, get curStage
  }

  private List<DataFrame> getSlaveDfs(String ruleString) {
    List<DataFrame> slaveDfs = null;

    List<String> slaveDsIds = getSlaveDsIds(ruleString);
    if (slaveDsIds != null) {
      slaveDfs = new ArrayList<>();

      for (String slaveDsId : slaveDsIds) {
        Revision slaveRev = getCurRev(slaveDsId);
        slaveDfs.add(slaveRev.get(-1));
      }
    }

    return slaveDfs;
  }

  private DataFrame apply(DataFrame df, String ruleString, String jsonRuleString) throws TeddyException {
    List<DataFrame> slaveDfs = getSlaveDfs(ruleString);

    DataFrame newDf = ruleExecutor.apply(df, ruleString, slaveDfs, null);
    newDf.setJsonRuleString(jsonRuleString);
    return newDf;
  }

  // public for runner
  public DataFrame apply(DataFrame df, String ruleString) throws TeddyException {
    return apply(df, ruleString, null);
  }

  // public for tests
  public DataFrame applyWithDfs(DataFrame df, String ruleString, List<DataFrame> slaveDfs) throws TeddyException {
    DataFrame newDf = ruleExecutor.apply(df, ruleString, slaveDfs, null);
    return newDf;
  }

  public DataFrame undo(String dsId) {
    RevisionSet rs = rsCache.get(dsId);
    Revision rev = rs.undo();
    return rev.get();
  }

  public DataFrame redo(String dsId) {
    RevisionSet rs = rsCache.get(dsId);
    Revision rev = rs.redo();
    return rev.get();
  }

  public void reset(String dsId) {
    rsCache.get(dsId).reset();
  }

  public boolean isUndoable(String dsId) {
    return rsCache.get(dsId).isUndoable();
  }

  public boolean isRedoable(String dsId) {
    return rsCache.get(dsId).isRedoable();
  }

  public void delete(String dsId, int stageIdx) throws TransformExecutionFailedException, TransformTimeoutException {
    Revision rev = getCurRev(dsId);                 // rule apply == revision generate, so always use the last one.
    Revision newRev = new Revision(rev, stageIdx);  // apply previous rules until the delete target.

    appendNewDfs(newRev, rev, stageIdx + 1);

    addRev(dsId, newRev);
  }

  public void update(String dsId, int stageIdx, String ruleString, String jsonRuleString) throws TeddyException {
    Revision rev = getCurRev(dsId);                 // rule apply == revision generate, so always use the last one.
    Revision newRev = new Revision(rev, stageIdx);  // apply previous rules until the update target.

    // replace with the new, updated DF
    DataFrame newDf = apply(rev.get(stageIdx - 1), ruleString, jsonRuleString);
    newRev.add(newDf);
    newRev.setCurStageIdx(stageIdx);

    appendNewDfs(newRev, rev, stageIdx + 1);

    newRev.saveSlaveDsNameMap(getSlaveDsNameMapOfRuleString(ruleString));   // APPEND, UPDATE have a new df

    addRev(dsId, newRev);
  }

  public List<String> getRuleStrings(String dsId) {
    List<String> ruleStrings = new ArrayList<>();
    Revision rev = getCurRev(dsId);
    for (DataFrame df : rev.dfs) {
      ruleStrings.add(df.getRuleString());
    }
    return ruleStrings;
  }

  public List<String> getJsonRuleStrings(String dsId) {
    List<String> jsonRuleStrings = new ArrayList<>();
    Revision rev = getCurRev(dsId);
    for (DataFrame df : rev.dfs) {
      jsonRuleStrings.add(df.getJsonRuleString());
    }
    return jsonRuleStrings;
  }

  public List<Boolean> getValids(String dsId) {
    List<Boolean> valids = new ArrayList<>();
    Revision rev = getCurRev(dsId);
    for (DataFrame df : rev.dfs) {
      valids.add(df.isValid());
    }
    return valids;
  }

  // Applying "header" is the default.
  // In cases of below, we don't do that.
  // 4. The type of column name is not a string. (Datasets from like JDBC, Engine, etc.)
  // 1. A null or empty column name.
  // 2. A column that's name started with a number.
  // 3. The length of the column name is all the same to it's column values. (This needs some efforts.)

  public boolean shouldApplyHeaderRule(DataFrame df) {
    if (df.rows.size() <= 1) {
      return false;
    }

    Row row = df.rows.get(0);
    for (int colno = 0; colno < df.getColCnt(); colno++) {
      if (df.getColType(colno) != ColumnType.STRING) {
        return false;
      }

      String col = (String) row.get(colno);
      if (col == null || col.length() == 0) {
        return false;
      }

      if (Character.isDigit(((String) col).charAt(0))) {
        return false;
      }
    }

    return true;
  }

  // Get header and settype rule strings via inspecting 100 rows.
  public List<String> getAutoTypingRules(DataFrame df) throws TeddyException {
    String[] ruleStrings = new String[3];
    List<String> setTypeRules = new ArrayList<>();
    List<String> colNames = new ArrayList<>(df.colNames);
    List<ColumnType> colTypes = new ArrayList<>();
    List<ColumnType> columnTypesRow0 = new ArrayList<>();
    List<String> formats = new ArrayList<>();

    if (df.colCnt == 0) {
      df.colCnt = df.rows.get(0).objCols.size();
    }

    for (int i = 0; i < df.colCnt; i++) {
      guessColTypes(df, i, colTypes, columnTypesRow0, formats);
    }

    if (shouldApplyHeaderRule(df)) {
      String ruleString = "header rownum: 1";

      setTypeRules.add(ruleString);
      colNames.clear();

      DataFrame newDf = ruleExecutor.apply(df, ruleString, null, null);

      colNames.addAll(newDf.colNames);
    }

    // Build rule strings for Boolean, Long, Double types.
    ruleStrings[0] = "settype col: ";
    ruleStrings[1] = "settype col: ";
    ruleStrings[2] = "settype col: ";

    for (int i = 0; i < df.colCnt; i++) {
      if (colTypes.get(i) == ColumnType.BOOLEAN) {
        ruleStrings[0] = ruleStrings[0] + "`" + colNames.get(i) + "`, ";
      } else if (colTypes.get(i) == ColumnType.LONG) {
        ruleStrings[1] = ruleStrings[1] + "`" + colNames.get(i) + "`, ";
      } else if (colTypes.get(i) == ColumnType.DOUBLE) {
        ruleStrings[2] = ruleStrings[2] + "`" + colNames.get(i) + "`, ";
      } else if (colTypes.get(i) == ColumnType.TIMESTAMP) {
        setTypeRules.add("settype col: `" + colNames.get(i) + "` type: Timestamp format: '" + formats.get(i) + "'");
      }
    }

    //생선된 rulestring을 settypeRules에 추가.
    if (ruleStrings[0].length() > 13) {
      ruleStrings[0] = ruleStrings[0].substring(0, ruleStrings[0].length() - 2) + " type: Boolean";
      setTypeRules.add(ruleStrings[0]);
    }
    if (ruleStrings[1].length() > 13) {
      ruleStrings[1] = ruleStrings[1].substring(0, ruleStrings[1].length() - 2) + " type: Long";
      setTypeRules.add(ruleStrings[1]);
    }
    if (ruleStrings[2].length() > 13) {
      ruleStrings[2] = ruleStrings[2].substring(0, ruleStrings[2].length() - 2) + " type: Double";
      setTypeRules.add(ruleStrings[2]);
    }
    return setTypeRules;
  }

  // Guess column types via inspecting 100 rows.
  private void guessColTypes(DataFrame df, int colNo, List<ColumnType> colTypes, List<ColumnType> columnTypesrow0,
          List<String> formats) {
    List<ColumnType> columnTypeGuess = new ArrayList<>();
    List<TimestampTemplate> timestampStyleGuess = new ArrayList<>();
    ColumnType columnType = ColumnType.STRING;
    String timestampStyle = "";
    int maxCount;
    int maxRow = df.rows.size() < 100 ? df.rows.size() : 100;

    for (int i = 0; i < maxRow; i++) {
      //null check
      if (df.rows.get(i).objCols.get(colNo) == null) {
        columnTypeGuess.add(ColumnType.UNKNOWN);
        continue;
      }

      String str = df.rows.get(i).objCols.get(colNo).toString();

      //Boolean Check
      if (str.equalsIgnoreCase("true") || str.equalsIgnoreCase("false")) {
        columnTypeGuess.add(ColumnType.BOOLEAN);
        continue;
      }

      //Long Check
      try {
        Long.parseLong(str);
        columnTypeGuess.add(ColumnType.LONG);
        continue;
      } catch (Exception e) {
        //LOGGER.info("create(): Detecting Column Type...", e);
      }

      //Double Check
      try {
        Double.parseDouble(str);
        columnTypeGuess.add(ColumnType.DOUBLE);
        continue;
      } catch (Exception e) {
        //LOGGER.info("create(): Detecting Column Type...", e);
      }

      //Timestamp Check
      for (TimestampTemplate tt : TimestampTemplate.values()) {
        try {
          DateTimeFormatter dtf = DateTimeFormat.forPattern(tt.getFormat())
                  .withLocale(Locale.ENGLISH);
          DateTime.parse(str, dtf);

          timestampStyleGuess.add(tt);
          columnTypeGuess.add(ColumnType.TIMESTAMP);
          break;
        } catch (Exception e) {
          //LOGGER.info("create(): Detecting Column Type...", e);
        }
      }

      //Else String
      if (columnTypeGuess.size() == i) {
        columnTypeGuess.add(ColumnType.STRING);
      }
    }

    //가장 많이 선택된 columnType을 확인.
    maxCount = 0;
    for (ColumnType ct : ColumnType.values()) {
      if (Collections.frequency(columnTypeGuess, ct) > maxCount) {
        maxCount = Collections.frequency(columnTypeGuess, ct);
        columnType = ct;
      }
    }

    //columnType == TIMESTAMP인 경우엔 Style 확인 필요.
    maxCount = 0;
    if (columnType == ColumnType.TIMESTAMP) {
      for (TimestampTemplate tt : TimestampTemplate.values()) {
        if (Collections.frequency(timestampStyleGuess, tt) > maxCount) {
          maxCount = Collections.frequency(timestampStyleGuess, tt);
          timestampStyle = tt.getFormat();
        }
      }
    } else {
      timestampStyle = null;
    }

    //최다 득표 타입, 0번 row의 타입, timestampStyle을 넣어준다.
    colTypes.add(columnType);
    columnTypesrow0.add(columnTypeGuess.get(0));
    formats.add(timestampStyle);
  }

  // Just for internal previews. Does not change any of rsCache.
  public DataFrame getAutoTypingPreview(DataFrame df) throws TeddyException {
    List<String> ruleStrings = getAutoTypingRules(df);
    for (String ruleString : ruleStrings) {
      df = ruleExecutor.apply(df, ruleString, null, null);
    }

    return df;
  }

  public DataFrame applyAutoTyping(DataFrame df) throws TeddyException {
    List<String> ruleStrings = getAutoTypingRules(df);
    for (String ruleString : ruleStrings) {
      df = apply(df, ruleString, null);
    }

    return df;
  }

  public List<Histogram> getHists(String dsId, List<Integer> colnos, List<Integer> colWidths) {
    DataFrame df = fetch(dsId);

    LOGGER.debug("createHistsWithColWidths(): df.colCnt={}, colnos={} colWidths={}", df.getColCnt(), colnos, colWidths);
    List<Histogram> hists = new ArrayList<>();

    assert colnos.size() == colWidths.size() : String
            .format("colnos.size()=%d colWidths.size()=%d", colnos.size(), colWidths.size());

    for (int i = 0; i < colnos.size(); i++) {
      int colno = colnos.get(i);
      int colWidth = colWidths.get(i);
      hists.add(Histogram.createHist(df.getColName(colno), df.getColType(colno), df.rows, colno, colWidth));
    }

    LOGGER.trace("createHistsWithColWidths(): finished");
    return hists;
  }

  public void datasetCacheOut() {
    int curSize = rsCache.size();
    int targetSize = 2;
    int idleTime = 120;
    LOGGER.debug("datasetCacheOut(): curSize={} targetSize()={} idleTime={}", curSize, targetSize, idleTime);

    for (String key : rsCache.keySet()) {
      if (curSize <= targetSize) {
        return;
      }

      RevisionSet rs = rsCache.get(key);
      if (rs.isIdle(idleTime)) {
        rsCache.remove(key);
      }
    }
  }
}
