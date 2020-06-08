package app.metatron.discovery.domain.dataprep.transform;



import app.metatron.dataprep.PrepContext;

import app.metatron.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.domain.dataprep.PrepProperties;
import app.metatron.discovery.domain.dataprep.PreviewLineService;
import app.metatron.discovery.domain.dataprep.entity.*;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.repository.ConnectionRepository;
import app.metatron.discovery.domain.dataprep.repository.DataflowRepository;
import app.metatron.discovery.domain.dataprep.repository.DatasetRepository;
import app.metatron.discovery.domain.dataprep.repository.DataflowDiagramRepository;
import app.metatron.discovery.domain.dataprep.repository.RecipeRepository;
import app.metatron.discovery.domain.dataprep.repository.RecipeRuleRepository;

import app.metatron.dataprep.teddy.DataFrame;
import app.metatron.dataprep.teddy.exceptions.CannotSerializeIntoJsonException;
//import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
//import app.metatron.discovery.domain.dataprep.teddy.exceptions.CannotSerializeIntoJsonException;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.hibernate.Hibernate;
import org.hibernate.proxy.HibernateProxy;
import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

@Service
public class TransformService {

    private static Logger LOGGER = LoggerFactory.getLogger(TransformService.class);

    @Autowired
    PreviewLineService previewLineService;

    @Autowired
    TransformRuleService transformRuleService;

    @Autowired(required = false)
    PrepProperties prepProperties;

    @Autowired
    ConnectionRepository connectionRepository;

    @Autowired
    DataflowRepository dataflowRepository;

    @Autowired
    DatasetRepository datasetRepository;

    @Autowired
    RecipeRepository recipeRepository;

    @Autowired
    DataflowDiagramRepository dataflowDiagramRepository;

    @Autowired
    RecipeRuleRepository recipeRuleRepository;

    @Autowired(required = false)
    RecipeTeddyImpl teddyImpl;

    @Autowired
    PrepHistogramService prepHistogramService;


    public enum OP_TYPE {
        CREATE,
        APPEND,
        UPDATE,
        DELETE,
        JUMP,
        UNDO,
        REDO,
        PREVIEW,
        NOT_USED
    }

    PrepContext pc;


    // create stage0 (POST)
    @Transactional(rollbackFor = Exception.class)
    public TransformResponse create(String dsId, String dfId, String cloningDsName) throws Exception {
        LOGGER.trace("create(): start");

        // Dataset dataset = datasetRepository.findOne(dsId);
        Dataset importedDataset = datasetRepository.findRealOne(datasetRepository.findOne(dsId));
        Dataflow dataflow = dataflowRepository.findOne(dfId);

        // assert importedDataset.getDsType() == IMPORTED : importedDataset.getDsType();
        assert importedDataset!=null:dsId;
        assert dataflow!=null:dfId;

        Recipe recipe = makeRecipe(importedDataset, dataflow, dfId, cloningDsName);
        recipeRepository.save(recipe);

        // Diagram
        List<DataflowDiagram> diagrams = dataflow.getDiagrams();
        Long orderNo = (System.currentTimeMillis() * 100) + 101;
        Long maxNo = 0L;
        if(diagrams!=null && diagrams.size()>0) {
            for(int i=0; i< diagrams.size(); i++) {
                if(dfId.equals(diagrams.get(i).getDataset().getDsId())) {
                    if(maxNo < diagrams.get(i).getOrderNo()) {
                        maxNo = diagrams.get(i).getOrderNo();
                    }
                }
            }
        }
        if(maxNo > 0L) { orderNo = maxNo + 1; }
        DataflowDiagram dataflowDiagram = new DataflowDiagram();
        dataflowDiagram.setDataflow(dataflow);
        dataflowDiagram.setDataset(importedDataset);
        // PRI
        dataflowDiagram.setOrderNo(orderNo);
        dataflowDiagram.setObjType(DataflowDiagram.ObjectType.RECIPE);
        dataflowDiagram.setRecipe(recipe);
        dataflowDiagramRepository.save(dataflowDiagram);




        // We need to save into the repository to get an ID.
        String recipeId = recipe.getRecipeId();
        createStage0(recipeId, importedDataset);

        // wrangledDataset.addDataflow(dataflow);
        // dataflow.addDataset(wrangledDataset);

        // datasetRepository.save(wrangledDataset);
        // dataflowRepository.save(dataflow);

        // The 1st rule string is the master upstream dsId.
        // This could be either an imported dataset or another wrangled dataset.
        String createRuleString = transformRuleService.getCreateRuleString(importedDataset.getDsId());
        String createJsonRuleString = transformRuleService.jsonizeRuleString(createRuleString);
        String shortRuleString = transformRuleService.shortenRuleString(createRuleString);
        RecipeRule rule = new RecipeRule(recipe, 0, createRuleString,
                createJsonRuleString, shortRuleString);
        recipeRuleRepository.saveAndFlush(rule);

        TransformResponse response = new TransformResponse(recipeId);
        response.setRecipeId(recipeId);
        putAddedInfo(response, recipe);

        // Auto type detection and conversion (except cloning case)
        if (cloningDsName == null && prepProperties.isAutoTypingEnabled()) {
            switch (importedDataset.getImportType()) {
                case UPLOAD:
                case URI:
                    List<String> ruleStrings = teddyImpl.getAutoTypingRules(teddyImpl.getCurDf(recipeId));
                    for (int i = 0; i < ruleStrings.size(); i++) {
                        String ruleString = ruleStrings.get(i);
                        String jsonRuleString = transformRuleService.jsonizeRuleString(ruleString);
                        transform(recipeId, TransformService.OP_TYPE.APPEND, i, ruleString, jsonRuleString, true);
                    }
                    break;
                default:
                    break;
            }
        }

        // Save the preview as a file. To be used in dataset details page.
        previewLineService.putPreviewLines(recipeId, teddyImpl.getCurDf(recipeId));

        LOGGER.trace("create(): end");
        return response;
    }


