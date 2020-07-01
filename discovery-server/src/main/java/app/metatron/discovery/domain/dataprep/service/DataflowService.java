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

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.dataprep.PrepParamDatasetIdList;
import app.metatron.discovery.domain.dataprep.entity.*;
import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.repository.DataflowRepository;
import app.metatron.discovery.domain.dataprep.repository.DatasetRepository;
import app.metatron.discovery.domain.dataprep.repository.DataflowDiagramRepository;
import app.metatron.discovery.domain.dataprep.repository.RecipeRepository;
import app.metatron.discovery.domain.dataprep.repository.RecipeRuleRepository;

import app.metatron.discovery.domain.dataprep.transform.TransformResponse;
import app.metatron.discovery.domain.dataprep.transform.TransformService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Lists;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class DataflowService {

    private static Logger LOGGER = LoggerFactory.getLogger(DataflowService.class);

    @Autowired
    private DataflowRepository dataflowRepository;

    @Autowired
    private DatasetRepository datasetRepository;

    @Autowired
    private DataflowDiagramRepository dataflowDiagramRepository;

    @Autowired
    private TransformService transformService;

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private RecipeRuleRepository recipeRuleRepository;


    public Dataflow createDataflow(DataflowRequest dataflowRequest) {
        Dataflow dataflow = new Dataflow();
        dataflow.setName(dataflowRequest.getName());
        dataflow.setDescription(dataflowRequest.getDescription());
        dataflow.setCustom(dataflowRequest.getCustom());
        Dataflow savedDataflow = dataflowRepository.save(dataflow);
        dataflowRepository.flush();

        if(dataflowRequest.getDataset()!=null && dataflowRequest.getDataset().size()>0) {
            Dataset dataset = null;
            int subCount = 0;
            for(String dsId:dataflowRequest.getDataset()) {
                dataset = datasetRepository.findOne(dsId);
                if(dataset!=null) {
                    DataflowDiagram dataflowDiagram = new DataflowDiagram();
                    dataflowDiagram.setDataflow(savedDataflow);
                    dataflowDiagram.setDataset(dataset);
                    // PRI
                    dataflowDiagram.setOrderNo((System.currentTimeMillis()*100) + (subCount*100));
                    // PRI
                    dataflowDiagram.setObjType(DataflowDiagram.ObjectType.DATASET);
                    dataflowDiagram.setRecipe(null);
                    dataflowDiagramRepository.save(dataflowDiagram);
                    // dataflowDiagramRepository.flush();
                    savedDataflow.addDiagram(dataflowDiagram);
                    subCount++;
                    // dataflowDiagram.setReId(null);
                }
            }
            dataflowRepository.saveAndFlush(savedDataflow);
        }
        // dataflowRepository.flush();
        return savedDataflow;
    }


    public void addDatasetUseDatasetList(Dataflow dataflow, List<Dataset> newDataset) {
        if(newDataset==null || newDataset.size()==0) return;
        int subCount = 0;
        for(Dataset dataset:newDataset) {

            DataflowDiagram dataflowDiagram = new DataflowDiagram();
            dataflowDiagram.setDataflow(dataflow);
            dataflowDiagram.setDataset(dataset);
            // PRI
            dataflowDiagram.setOrderNo((System.currentTimeMillis()*100) + (subCount*100));
            // PRI
            dataflowDiagram.setObjType(DataflowDiagram.ObjectType.DATASET);
            dataflowDiagram.setRecipe(null);
            DataflowDiagram savedataflowDiagram = dataflowDiagramRepository.save(dataflowDiagram);

            dataflow.addDiagram(savedataflowDiagram);
            subCount++;
        }
        dataflowRepository.saveAndFlush(dataflow);
    }




    public void afterCreate(Dataflow dataflow) throws PrepException {
        try {
            List<Dataset> datasets = new ArrayList<>();
            List<DataflowDiagram> diagrams = dataflow.getDiagrams();
            if(diagrams!=null && diagrams.size() > 0) {
                for (DataflowDiagram dataflowDiagram : diagrams) {
                    if (dataflowDiagram.getObjType() == DataflowDiagram.ObjectType.DATASET) {
                        datasets.add(dataflowDiagram.getDataset());
                    }
                }
            }

            for (Dataset dataset : datasets) {
                TransformResponse response = this.transformService.create(dataset.getDsId(), dataflow.getDfId(), null);
            }
        } catch (Exception e) {
            LOGGER.error("afterCreate(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
        }

    }


    public void patchAllowedOnly(Dataflow dataflow, Dataflow patchDataflow) {
        List<String> allowKeys = Lists.newArrayList();
        allowKeys.add("name");
        allowKeys.add("description");

        List<String> ignoreKeys = Lists.newArrayList();
        ignoreKeys.add("dfId");

        if (patchDataflow.getName() != null) {
            dataflow.setName(patchDataflow.getName());
        }
        if (patchDataflow.getDescription() != null) {
            dataflow.setDescription(patchDataflow.getDescription());
        }

        ObjectMapper objectMapper = GlobalObjectMapper.getDefaultMapper();
        Map<String, Object> mapDataset = objectMapper.convertValue(patchDataflow, Map.class);
        for (String key : mapDataset.keySet()) {
            if (false == ignoreKeys.contains(key)) {
                continue;
            }

            if (false == allowKeys.contains(key)) {
                LOGGER.debug("'" + key + "' of dataflow is an attribute to which patch is not applied");
            }
        }
    }


    @Transactional(rollbackFor = Exception.class)
    public Dataflow updateDatasets(Dataflow dataflow, PrepParamDatasetIdList dsIds, boolean autoCreate) throws Exception {
        if (dsIds != null) {
            List<DataflowDiagram> removeList = new ArrayList<>();
            List<DataflowDiagram> diagrams = dataflow.getDiagrams();
            List<String> oldIds = Lists.newArrayList();
            List<String> newIds = Lists.newArrayList();
            List<Dataset> newDataset = Lists.newArrayList();
            if (diagrams != null) {
                for (DataflowDiagram diagram : diagrams) {
                    if(diagram.getObjType() == DataflowDiagram.ObjectType.DATASET) {
                        oldIds.add(diagram.getDataset().getDsId());
                        if (true == dsIds.getDsIds().contains(diagram.getDataset().getDsId())) {
                            removeList.add(diagram);
                        }
                    }
                }
            }
            if(removeList.size()>0) {
                for (DataflowDiagram diagram : removeList) {
                    this.dataflowDiagramRepository.delete(diagram);
                }
            }

            for (String dsId : dsIds.getDsIds()) {
                Dataset dataset = datasetRepository.findOne(dsId);
                if (dataset != null) {
                    if (false == oldIds.contains(dsId)) {
                        newIds.add(dsId);
                        newDataset.add(dataset);
                    }
                }
            }
            this.addDatasetUseDatasetList(dataflow, newDataset);
            if (autoCreate) {
                for (String newId : newIds) {
                    TransformResponse response = this.transformService.create(newId, dataflow.getDfId(), null);
                }
            }
        }
        return dataflow;
    }

    @Transactional(rollbackFor = Exception.class)
    public List<String> deleteChain(Dataflow dataflow, String objId) throws Exception {

        List<String> deleteRecipeIds = Lists.newArrayList();
        List<String> deleteDsIds = Lists.newArrayList();
        List<DataflowDiagram> deleteDiagrams = Lists.newArrayList();

        DataflowDiagram.ObjectType objectType = null;
        Dataset dataset = datasetRepository.findOne(objId);
        Recipe recipe = recipeRepository.findOne(objId);
        if(dataset != null) {
            objectType = DataflowDiagram.ObjectType.DATASET;
        }else if(recipe != null) {
            objectType = DataflowDiagram.ObjectType.RECIPE;
        }

        List<DataflowDiagram> diagrams = dataflow.getDiagrams();
        if(objectType!=null && objectType == DataflowDiagram.ObjectType.DATASET) {
            for(DataflowDiagram diagram : diagrams) {
                if(objId.equals(diagram.getDataset().getDsId())) {
                    deleteDiagrams.add(diagram);
                    if(diagram.getRecipe()!= null && diagram.getObjType() == DataflowDiagram.ObjectType.RECIPE) {
                        deleteRecipeIds.add(diagram.getRecipe().getRecipeId());
                        deleteDsIds.add(diagram.getRecipe().getRecipeId());
                    }
                    if(diagram.getRecipe()== null && diagram.getObjType() == DataflowDiagram.ObjectType.DATASET) {
                        deleteDsIds.add(diagram.getDataset().getDsId());
                    }
                }
            }
        }else if(objectType!=null && objectType == DataflowDiagram.ObjectType.RECIPE) {
            for(DataflowDiagram diagram : diagrams) {
                if(diagram.getRecipe()!=null && objId.equals(diagram.getRecipe().getRecipeId())) {
                    deleteDiagrams.add(diagram);
                    deleteRecipeIds.add(diagram.getRecipe().getRecipeId());
                    deleteDsIds.add(diagram.getRecipe().getRecipeId());
                }
            }
        }

        if(deleteDiagrams.size()>0) {
            for(DataflowDiagram diagram : deleteDiagrams) {
                this.dataflowDiagramRepository.delete(diagram);
            }
        }

        return deleteRecipeIds;
    }

    public void deleteChainRecipe(List<String> deleteRecipeIds) {
        Recipe deleteRecipe = null;
        for(String recipeId : deleteRecipeIds) {
            deleteRecipe = this.recipeRepository.findOne(recipeId);
            if(deleteRecipe!=null) {
                List<RecipeRule> recipeRules = deleteRecipe.getRecipeRules();
                if(recipeRules!=null && recipeRules.size()>0) {
                    for(RecipeRule rule:recipeRules) {
                        this.recipeRuleRepository.delete(rule);
                    }
                }
                this.recipeRepository.delete(recipeId);
            }
        }
    }


}
