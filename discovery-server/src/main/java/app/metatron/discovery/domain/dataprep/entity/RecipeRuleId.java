package app.metatron.discovery.domain.dataprep.entity;

import java.io.Serializable;

public class RecipeRuleId implements Serializable {

    String recipe;
    Integer ruleNo;

    public RecipeRuleId() {}

    public RecipeRuleId(String recipe, Integer ruleNo) {
        this.recipe = recipe;
        this.ruleNo  = ruleNo;
    }

    @Override
    public int hashCode() {
        return super.hashCode();
    }

    @Override
    public boolean equals(Object obj) {
        return super.equals(obj);
    }
}