    @Transactional(rollbackFor = Exception.class)
    public TransformResponse clone(String recipedId) throws Exception {
        Recipe recipe = recipeRepository.findOne(recipedId);
        Dataset importedDataset = datasetRepository.findRealOne(datasetRepository.findOne(recipe.getCreatorDsId()));

        String upstreamDsId = getFirstUpstreamDsId(recipedId);

        TransformResponse response = create(upstreamDsId, recipe.getCreatorDfId(),
                importedDataset.getName());
        String cloneDsId = response.getRecipeId();

        List<RecipeRule> recipeRules = getRulesInOrder(recipedId);
        for (int i = 1; i < recipeRules.size(); i++) {
            String ruleString = recipeRules.get(i).getRuleString();
            String jsonRuleString = recipeRules.get(i).getUiContext();
            try {
                response = transform(cloneDsId, TransformService.OP_TYPE.APPEND, i - 1, ruleString, jsonRuleString, true);
            } catch (TeddyException te) {
                LOGGER.info("clone(): A TeddyException is suppressed: {}", te.getMessage());
            }
        }
        return response;
    }


    @Transactional(rollbackFor = Exception.class)
    public TransformResponse fetch(String recipeId, Integer stageIdx) throws IOException {
        TransformResponse response;

        try {
            loadWrangledDataset(recipeId);

            response = fetch_internal(recipeId, stageIdx);
        } catch (CannotSerializeIntoJsonException e) {
            e.printStackTrace();
            throw PrepException.fromTeddyException(e);
        }

        response.setRecipeRules(getRulesInOrder(recipeId), false, false);
        response.setRuleCurIdx(stageIdx != null ? stageIdx : pc.getCurStageIdx(recipeId));

        return response;
    }


    public void putAddedInfo(TransformResponse transformResponse, Recipe recipe) {
        if (transformResponse != null && recipe != null) {
            transformResponse.setSampledRows(recipe.getTotalLines());
            transformResponse.setFullBytes(recipe.getTotalBytes()); // 아직 totalBytes 미구현
        }
    }


    private static Recipe makeRecipe(Dataset importedDataset, Dataflow dataflow,
                                                 String dfId, String cloningDsName) {
        Recipe recipe = new Recipe();

        String newDsName = getNewDsName(importedDataset, dataflow, dfId, cloningDsName);
        recipe.setName(newDsName);
        recipe.setCreatorDfId(dfId);
        recipe.setCreatorDsId(importedDataset.getDsId());
        // recipe.setCreatorDfName(dataflow.getDfName());
        recipe.setCreatedTime(DateTime.now());
        recipe.setModifiedTime(DateTime.now());
        recipe.setCreatedBy(dataflow.getCreatedBy());
        recipe.setModifiedBy(dataflow.getCreatedBy());

        return recipe;
    }

