package app.metatron.discovery.domain.dataprep.repository;


import app.metatron.discovery.domain.dataprep.entity.Recipe;
import app.metatron.discovery.domain.dataprep.entity.RecipeProjections;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(path = "recipes", itemResourceRel = "recipe", collectionResourceRel = "recipe"
        , excerptProjection = RecipeProjections.DefaultProjection.class)
public interface RecipeRepository extends JpaRepository<Recipe, String> {

}
