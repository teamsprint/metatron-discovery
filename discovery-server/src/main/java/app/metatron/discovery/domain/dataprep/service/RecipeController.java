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

import app.metatron.dataprep.teddy.DataFrame;
import app.metatron.discovery.domain.dataprep.PreviewLineService;
import app.metatron.discovery.domain.dataprep.entity.Dataset;
import app.metatron.discovery.domain.dataprep.entity.Recipe;
import app.metatron.discovery.domain.dataprep.entity.RecipeProjections;
import app.metatron.discovery.domain.dataprep.entity.RecipeResponse;
import app.metatron.discovery.domain.dataprep.repository.RecipeRepository;

import org.apache.http.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.hateoas.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_NO_DATASET;
import static app.metatron.discovery.domain.dataprep.util.PrepUtil.datasetError;

@RequestMapping(value = "/recipes")
@RepositoryRestController
public class RecipeController {
    private static Logger LOGGER = LoggerFactory.getLogger(RecipeController.class);

    @Autowired
    ProjectionFactory projectionFactory;

    @Autowired
    RecipeService recipeService;

    @Autowired
    RecipeRepository recipeRepository;

    @Autowired
    PreviewLineService previewLineService;

    @RequestMapping(value = "/{recipeId}", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<?> getDataset(
            @PathVariable("recipeId") String recipeId,
            @RequestParam(value = "preview", required = false, defaultValue = "false") Boolean preview
    ) {
        Recipe recipe;
        RecipeResponse recipeResponse =  null;
        try {
            recipe = getRecipeEntity(recipeId);
            if (preview) {
                DataFrame dataFrame = previewLineService.getPreviewLinesOnlyRecipe(recipeId);
                recipe.setGridResponse(dataFrame);
            }
            recipeResponse = this.recipeService.getRecipeFullInfo(recipe);
        } catch (Exception e) {
            LOGGER.error("getRecipe(): caught an exception: ", e);
            throw datasetError(e);
        }
        return ResponseEntity.status(HttpStatus.SC_OK).body(recipeResponse);
    }

    private Recipe getRecipeEntity(String recipeId) {
        Recipe recipe = recipeRepository.findOne(recipeId);
        if (recipe == null) {
            throw datasetError(MSG_DP_ALERT_NO_DATASET, recipeId);
        }
        return recipe;
    }
}