    private DataFrame createStage0(String recipeId, Dataset importedDataset)
            throws CannotSerializeIntoJsonException, JsonProcessingException {
        Recipe recipe = recipeRepository.findOne(recipeId);
        DataFrame gridResponse;

        LOGGER.trace("createStage0: recipeId={}", recipeId);

        switch (importedDataset.getImportType()) {
            case UPLOAD:
            case URI:
                String storedUri = importedDataset.getStoredUri();
                LOGGER.debug("storedUri={}", storedUri);

                gridResponse = teddyImpl.loadFileDataset(recipeId, storedUri, importedDataset.getDelimiter(),
                        importedDataset.getQuoteChar(), importedDataset.getManualColumnCount(), recipe.getName());
                break;

            case DATABASE:
                String queryStmt = importedDataset.getQueryStmt().trim();
                if (queryStmt.charAt(queryStmt.length() - 1) == ';') {
                    queryStmt = queryStmt.substring(0, queryStmt.length() - 1);
                }

                Connection connection = connectionRepository.getOne(importedDataset.getConnId());
                Hibernate.initialize(connection);
                if (connection instanceof HibernateProxy) {
                    connection = (Connection) ((HibernateProxy) connection)
                            .getHibernateLazyInitializer().getImplementation();
                }

                gridResponse = teddyImpl.loadJdbcDataset(recipeId, connection, queryStmt, recipe.getName());
                break;

//            case KAFKA:
//                gridResponse = teddyImpl.loadKafkaDataset(wrangledDataset, importedDataset);
//                break;

            default:
                throw new IllegalArgumentException(
                        "invalid import type: createWrangledDataset\nimportedDataset: " + importedDataset.toString());
        }

        recipe.setRuleCurIdx(0);

        assert gridResponse != null : recipeId;
        recipe.setTotalLines((long) gridResponse.rows.size());

        String createRuleString = transformRuleService.getCreateRuleString(importedDataset.getDsId());
        teddyImpl.getCurDf(recipeId).setRuleString(createRuleString);
        teddyImpl.getCurDf(recipeId).setJsonRuleString(transformRuleService.jsonizeRuleString(createRuleString));

        LOGGER.trace("createStage0(): end");
        return gridResponse;
    }


    // transform (PUT)
    @Transactional(rollbackFor = Exception.class)
    public TransformResponse transform(String recipeId, TransformService.OP_TYPE op, Integer stageIdx,
                                           String ruleString, String jsonRuleString, boolean suppress) throws Exception {
        LOGGER.trace("transform(): start: recipeId={} op={} stageIdx={} ruleString={} jsonRuleString={}",
                recipeId, op, stageIdx, ruleString, jsonRuleString);

        int origStageIdx = preTransform(recipeId, op, ruleString);

        // 아래 각 case에서 ruleCurIdx, matrixResponse는 채워서 리턴
        // rule list는 transform()을 마칠 때에 채움. 모든 op에 대해 동일하기 때문에.
        switch (op) {
            case APPEND:
                teddyImpl.append(recipeId, stageIdx, ruleString, jsonRuleString, suppress);
                if (stageIdx >= origStageIdx) {
                    adjustStageIdx(recipeId, stageIdx + 1, true);
                } else {
                    adjustStageIdx(recipeId, origStageIdx + 1, true);
                }
                break;
            case DELETE:
                teddyImpl.delete(recipeId, stageIdx);
                if (stageIdx <= origStageIdx) {
                    adjustStageIdx(recipeId, origStageIdx - 1, true);
                } else {
                    // Currently, this case does not happen (no delete button after curRuleIdx)
                    adjustStageIdx(recipeId, origStageIdx, true);
                }
                break;
            case UPDATE:
                teddyImpl.update(recipeId, stageIdx, ruleString, jsonRuleString);
                break;
            case UNDO:
                assert stageIdx == null;
                teddyImpl.undo(recipeId);
                adjustStageIdx(recipeId, teddyImpl.getCurStageIdx(recipeId), true);
                break;
            case REDO:
                assert stageIdx == null;
                teddyImpl.redo(recipeId);
                adjustStageIdx(recipeId, teddyImpl.getCurStageIdx(recipeId), true);
                break;
            case JUMP:
                adjustStageIdx(recipeId, stageIdx, true);
                break;
            case PREVIEW:
                LOGGER.trace("transform(): preview end");
                return new TransformResponse(teddyImpl.preview(recipeId, stageIdx, ruleString));
            case NOT_USED:
            default:
                throw new IllegalArgumentException("invalid transform op: " + op.toString());
        }

        LOGGER.trace("transform(): end");
        return postTransform(recipeId, op);
    }

