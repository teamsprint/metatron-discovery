package app.metatron.discovery.domain.dataprep.entity;

import org.springframework.data.rest.core.config.Projection;

import java.util.List;

public class RecipeProjections {

    @Projection(name = "default", types = {Recipe.class})
    public interface DefaultProjection {

        String getRecipeId();

        String getName();

        String getDescription();

        String getCustom();

        String getCreatorDfId();

        String getCreatorDsId();

        Integer getRuleCurIdx();

        List<RecipeRule> getRecipeRules();

        Long getTotalLines();

        Long getTotalBytes();










    }
}
