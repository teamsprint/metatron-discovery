package app.metatron.discovery.domain.dataprep.entity;


import com.fasterxml.jackson.annotation.JsonBackReference;
import javax.persistence.*;

@Entity
@IdClass(RecipeRuleId.class)
@Table(name = "recipe_rule")
public class RecipeRule {

    @Id
    @Column(name = "rule_no", nullable = false)
    private Integer ruleNo;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "re_id")
    @JsonBackReference
    private Recipe recipe;

    @Lob
    @Column(name = "rule_string", nullable = false)
    private String ruleString;

    @Column(name = "is_valid", nullable = false)
    private boolean isValid = true;

    @Lob
    @Column(name = "ui_context")
    private String uiContext;

    @Lob
    @Column(name = "short_rule_string")
    private String shortRuleString;

    @Lob
    @Column(name = "custom")
    private String custom;

    public RecipeRule() {
    }

    public RecipeRule(Recipe recipe, Integer ruleNo, String ruleString, String uiContext,
                           String shortRuleString) {
        this.recipe = recipe;
        this.ruleNo = ruleNo;
        this.ruleString = ruleString;
        this.uiContext = uiContext;
        this.shortRuleString = shortRuleString;
    }



    public Integer getRuleNo() {
        return ruleNo;
    }

    public void setRuleNo(Integer ruleNo) {
        this.ruleNo = ruleNo;
    }

    public Recipe getRecipe() {
        return recipe;
    }

    public void setRecipe(Recipe recipe) {
        this.recipe = recipe;
    }

    public String getRuleString() {
        return ruleString;
    }

    public void setRuleString(String ruleString) {
        this.ruleString = ruleString;
    }

    public boolean isValid() {
        return isValid;
    }

    public void setValid(boolean valid) {
        isValid = valid;
    }


    public String getUiContext() {
        return uiContext;
    }

    public void setUiContext(String uiContext) {
        this.uiContext = uiContext;
    }

    public String getShortRuleString() {
        return shortRuleString;
    }

    public void setShortRuleString(String shortRuleString) {
        this.shortRuleString = shortRuleString;
    }

    public String getCustom() {
        return custom;
    }

    public void setCustom(String custom) {
        this.custom = custom;
    }
}