    // transform_histogram (POST)
    public PrepHistogramResponse transform_histogram(String recipedId, Integer stageIdx,
                                                     List<Integer> colnos, List<Integer> colWidths) throws Exception {
        LOGGER.trace("transform_histogram(): start: recipedId={} curRevIdx={} stageIdx={} colnos={} colWidths={}",
                recipedId, pc.getCurRevIdx(recipedId), stageIdx, colnos, colWidths);

        loadWrangledDataset(recipedId);

        assert stageIdx != null;
        assert stageIdx >= 0 : stageIdx;

        DataFrame df = pc.fetch(recipedId, stageIdx);
        List<Histogram> colHists = createHistsWithColWidths(df, colnos, colWidths);

        LOGGER.trace("transform_histogram(): end");
        return new PrepHistogramResponse(colHists);
    }



    private TransformResponse postTransform(String recipeId, TransformService.OP_TYPE op)
            throws CannotSerializeIntoJsonException, JsonProcessingException {
        Recipe recipe = recipeRepository.getOne(recipeId);
        assert recipe != null : recipeId;

        TransformResponse response = null;
        switch (op) {
            case APPEND:
            case DELETE:
            case UNDO:
            case REDO:
            case UPDATE:
                updateTransformRules(recipeId);
                response = fetch_internal(recipeId, recipe.getRuleCurIdx());
                recipe.setTotalLines((long) response.getGridResponse().rows.size());
                previewLineService.putPreviewLines(recipeId, response.getGridResponse());
                break;
            case JUMP:
                response = fetch_internal(recipeId, recipe.getRuleCurIdx());
                break;
            case PREVIEW:
            case NOT_USED:
            default:
                break;
        }

        response.setRuleCurIdx(recipe.getRuleCurIdx());
        // response.setTransformRules(getRulesInOrder(recipeId), teddyImpl.isUndoable(recipeId), teddyImpl.isRedoable(recipeId));
        response.setRecipeRules(getRulesInOrder(recipeId), teddyImpl.isUndoable(recipeId), teddyImpl.isRedoable(recipeId));
        return response;
    }


    // transform_timestampFormat
    public Map<String, Object> transform_timestampFormat(String recipedId, List<String> colNames) throws Exception {
        loadWrangledDataset(recipedId);

        DataFrame df = pc.fetch(recipedId);
        Map<String, Object> response = new HashMap<>();

        if (colNames.size() == 0) {
            colNames.add("");
        }

        for (String colName : colNames) {
            response.put(colName, getTimestampFormatList(df, colName));
        }

        return response;
    }




    public TransformResponse fetch_internal(String recipeId, Integer stageIdx) {
        DataFrame gridResponse = teddyImpl.fetch(recipeId, stageIdx);
        TransformResponse response = new TransformResponse(gridResponse);
        return response;
    }


    private void adjustStageIdx(String recipeId, Integer stageIdx, boolean persist) {

        assert stageIdx != null;

        teddyImpl.setCurStageIdx(recipeId, stageIdx);

        if (persist) {
            Recipe recipe = recipeRepository.findOne(recipeId);
            recipe.setRuleCurIdx(stageIdx);
            recipeRepository.saveAndFlush(recipe);
        }
    }



