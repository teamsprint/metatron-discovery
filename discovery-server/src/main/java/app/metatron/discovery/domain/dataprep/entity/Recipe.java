package app.metatron.discovery.domain.dataprep.entity;

import app.metatron.discovery.domain.AbstractHistoryEntity;
import app.metatron.dataprep.teddy.DataFrame;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.validator.constraints.NotBlank;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.persistence.*;
import javax.validation.constraints.Size;
import java.util.List;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "recipe")
public class Recipe extends AbstractHistoryEntity {

    private static final Logger LOGGER = LoggerFactory.getLogger(Recipe.class);

    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "uuid2")
    @Column(name = "re_id")
    String recipeId;

    @Column(name = "name")
    @NotBlank
    @Size(max = 150)
    protected String name;

    @Lob
    @Column(name = "description")
    protected String description;

    @Lob
    @Column(name = "custom")
    private String custom;

    @Size(max = 255)
    @Column(name = "creator_df_id")
    private String creatorDfId;

    @Size(max = 255)
    @NotBlank
    @Column(name = "creator_ds_id")
    private String creatorDsId;


    @JsonManagedReference
    @OneToMany(mappedBy = "recipe", fetch = FetchType.LAZY)
    private List<RecipeRule> recipeRules;



    @Column(name = "rule_cur_idx")
    private Integer ruleCurIdx;

//    @Column(name = "manual_column_count")
//    private Integer manualColumnCount;


    @Column(name = "total_lines")
    private Long totalLines;

    @Column(name = "total_bytes")
    private Long totalBytes;


    @Transient
    @JsonProperty
    DataFrame gridResponse;


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
}
