package app.metatron.discovery.domain.dataprep.transform;


import app.metatron.dataprep.parser.RuleVisitorParser;
import app.metatron.dataprep.parser.rule.Keep;
import app.metatron.dataprep.parser.rule.Rule;
import app.metatron.dataprep.parser.rule.expr.Expression;
import app.metatron.dataprep.teddy.DataFrame;
import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;
import app.metatron.discovery.domain.dataprep.rule.ExprFunction;
import com.google.common.collect.Maps;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RepositoryRestController
public class TransformController {

    private static Logger LOGGER = LoggerFactory.getLogger(TransformController.class);

    @Autowired(required = false)
    TransformService transformService;

    @RequestMapping(value = "/datasets/{dsId}/transform", method = RequestMethod.POST, produces = "application/json")
    public
    @ResponseBody
    ResponseEntity<?> create(
            @PathVariable("dsId") String importedDsId,
            @RequestBody TransformRequest request) throws IOException {

        TransformResponse response;
        LOGGER.trace("create(): start");

        try {
            response = transformService.create(importedDsId, request.getDfId(), request.getPredefinedDsName());
        } catch (Exception e) {
            LOGGER.error("create(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
        }

        LOGGER.trace("create(): end");
        return ResponseEntity.ok(response);
    }

    // 대상 wrangled dataset과 똑같은 dataset을 생성 (rule도 모두 적용)
    @RequestMapping(value = "/recipes/{recipeId}/clone", method = RequestMethod.POST, produces = "application/json")
    public
    @ResponseBody
    ResponseEntity<?> clone(
            @PathVariable("recipeId") String recipeId) throws IOException {

        TransformResponse response;

        try {
            response = transformService.clone(recipeId);
        } catch (Exception e) {
            LOGGER.error("clone(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
        }

        return ResponseEntity.ok(response);
    }

    private DataFrame getSubGrid(DataFrame gridResponse, int offset, int count) {
        assert count >= 0;

        DataFrame subGrid = new DataFrame();
        subGrid.colCnt = gridResponse.colCnt;
        subGrid.colNames = gridResponse.colNames;
        subGrid.colDescs = gridResponse.colDescs;
        subGrid.colHists = gridResponse.colHists;
        subGrid.mapColno = gridResponse.mapColno;
        subGrid.newColNames = gridResponse.newColNames;
        subGrid.interestedColNames = gridResponse.interestedColNames;
        subGrid.dsName = gridResponse.dsName;
        subGrid.slaveDsNameMap = gridResponse.slaveDsNameMap;
        subGrid.ruleString = gridResponse.ruleString;

        // returns without subList()
        if (offset == 0 && count >= gridResponse.rows.size()) {
            subGrid.rows = gridResponse.rows;
        } else {
            int toIndex = offset + count;
            if (gridResponse.rows.size() < toIndex) {
                toIndex = gridResponse.rows.size();
            }

            subGrid.rows = gridResponse.rows.subList(offset, toIndex);
        }

        return subGrid;
    }

    /* column 기준 데이터라서 컨트롤러에서 서치하면 성능에 골치아픔. 우선 통짜로 구현함 */
    @RequestMapping(value = "/recipes/{recipeId}/transform", method = RequestMethod.GET, produces = "application/json")
    public
    @ResponseBody
    ResponseEntity<?> fetch(
            @PathVariable("recipeId") String recipeId,
            @RequestParam(value = "ruleIdx") Integer stageIdx,
            @RequestParam(value = "offset") int offset,
            @RequestParam(value = "count") int count
    ) throws IOException {
        TransformResponse response;
        LOGGER.trace("fetch(): start");

        try {
            // stageIdx should be 0 or positive or null.
            assert stageIdx == null || stageIdx >= 0 : stageIdx;

            response = transformService.fetch(recipeId, stageIdx);
            Integer totalRowCnt = response.getGridResponse().rows != null ? response.getGridResponse().rows.size() : 0;
            response.setGridResponse(getSubGrid(response.getGridResponse(), offset, count));
            response.setTotalRowCnt(totalRowCnt);
        } catch (Exception e) {
            LOGGER.error("fetch(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
        }

        LOGGER.trace("fetch(): end");
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = "/recipes/{recipeId}/transform", method = RequestMethod.PUT, produces = "application/json")
    public
    @ResponseBody
    ResponseEntity<?> transform(
            @PathVariable("recipedId") String recipeId,
            @RequestBody TransformRequest request) throws IOException {

        TransformResponse response;
        LOGGER.trace("transform(): start");

        assert request.getCount() != null;

        try {
            // stageIdx should be 0 or positive or null.
            Integer stageIdx = request.getRuleIdx();
            assert stageIdx == null || stageIdx >= 0 : stageIdx;

            response = transformService
                    .transform(recipeId, request.getOp(), stageIdx, request.getRuleString(), request.getUiRuleString(),
                            false);
        } catch (Exception e) {
            LOGGER.error("transform(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
        }

        LOGGER.trace("transform(): end");

        Integer totalRowCnt = response.getGridResponse().rows != null ? response.getGridResponse().rows.size() : 0;
        response.setGridResponse(getSubGrid(response.getGridResponse(), 0, request.getCount()));
        response.setTotalRowCnt(totalRowCnt);

        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = "/recipes/{recipeId}/transform/histogram", method = RequestMethod.POST, produces = "application/json")
    public
    @ResponseBody
    ResponseEntity<?> transform_histogram(
            @PathVariable("recipeId") String recipeId,
            @RequestBody PrepHistogramRequest request) throws IOException {

        PrepHistogramResponse response;
        LOGGER.trace("transform_histogram(): start");

        try {
            response = transformService
                    .transform_histogram(recipeId, request.getRuleIdx(), request.getColnos(), request.getColWidths());
        } catch (Exception e) {
            LOGGER.error("transform_histogram(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
        }

        LOGGER.trace("transform_histogram(): end");
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = "/recipes/{recipeId}/transform/timestampFormat", method = RequestMethod.POST, produces = "application/json")
    public
    @ResponseBody
    ResponseEntity<?> transform_timestampFormat(
            @PathVariable("recipeId") String recipeId,
            @RequestBody Map<String, Object> params) throws IOException {

        Map<String, Object> response;
        List<String> colNames = (List<String>) params.get("colNames");
        LOGGER.trace("transform_timestampFormat(): start");

        try {
            response = transformService.transform_timestampFormat(recipeId, colNames);
        } catch (Exception e) {
            LOGGER.error("transform_timestampFormat(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
        }

        LOGGER.trace("transform_timestampFormat(): end");
        return ResponseEntity.ok(response);
    }



}