    private int preTransform(String recipeId, TransformService.OP_TYPE op, String ruleString)
            throws CannotSerializeIntoJsonException, IOException {
        if (op == TransformService.OP_TYPE.APPEND || op == TransformService.OP_TYPE.UPDATE || op == TransformService.OP_TYPE.PREVIEW) {
            PrepRuleChecker.confirmRuleStringForException(ruleString);

            // Check in advance, or a severe inconsistency between stages and rules can happen,
            // when these functions fail at that time, after all works done for the stages successfully.
            transformRuleService.shortenRuleString(ruleString);
        }

        Recipe recipe = recipeRepository.findOne(recipeId);
        assert recipe != null : recipeId;

        // dataset이 loading되지 않았으면 loading
        loadWrangledDataset(recipeId);      // TODO: do compaction (only when UI requested explicitly)

        int origStageIdx = teddyImpl.getCurStageIdx(recipeId);

        // join이나 union의 경우, 대상 dataset들도 loading
        if (ruleString != null) {
            for (String upstreamDsId : transformRuleService.getUpstreamDsIds(ruleString)) {
                loadWrangledDataset(upstreamDsId);
            }
        }

        return origStageIdx;
    }

    public DataFrame loadWrangledDataset(String recipeId) throws IOException, CannotSerializeIntoJsonException {
        return loadWrangledDataset(recipeId, false);
    }

    private DataFrame loadWrangledDataset(String recipeId, boolean compaction)
            throws IOException, CannotSerializeIntoJsonException {
        if (teddyImpl.revisionSetCache.containsKey(recipeId)) {
            if (compaction && !onlyAppend(recipeId)) {
                LOGGER.trace("loadWrangledDataset(): dataset will be uncached and reloaded: dsId={}", recipeId);
            } else {
                return teddyImpl.getCurDf(recipeId);
            }
        }
        LOGGER.trace("loadWrangledDataset(): start: recipeId={}", recipeId);

        DataFrame gridResponse;

        // 만약 PLM cache에 존재하고, transition을 재적용할 필요가 없다면
        if (teddyImpl.revisionSetCache.containsKey(recipeId)) {
            if (onlyAppend(recipeId)) {
                return teddyImpl.getCurDf(recipeId);
            }
        }

        // 이하 코드는 dataset이 PLM cache에 존재하지 않거나, transition을 처음부터 다시 적용해야 하는 경우
        teddyImpl.remove(recipeId);

        Recipe recipe = recipeRepository.getOne(recipeId);

        Dataset upstreamDataset = datasetRepository.getOne(recipe.getCreatorDsId());
        gridResponse = createStage0(recipeId, upstreamDataset);
        teddyImpl.reset(recipeId);

        List<String> ruleStrings = new ArrayList();
        List<String> jsonRuleStrings = new ArrayList();

        prepareTransformRules(recipeId);

        for (RecipeRule transformRule : getRulesInOrder(recipeId)) {
            String ruleString = transformRule.getRuleString();

            // add to the rule string array
            ruleStrings.add(ruleString);
            jsonRuleStrings.add(transformRule.getUiContext());

            // gather slave datasets (load and apply, too)
            List<String> upstreamDsIds = transformRuleService.getUpstreamDsIds(ruleString);

            for (String upstreamDsId : upstreamDsIds) {
                loadWrangledDataset(upstreamDsId);
                // datasetRepository.findRealOne(datasetRepository.findOne(upstreamDsId));
                datasetRepository.getOne(upstreamDsId);
                // datasetRepository.findR
            }
        }

        // 적용할 rule string이 없으면 그냥 리턴.
        if (ruleStrings.size() == 0) {
            LOGGER.trace("loadWrangledDataset(): end (no rules to apply)");
            return teddyImpl.getCurDf(recipeId);
        }

        for (int i = 1; i < ruleStrings.size(); i++) {
            String ruleString = ruleStrings.get(i);
            String jsonRuleString = jsonRuleStrings.get(i);
            gridResponse = teddyImpl.append(recipeId, i - 1, ruleString, jsonRuleString, true);
        }
        updateTransformRules(recipeId);
        adjustStageIdx(recipeId, ruleStrings.size() - 1, true);

        LOGGER.trace("loadWrangledDataset(): end (applied rules)");
        return gridResponse;
    }

    public String getFirstUpstreamDsId(String recipeId) {
        for (RecipeRule rule : recipeRuleRepository.findAllByOrderByRuleNoAsc()) {
            if (rule.getRecipe().getRecipeId().equals(recipeId)) {
                String ruleString = rule.getRuleString();
                assert ruleString.startsWith("create") : ruleString;
                return transformRuleService.getUpstreamDsIdFromCreateRule(ruleString);
            }
        }
        return null;
    }



