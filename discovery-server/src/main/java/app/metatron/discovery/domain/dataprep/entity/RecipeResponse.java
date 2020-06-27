package app.metatron.discovery.domain.dataprep.entity;

import app.metatron.dataprep.teddy.DataFrame;
import app.metatron.discovery.domain.user.UserProjections;
import org.joda.time.DateTime;

import java.util.List;

public class RecipeResponse {
    private String recipeId;
    private String name;
    private String description;
    private String custom;
    private String creatorDfId;
    private String creatorDsId;
    private List<RecipeRule> recipeRules;
    private Integer ruleCurIdx;
    private Long totalLines;
    private Long totalBytes;
    private DataFrame gridResponse;
    private UserProjections.DefaultUserProjection createdBy;
    private DateTime createdTime;
    private UserProjections.DefaultUserProjection modifiedBy;
    private DateTime modifiedTime;

    public String getRecipeId() {
        return recipeId;
    }

    public void setRecipeId(String recipeId) {
        this.recipeId = recipeId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCustom() {
        return custom;
    }

    public void setCustom(String custom) {
        this.custom = custom;
    }

    public String getCreatorDfId() {
        return creatorDfId;
    }

    public void setCreatorDfId(String creatorDfId) {
        this.creatorDfId = creatorDfId;
    }

    public String getCreatorDsId() {
        return creatorDsId;
    }

    public void setCreatorDsId(String creatorDsId) {
        this.creatorDsId = creatorDsId;
    }

    public List<RecipeRule> getRecipeRules() {
        return recipeRules;
    }

    public void setRecipeRules(List<RecipeRule> recipeRules) {
        this.recipeRules = recipeRules;
    }

    public Integer getRuleCurIdx() {
        return ruleCurIdx;
    }

    public void setRuleCurIdx(Integer ruleCurIdx) {
        this.ruleCurIdx = ruleCurIdx;
    }

    public Long getTotalLines() {
        return totalLines;
    }

    public void setTotalLines(Long totalLines) {
        this.totalLines = totalLines;
    }

    public Long getTotalBytes() {
        return totalBytes;
    }

    public void setTotalBytes(Long totalBytes) {
        this.totalBytes = totalBytes;
    }

    public DataFrame getGridResponse() {
        return gridResponse;
    }

    public void setGridResponse(DataFrame gridResponse) {
        this.gridResponse = gridResponse;
    }

    public UserProjections.DefaultUserProjection getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(UserProjections.DefaultUserProjection createdBy) {
        this.createdBy = createdBy;
    }

    public DateTime getCreatedTime() {
        return createdTime;
    }

    public void setCreatedTime(DateTime createdTime) {
        this.createdTime = createdTime;
    }

    public UserProjections.DefaultUserProjection getModifiedBy() {
        return modifiedBy;
    }

    public void setModifiedBy(UserProjections.DefaultUserProjection modifiedBy) {
        this.modifiedBy = modifiedBy;
    }

    public DateTime getModifiedTime() {
        return modifiedTime;
    }

    public void setModifiedTime(DateTime modifiedTime) {
        this.modifiedTime = modifiedTime;
    }
}
