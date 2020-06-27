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

package app.metatron.discovery.domain.dataprep.service;

import app.metatron.discovery.domain.user.User;
import app.metatron.discovery.domain.user.UserRepository;
import app.metatron.discovery.domain.user.UserProjections;
import app.metatron.discovery.domain.dataprep.entity.RecipeResponse;
import app.metatron.discovery.domain.dataprep.entity.Recipe;
import app.metatron.discovery.domain.dataprep.entity.RecipeRule;
import app.metatron.discovery.domain.dataprep.repository.RecipeRepository;
import app.metatron.discovery.domain.dataprep.repository.RecipeRuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.hateoas.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RecipeService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    RecipeRepository recipeRepository;

    @Autowired
    ProjectionFactory projectionFactory;

    @Autowired
    RecipeRuleRepository recipeRuleRepository;

    public RecipeResponse getRecipeFullInfo(Recipe recipe)  {
        RecipeResponse recipeResponse = new RecipeResponse();
        if(recipe.getCreatedBy() != null) {
            User cUser = userRepository.findByUsername(recipe.getCreatedBy());
            if(cUser != null) {
                UserProjections.DefaultUserProjection projectionC = projectionFactory
                        .createProjection(UserProjections.DefaultUserProjection.class, cUser);
                recipeResponse.setCreatedBy(projectionC);
            }
        }
        if(recipe.getModifiedBy() != null) {
            User mUser = userRepository.findByUsername(recipe.getModifiedBy());
            if(mUser != null) {
                UserProjections.DefaultUserProjection projectionM = projectionFactory
                        .createProjection(UserProjections.DefaultUserProjection.class, mUser);
                recipeResponse.setModifiedBy(projectionM);
            }
        }
        recipeResponse.setCreatedTime(recipe.getCreatedTime());
        recipeResponse.setModifiedTime(recipe.getModifiedTime());

        recipeResponse.setRecipeId(recipe.getRecipeId());
        recipeResponse.setName(recipe.getName());
        recipeResponse.setDescription(recipe.getDescription());
        recipeResponse.setCustom(recipe.getCustom());
        recipeResponse.setCreatorDfId(recipe.getCreatorDfId());
        recipeResponse.setCreatorDsId(recipe.getCreatorDfId());
        recipeResponse.setRecipeRules(recipe.getRecipeRules());
        recipeResponse.setRuleCurIdx(recipe.getRuleCurIdx());
        recipeResponse.setTotalLines(recipe.getTotalLines());
        recipeResponse.setTotalBytes(recipe.getTotalBytes());
        recipeResponse.setGridResponse(recipe.getGridResponse());


        return recipeResponse;
    }
}