    public List<String> getUpstreamDsIds(String recipeId) throws CannotSerializeIntoJsonException, JsonProcessingException {
        List<String> upstreamDsIds = new ArrayList();

        String firstUpstreamDsId = getFirstUpstreamDsId(recipeId);
        if (firstUpstreamDsId == null) {  // then, this is not a wrangled dataset
            return upstreamDsIds;
        }
        upstreamDsIds.add(firstUpstreamDsId);

        List<RecipeRule> rules = getRulesInOrder(recipeId);

        for (int i = 0; i < rules.size(); i++) {
            RecipeRule rule = rules.get(i);
            upstreamDsIds.addAll(transformRuleService.getUpstreamDsIds(rule.getRuleString()));
        }
        return upstreamDsIds;
    }


    private void updateTransformRules(String recipeId) throws CannotSerializeIntoJsonException, JsonProcessingException {
        for (RecipeRule rule : getRulesInOrder(recipeId)) {
            recipeRuleRepository.delete(rule);
        }
        recipeRuleRepository.flush();

        List<String> ruleStrings = teddyImpl.getRuleStrings(recipeId);
        List<String> jsonRuleStrings = teddyImpl.getJsonRuleStrings(recipeId);
        List<Boolean> valids = teddyImpl.getValids(recipeId);

        // PrDataset dataset = datasetRepository.findRealOne(datasetRepository.findOne(dsId));
        Recipe recipe = recipeRepository.findOne(recipeId);
        for (int i = 0; i < ruleStrings.size(); i++) {
            String ruleString = ruleStrings.get(i);
            String jsonRuleString = jsonRuleStrings.get(i);
            String shortRuleString = transformRuleService.shortenRuleString(ruleString);
            RecipeRule rule = new RecipeRule(recipe, i, ruleStrings.get(i), jsonRuleString, shortRuleString);
            rule.setValid(valids.get(i));
            recipeRuleRepository.save(rule);
        }

        recipeRuleRepository.flush();
    }

    public List<RecipeRule> getRulesInOrder(String recipeId) {
        List<RecipeRule> rules = new ArrayList<>();

        for (RecipeRule rule : recipeRuleRepository.findAllByOrderByRuleNoAsc()) {
            if (rule.getRecipe().getRecipeId().equals(recipeId)) {
                rules.add(rule);
            }
        }
        return rules;
    }

    private boolean onlyAppend(String recipeId) throws JsonProcessingException {
        List<RecipeRule> recipeRules = getRulesInOrder(recipeId);
        teddyImpl.reset(recipeId);
        return (teddyImpl.getRevCnt(recipeId) == recipeRules.size());
    }

    // Parse the rule string into short version to display in the rule list panel.
    // Server-side do not use jsonRuleString field of TransformRule class.
    // It's used by client-side to store something tied up to the rule.
    private void prepareTransformRules(String recipeId) throws CannotSerializeIntoJsonException, JsonProcessingException {
        Recipe recipe = recipeRepository.getOne(recipeId);
        List<RecipeRule> recipeRules = recipe.getRecipeRules();

        if (recipeRules != null && recipeRules.size() > 0) {
            for (RecipeRule recipeRule : recipeRules) {
                if (recipeRule.getShortRuleString() == null) {
                    String shortRuleString = transformRuleService.shortenRuleString(recipeRule.getRuleString());
                    recipeRule.setShortRuleString(shortRuleString);
                }
            }
        }
    }

    private static String getNewDsName(Dataset importedDataset, Dataflow dataflow, String dfId,
                                       String cloningDsName) {

        if (cloningDsName == null) {
            cloningDsName = importedDataset.getName().replaceFirst(
                    " \\((EXCEL|CSV|JSON|STAGING|MYSQL|ORACLE|TIBERO|HIVE|POSTGRESQL|MSSQL|PRESTO)\\)$", "");
        }

        List<String> dsNames = new ArrayList();
        List<DataflowDiagram> diagrams = dataflow.getDiagrams();
        if(diagrams!=null && diagrams.size() > 0) {
            for (DataflowDiagram dataflowDiagram : diagrams) {
                if (dataflowDiagram.getObjType() == DataflowDiagram.ObjectType.RECIPE) {
                    dsNames.add(dataflowDiagram.getRecipe().getName());
                }
            }
        }

//        for (Dataset dataset : dataflow.getDatasets().ge) {
//            if (dataset.getDsType() != PrDataset.DS_TYPE.IMPORTED) {
//                dsNames.add(dataset.getDsName());
//            }
//        }

        String newDsName = cloningDsName;
        for (int i = 0; /* NOP */ ; i++) {
            if (i != 0) {
                newDsName = String.format("%s (%d)", cloningDsName, i);
            }

            if (!dsNames.contains(newDsName)) {
                return newDsName;
            }

            assert i < 100000 : String.format("Too much duplication: cloningDsName=%s" + cloningDsName);
        }
    }


