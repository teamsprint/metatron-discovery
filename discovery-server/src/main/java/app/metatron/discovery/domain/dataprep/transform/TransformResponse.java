package app.metatron.discovery.domain.dataprep.transform;

import app.metatron.discovery.domain.dataprep.entity.RecipeRule;
import app.metatron.dataprep.teddy.DataFrame;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

public class TransformResponse implements Serializable {

    String recipeId;
    int ruleCurIdx;
    List<RecipeRule> recipeRules;
    String undoable;
    String redoable;
    DataFrame gridResponse;

    // for debugging
    Map<String, Object> cacheInfo;
    Long sampledRows;
    Long fullBytes;
    Integer totalRowCnt;

    public TransformResponse() {
    }

    public TransformResponse(String wrangledDsId) {
        this.recipeId = recipeId;
    }

    public TransformResponse(int ruleCurIdx, DataFrame gridResponse) {
        this.ruleCurIdx = ruleCurIdx;
        this.setGridResponse(gridResponse);
    }
    public TransformResponse(DataFrame gridResponse) {
        this.gridResponse = gridResponse;
    }


    public String getRecipeId() {
        return recipeId;
    }

    public void setRecipeId(String recipeId) {
        this.recipeId = recipeId;
    }

    public int getRuleCurIdx() {
        return ruleCurIdx;
    }

    public void setRuleCurIdx(int ruleCurIdx) {
        this.ruleCurIdx = ruleCurIdx;
    }

    public List<RecipeRule> getRecipeRules() {
        return recipeRules;
    }

    public void setRecipeRules(List<RecipeRule> recipeRules, Boolean undoable, Boolean redoable) {
        this.recipeRules = recipeRules;
        this.undoable = undoable.toString();
        this.redoable = redoable.toString();
        this.recipeRules = recipeRules;
    }

    public String getUndoable() {
        return undoable;
    }

    public void setUndoable(String undoable) {
        this.undoable = undoable;
    }

    public String getRedoable() {
        return redoable;
    }

    public void setRedoable(String redoable) {
        this.redoable = redoable;
    }

    public DataFrame getGridResponse() {
        if (null == gridResponse) {
            gridResponse = new DataFrame();
        }
        return gridResponse;
    }

    public void setGridResponse(DataFrame gridResponse) {
        this.gridResponse = gridResponse;
        if (gridResponse == null || null == gridResponse.rows) {
            this.setTotalRowCnt(0);
        } else {
            this.setTotalRowCnt(gridResponse.rows.size());
        }
    }

    public Map<String, Object> getCacheInfo() {
        return cacheInfo;
    }

    public void setCacheInfo(Map<String, Object> cacheInfo) {
        this.cacheInfo = cacheInfo;
    }

    public Long getSampledRows() {
        return sampledRows;
    }

    public void setSampledRows(Long sampledRows) {
        this.sampledRows = sampledRows;
    }

    public Long getFullBytes() {
        return fullBytes;
    }

    public void setFullBytes(Long fullBytes) {
        this.fullBytes = fullBytes;
    }

    public Integer getTotalRowCnt() {
        return totalRowCnt;
    }

    public void setTotalRowCnt(Integer totalRowCnt) {
        this.totalRowCnt = totalRowCnt;
    }
}
