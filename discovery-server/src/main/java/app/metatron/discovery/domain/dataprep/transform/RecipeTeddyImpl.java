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

import static app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes.PREP_TEDDY_ERROR_CODE;

//import app.metatron.discovery.domain.dataconnection.DataConnection;
//import app.metatron.discovery.domain.dataconnection.DataConnectionHelper;
import app.metatron.discovery.domain.dataprep.entity.Connection;
import app.metatron.discovery.domain.dataprep.service.ConnectionService;
import app.metatron.discovery.domain.dataprep.PrepKafkaService;
import app.metatron.discovery.domain.dataprep.PrepProperties;
//import app.metatron.discovery.domain.dataprep.entity.PrDataset;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;


//import app.metatron.discovery.domain.dataprep.file.PrepCsvUtil;
//import app.metatron.discovery.domain.dataprep.file.PrepJsonUtil;
import app.metatron.dataprep.file.PrepCsvUtil;
import app.metatron.dataprep.file.PrepJsonUtil;

import app.metatron.dataprep.teddy.ColumnType;
import app.metatron.dataprep.teddy.DataFrame;
// import app.metatron.discovery.domain.dataprep.teddy.DataFrameService;
import app.metatron.dataprep.teddy.Row;
import app.metatron.dataprep.teddy.exceptions.IllegalColumnNameForHiveException;
import app.metatron.dataprep.teddy.exceptions.TeddyException;
import app.metatron.dataprep.teddy.exceptions.TransformExecutionFailedException;
import app.metatron.dataprep.teddy.exceptions.TransformTimeoutException;
import app.metatron.discovery.domain.dataprep.util.PrepUtil;
//import app.metatron.discovery.domain.storage.StorageProperties;
//import app.metatron.discovery.domain.storage.StorageProperties.StageDBConnection;
//import app.metatron.discovery.extension.dataconnection.jdbc.accessor.JdbcAccessor;
import com.facebook.presto.jdbc.internal.guava.collect.Maps;
import com.facebook.presto.jdbc.internal.joda.time.DateTime;
import com.facebook.presto.jdbc.internal.joda.time.format.DateTimeFormat;
import com.facebook.presto.jdbc.internal.joda.time.format.DateTimeFormatter;
//import java.sql.Connection;
//import java.sql.SQLException;
//import java.sql.Statement;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import org.apache.commons.io.FilenameUtils;
import org.apache.hadoop.conf.Configuration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class RecipeTeddyImpl {

    private static Logger LOGGER = LoggerFactory.getLogger(RecipeTeddyImpl.class);

    Map<String, RevisionSet> revisionSetCache = Maps.newLinkedHashMap();

    @Autowired(required = false)
    TransformService transformService;

    @Autowired(required = false)
    RecipeDataFrameService dataFrameService;

    @Autowired
    PrepProperties prepProperties;

    @Autowired
    ConnectionService connectionService;

//    @Autowired(required = false)
//    StorageProperties storageProperties;

    @Autowired
    PrepKafkaService kafkaService;

    public void checkNonAlphaNumericalColNames(String recipeId) throws IllegalColumnNameForHiveException {
        Revision rev = getCurRev(recipeId);
        DataFrame df = rev.get(-1);
        df.checkAlphaNumericalColNames();
    }

    public void remove(String recipeId) throws PrepException {
        if (revisionSetCache.containsKey(recipeId)) {
            revisionSetCache.remove(recipeId);
        }
    }

    // get revision
    private Revision getFirstRev(String recipeId) {
        return revisionSetCache.get(recipeId).get(0);
    }

    private Revision getCurRev(String recipeId) {
        return revisionSetCache.get(recipeId).get();
    }

    // add revision
    private void addRev(String recipeId, Revision rev) {
        revisionSetCache.get(recipeId).add(rev);
    }

    public int getCurRevIdx(String recipeId) {
        return revisionSetCache.get(recipeId).getCurRevIdx();
    }

    public int getCurStageIdx(String recipeId) {
        RevisionSet rs = revisionSetCache.get(recipeId);
        return rs.get().getCurStageIdx();
    }

    public int getRevCnt(String recipeId) {
        return revisionSetCache.get(recipeId).revs.size();
    }

    public DataFrame getCurDf(String recipeId) {
        return getCurRev(recipeId).get();
    }

    public void setCurStageIdx(String recipeId, Integer dfIdx) {
        getCurRev(recipeId).setCurStageIdx(dfIdx);
    }

    private Map<String, String> getSlaveDsNameMapOfRuleString(String ruleString) {
        Map<String, String> slaveDsNameMap = new HashMap();

        List<String> slaveDsIds = RecipeDataFrameService.getSlaveDsIds(ruleString);
        if (slaveDsIds != null) {
            for (String slaveDsId : slaveDsIds) {
                slaveDsNameMap.put(slaveDsId, getFirstRev(slaveDsId).get(0).dsName);
            }
        }

        return slaveDsNameMap;
    }

    private void appendNewDfs(Revision newRev, Revision rev, int startIdx) {
        for (int i = startIdx; i < rev.size(); i++) {
            DataFrame nextDf;
            String ruleString = rev.get(i).ruleString;
            String jsonRuleString = rev.get(i).jsonRuleString;

            try {
                nextDf = apply(newRev.get(-1), ruleString,
                        jsonRuleString);   // apply trailing rules of the original revision into the new revision.
            } catch (Exception e) {
                nextDf = new DataFrame(newRev.get(-1));
                nextDf.setRuleString(ruleString);
                nextDf.setValid(false);
            }
            nextDf.setJsonRuleString(jsonRuleString);
            newRev.add(nextDf);
        }
    }

    // APPEND *AFTER* stageIdx
    public DataFrame append(String recipeId, int stageIdx, String ruleString, String jsonRuleString,
                            boolean suppress) {
        Revision rev = getCurRev(recipeId);     // rule apply == revision generate, so always use the last one.
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

        newRev.saveSlaveDsNameMap(
                getSlaveDsNameMapOfRuleString(ruleString));   // APPEND, UPDATE have a new df
        newRev.setCurStageIdx(rev.getCurStageIdx()
                + 1);                        // APPEND's result grid is the new appended df

        addRev(recipeId, newRev);
        return newDf;
    }

    public DataFrame preview(String recipeId, int stageIdx, String ruleString) throws TeddyException {
        Revision rev = getCurRev(recipeId);     // rule apply == revision generate, so always use the last one.
        return apply(rev.get(stageIdx), ruleString, null);
    }

    public DataFrame fetch(String recipeId, Integer stageIdx) {
        Revision rev = getCurRev(recipeId);
        return rev.get(stageIdx); // if null, get curStage
    }

    private DataFrame apply(DataFrame df, String ruleString, String jsonRuleString)
            throws TeddyException {
        List<DataFrame> slaveDfs = null;

        List<String> slaveDsIds = RecipeDataFrameService.getSlaveDsIds(ruleString);
        if (slaveDsIds != null) {
            slaveDfs = new ArrayList<>();

            for (String slaveDsId : slaveDsIds) {
                Revision slaveRev = getCurRev(slaveDsId);
                slaveDfs.add(slaveRev.get(-1));
            }
        }

        DataFrame newDf = dataFrameService.applyRule(df, ruleString, slaveDfs);
        newDf.setJsonRuleString(jsonRuleString);
        return newDf;
    }

    public DataFrame undo(String recipeId) {
        RevisionSet rs = revisionSetCache.get(recipeId);
        Revision rev = rs.undo();
        return rev.get();
    }

    public DataFrame redo(String recipeId) {
        RevisionSet rs = revisionSetCache.get(recipeId);
        Revision rev = rs.redo();
        return rev.get();
    }

    public void reset(String recipeId) {
        revisionSetCache.get(recipeId).reset();
    }

    public boolean isUndoable(String recipeId) {
        return revisionSetCache.get(recipeId).isUndoable();
    }

    public boolean isRedoable(String recipeId) {
        return revisionSetCache.get(recipeId).isRedoable();
    }

    public void delete(String recipeId, int stageIdx) throws TransformExecutionFailedException, TransformTimeoutException {
        Revision rev = getCurRev(recipeId);                 // rule apply == revision generate, so always use the last one.
        Revision newRev = new Revision(rev, stageIdx);  // apply previous rules until the delete target.

        appendNewDfs(newRev, rev, stageIdx + 1);

        addRev(recipeId, newRev);
    }

    public void update(String recipeId, int stageIdx, String ruleString, String jsonRuleString) throws TeddyException {
        Revision rev = getCurRev(recipeId);                 // rule apply == revision generate, so always use the last one.
        Revision newRev = new Revision(rev, stageIdx);  // apply previous rules until the update target.

        // replace with the new, updated DF
        DataFrame newDf = apply(rev.get(stageIdx - 1), ruleString, jsonRuleString);
        newRev.add(newDf);
        newRev.setCurStageIdx(stageIdx);

        appendNewDfs(newRev, rev, stageIdx + 1);

        newRev.saveSlaveDsNameMap(getSlaveDsNameMapOfRuleString(ruleString));   // APPEND, UPDATE have a new df

        addRev(recipeId, newRev);
    }

    public DataFrame loadFileDataset(String recipeId, String strUri, String delimiter, String quoteChar,
                                     Integer columnCount, String dsName) {
        DataFrame df = new DataFrame(dsName);   // to provide dataset name in join, union
        Configuration hadoopConf = PrepUtil.getHadoopConf(prepProperties.getHadoopConfDir(false));
        int samplingRows = prepProperties.getSamplingLimitRows();

        String extensionType = FilenameUtils.getExtension(strUri);
        switch (extensionType) {
            case "json":
                df.setByGrid(PrepJsonUtil.parse(strUri, samplingRows, columnCount, hadoopConf));
                break;
            default: // csv
                PrepCsvUtil csvUtil = PrepCsvUtil.DEFAULT
                        .withDelim(delimiter)
                        .withQuoteChar(quoteChar)
                        .withLimitRows(samplingRows)
                        .withManualColCnt(columnCount)
                        .withHadoopConf(hadoopConf);
                df.setByGrid(csvUtil.parse(strUri));
        }

        return createStage0(recipeId, df);
    }

    private DataFrame createStage0(String recipeId, DataFrame df) {
        Revision rev = new Revision(df);
        RevisionSet rs = new RevisionSet(rev);
        revisionSetCache.put(recipeId, rs);
        return df;
    }



//    public DataFrame loadKafkaDataset(PrDataset wrangledDataset, PrDataset importedDataset) throws PrepException {
//        DataFrame df = kafkaService.createDataFrame(importedDataset, prepProperties.getSamplingLimitRows());
//        return createStage0(wrangledDataset.getDsId(), df);
//    }

    public DataFrame loadJdbcDataFrame(Connection connection, String sql, int limit, String recipeName) {
        DataFrame df = connectionService.loadJdbcDataFrame(connection, sql, limit, recipeName);
        return df;
    }

    public DataFrame loadJdbcDataset(String recipeId, Connection connection, String sql, String recipeName)
            throws PrepException {
        DataFrame df = loadJdbcDataFrame(connection, sql, prepProperties.getSamplingLimitRows(), recipeName);
        return createStage0(recipeId, df);
    }

    public List<String> getRuleStrings(String recipeId) {
        List<String> ruleStrings = new ArrayList<>();
        Revision rev = getCurRev(recipeId);
        for (DataFrame df : rev.dfs) {
            ruleStrings.add(df.getRuleString());
        }
        return ruleStrings;
    }

    public List<String> getJsonRuleStrings(String recipeId) {
        List<String> jsonRuleStrings = new ArrayList<>();
        Revision rev = getCurRev(recipeId);
        for (DataFrame df : rev.dfs) {
            jsonRuleStrings.add(df.getJsonRuleString());
        }
        return jsonRuleStrings;
    }

    public List<Boolean> getValids(String recipeId) {
        List<Boolean> valids = new ArrayList<>();
        Revision rev = getCurRev(recipeId);
        for (DataFrame df : rev.dfs) {
            valids.add(df.isValid());
        }
        return valids;
    }

    private boolean looksLikeHeadered(DataFrame df) {
        if (df.rows.size() == 0) {
            return false;
        }

        Set<Object> strSet = new HashSet();
        for (int i = 0; i < df.getColCnt(); i++) {
            Object obj = df.rows.get(0).get(i);
            if (obj == null || !(obj instanceof String)) {
                return false;
            }

            if (strSet.contains(obj)) {
                return false;
            }
            strSet.add(obj);
        }

        return true;
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
        List<String> setTypeRules = new ArrayList();
        List<String> colNames = new ArrayList(df.colNames);
        List<ColumnType> colTypes = new ArrayList();
        List<ColumnType> columnTypesRow0 = new ArrayList();
        List<String> formats = new ArrayList();

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

            DataFrame newDf = dataFrameService.applyRule(df, ruleString, null);

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

    // Just apply rules to dataframe. No rule list
    public DataFrame applyAutoTyping(DataFrame df) throws TeddyException {
        if (!prepProperties.isAutoTypingEnabled()) {
            return df;
        }

        List<String> ruleStrings = getAutoTypingRules(df);
        for (String ruleString : ruleStrings) {
            df = dataFrameService.applyRule(df, ruleString, null);
        }

        return df;
    }

    public void datasetCacheOut() {
        int curSize = revisionSetCache.size();
        int targetSize = prepProperties.getSamplingCacheSize();
        int idleTime = prepProperties.getSamplingIdleTime();
        LOGGER.debug("datasetCacheOut(): curSize={} targetSize()={} idleTime={}", curSize, targetSize, idleTime);

        for (String key : revisionSetCache.keySet()) {
            if (curSize <= targetSize) {
                return;
            }

            RevisionSet rs = revisionSetCache.get(key);
            if (rs.isIdle(idleTime)) {
                revisionSetCache.remove(key);
            }
        }
    }
}