    private List<Histogram> createHistsWithColWidths(DataFrame df, List<Integer> colnos, List<Integer> colWidths) {
        LOGGER.debug("createHistsWithColWidths(): df.colCnt={}, colnos={} colWidths={}", df.getColCnt(), colnos, colWidths);

        df.colHists = new ArrayList<>();
        List<Future<Histogram>> futures = new ArrayList<>();
        List<Histogram> colHists = new ArrayList<>();

        assert colnos.size() == colWidths.size() : String
                .format("colnos.size()=%d colWidths.size()=%d", colnos.size(), colWidths.size());

        int dop = 16;
        int issued = 0;

        for (int i = 0; i < colnos.size(); i++) {
            int colno = colnos.get(i);
            int colWidth = colWidths.get(i);
            futures.add(prepHistogramService
                    .updateHistWithColWidth(df.getColName(colno), df.getColType(colno), df.rows, colno, colWidth));

            if (++issued == dop) {
                for (int j = 0; j < issued; j++) {
                    try {
                        colHists.add(futures.get(j).get());
                    } catch (InterruptedException e) {
                        LOGGER.error("createHistsWithColWidths(): interrupted", e);
                    } catch (ExecutionException e) {
                        e.getCause().printStackTrace();
                        LOGGER.error("createHistsWithColWidths(): execution error on " + df.dsName, e);
                    }
                }
                issued = 0;
                futures.clear();
            }
        }

        if (issued > 0) {
            for (int j = 0; j < issued; j++) {
                try {
                    colHists.add(futures.get(j).get());
                } catch (InterruptedException e) {
                    LOGGER.error("createHistsWithColWidths(): interrupted", e);
                } catch (ExecutionException e) {
                    e.getCause().printStackTrace();
                    LOGGER.error("createHistsWithColWidths(): execution error on " + df.dsName, e);
                }
            }
        }

        LOGGER.trace("createHistsWithColWidths(): finished");
        return colHists;
    }


    private Map<String, Integer> getTimestampFormatList(DataFrame df, String colName)
            throws Exception {
        Map<String, Integer> timestampFormatList = new LinkedHashMap<>();
        List<TimestampTemplate> timestampStyleGuess = new ArrayList<>();
        int colNo;

        // 기본 포맷은 항상 리턴
        for (TimestampTemplate tt : TimestampTemplate.values()) {
            String timestampFormat = tt.getFormatForRuleString();
            timestampFormatList.put(timestampFormat, 0);
        }

        if (colName.equals("")) {
        } else {

            try {
                colNo = df.getColnoByColName(colName);
            } catch (Exception e) {
                //return null;

                // null은 안된다는 UI 요청. 원칙적으로 colNo가 없을 수는 없는데 룰 로직의 버그로 발생할 수 있는 듯.
                // 확인 필요.
                // 우선 템플릿 중 첫번째 포맷을 디폴트로 사용함
                return timestampFormatList;
            }

            int rowCount = df.rows.size() < 100 ? df.rows.size() : 100;

            for (int i = 0; i < rowCount; i++) {
                if (df.rows.get(i).get(colNo) == null) {
                    continue;
                }

                String str = df.rows.get(i).get(colNo).toString();

                for (TimestampTemplate tt : TimestampTemplate.values()) {
                    try {
                        DateTimeFormatter dtf = DateTimeFormat.forPattern(tt.getFormat()).withLocale(Locale.ENGLISH);
                        DateTime.parse(str, dtf);

                        timestampStyleGuess.add(tt);
                        break;
                    } catch (Exception e) {
                        // Suppress
                    }
                }
            }
        }

        for (TimestampTemplate tt : timestampStyleGuess) {
            String timestampFormat = tt.getFormatForRuleString();
            timestampFormatList.put(timestampFormat, timestampFormatList.get(timestampFormat) + 1);
        }

        return timestampFormatList;
    }


}
