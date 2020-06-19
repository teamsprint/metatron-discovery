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

import app.metatron.discovery.domain.dataprep.PrepParamDatasetIdList;
import app.metatron.discovery.domain.dataprep.SwapRequest;
import app.metatron.discovery.domain.dataprep.Upstream;
import app.metatron.discovery.domain.dataprep.entity.*;
import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;

import app.metatron.discovery.domain.dataprep.repository.DataflowRepository;
import app.metatron.discovery.domain.dataprep.repository.DatasetRepository;
import app.metatron.discovery.domain.dataprep.repository.DataflowDiagramRepository;

import app.metatron.discovery.domain.dataprep.repository.RecipeRepository;
import app.metatron.discovery.domain.dataprep.repository.RecipeRuleRepository;
import app.metatron.discovery.domain.dataprep.transform.TransformResponse;
import com.google.common.collect.Lists;
import org.apache.http.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.data.rest.webmvc.PersistentEntityResource;
import org.springframework.data.rest.webmvc.PersistentEntityResourceAssembler;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.hateoas.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import app.metatron.discovery.domain.dataprep.transform.TransformService;

import java.util.ArrayList;
import java.util.List;

import static app.metatron.discovery.domain.dataprep.util.PrepUtil.dataflowError;

@RequestMapping(value = "/dataflows")
@RepositoryRestController
public class DataflowController {

    private static Logger LOGGER = LoggerFactory.getLogger(DataflowController.class);

    @Autowired
    DataflowRepository dataflowRepository;

    @Autowired
    DataflowDiagramRepository dataflowDiagramRepository;

    @Autowired
    DataflowService dataflowService;

    @Autowired
    ProjectionFactory projectionFactory;

    @Autowired
    TransformService transformService;



    @RequestMapping(value = "", method = RequestMethod.POST)
    @ResponseBody
    public
    PersistentEntityResource postDataflow(
            @RequestBody DataflowRequest dataflowRequest,
            PersistentEntityResourceAssembler resourceAssembler
    ) {
        Dataflow savedDataflow;
        try {
            savedDataflow = this.dataflowService.createDataflow(dataflowRequest);
            this.dataflowService.afterCreate(savedDataflow);
        } catch (Exception e) {
            LOGGER.error("postDataflow(): caught an exception: ", e);
            throw PrepException
                    .create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_NO_DATAFLOW, e.getMessage());
        }
        return resourceAssembler.toResource(savedDataflow);
    }


    @RequestMapping(value = "/{dfId}", method = RequestMethod.PATCH)
    @ResponseBody
    public ResponseEntity<?> patchDataflow(
            @PathVariable("dfId") String dfId,
            @RequestBody Resource<Dataflow> dataflowResource
    ) {

        Dataflow dataflow;
        Dataflow patchDataflow;
        Dataflow savedDataflow;
        Resource<DataflowProjections.DefaultProjection> projectedDataflow;

        try {
            dataflow = this.dataflowRepository.findOne(dfId);
            patchDataflow = dataflowResource.getContent();

            this.dataflowService.patchAllowedOnly(dataflow, patchDataflow);

            savedDataflow = dataflowRepository.save(dataflow);
            LOGGER.debug(savedDataflow.toString());

            this.dataflowRepository.flush();
        } catch (Exception e) {
            LOGGER.error("postDataflow(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, e);
        }

        DataflowProjections.DefaultProjection projection = projectionFactory
                .createProjection(DataflowProjections.DefaultProjection.class, savedDataflow);
        projectedDataflow = new Resource<>(projection);
        return ResponseEntity.status(HttpStatus.SC_OK).body(projectedDataflow);
    }



    @RequestMapping(value = "/{dfId}", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<?> getDataflow(
            @PathVariable("dfId") String dfId
    ) {
        Dataflow dataflow = null;
        Resource<DataflowProjections.DefaultProjection> projectedDataflow = null;
        try {
            dataflow = this.dataflowRepository.findOne(dfId);
            if (dataflow != null) {
                List<Upstream> upstreams = Lists.newArrayList();
                if(dataflow.getDiagrams()!=null) {
                    for (DataflowDiagram diagram : dataflow.getDiagrams()) {
                        if (diagram.getObjType() == DataflowDiagram.ObjectType.RECIPE) {
                            String recipeId = diagram.getRecipe().getRecipeId();
                            List<String> upstreamDsIds = this.transformService.getUpstreamDsIds(recipeId);
                            if (null != upstreamDsIds) {
                                for (String upstreamDsId : upstreamDsIds) {
                                    Upstream upstream = new Upstream();
                                    upstream.setDfId(dfId);
                                    upstream.setReId(recipeId);
                                    upstream.setUpstreamDsId(upstreamDsId);
                                    upstreams.add(upstream);
                                }
                            }
                        }
                    }
                }
                dataflow.setUpstreams(upstreams);
                DataflowProjections.DefaultProjection projection = projectionFactory
                        .createProjection(DataflowProjections.DefaultProjection.class, dataflow);
                projectedDataflow = new Resource<>(projection);
            } else {
                throw PrepException
                        .create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_NO_DATAFLOW, dfId);
            }

        } catch (Exception e) {
            LOGGER.error("getDataflow(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, e);
        }
        return ResponseEntity.status(HttpStatus.SC_OK).body(projectedDataflow);
    }


    @RequestMapping(value = "/{dfId}", method = RequestMethod.DELETE)
    @ResponseBody
    public ResponseEntity<?> deleteDataflow(
            @PathVariable("dfId") String dfId
    ) {
        try {
            Dataflow dataflow = this.dataflowRepository.findOne(dfId);
            if (null != dataflow) {
                ArrayList<DataflowDiagram> dataflowDiagrams = Lists.newArrayList();
                dataflowDiagrams.addAll(dataflow.getDiagrams());
                // TODO. 삭제 영역 협의 필요
            }



        } catch (Exception e) {
            LOGGER.error("deleteDataflow(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, e);
        }

        return ResponseEntity.status(HttpStatus.SC_OK).body(dfId);
    }




    @RequestMapping(value = "/delete_chain/{dfId}/{objId}", method = RequestMethod.DELETE)
    @ResponseBody
    public ResponseEntity<?> deleteChain(
            @PathVariable("dfId") String dfId,
            @PathVariable("objId") String objId
    ) {
        List<String> deleteDsIds = null;
        List<String> deleteRecipeIds = null;
        try {
            Dataflow dataflow = dataflowRepository.findOne(dfId);
            if (null != dataflow) {
                deleteRecipeIds = this.dataflowService.deleteChain(dataflow, objId);
                if(deleteRecipeIds!=null && deleteRecipeIds.size()>0) {
                    this.dataflowService.deleteChainRecipe(deleteRecipeIds);
                }
            }else {
                String errorMsg = "No dataflow [" + dfId + "]";
                throw PrepException
                        .create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_NO_DATAFLOW, errorMsg);
            }
        } catch (Exception e) {
            LOGGER.error("deleteChain(): caught an exception: ", e);
            throw dataflowError(e);
        }
        return ResponseEntity.status(HttpStatus.SC_OK).body(deleteDsIds);
    }



    @RequestMapping(value = "/{dfId}/upstreammap", method = RequestMethod.GET, produces = "application/json")
    public
    @ResponseBody
    ResponseEntity<?> getStreams(
            @PathVariable("dfId") String dfId,
            @RequestParam(value = "forUpdate", required = false, defaultValue = "false") String forUpdate
    ) {
        List<Upstream> upstreams = Lists.newArrayList();
        try {
            Dataflow dataflow = dataflowRepository.findOne(dfId);
            if (null != dataflow) {
                List<DataflowDiagram> diagrams = dataflow.getDiagrams();
                if (null != diagrams) {
                    for (DataflowDiagram diagram : diagrams) {
                        // String dsId = diagram.getDataset().getDsId();
                        if (diagram.getObjType() == DataflowDiagram.ObjectType.RECIPE) {
                            String recipeId = diagram.getRecipe().getRecipeId();
                            List<String> upstreamDsIds = this.transformService.getUpstreamDsIds(recipeId);
                            if (null != upstreamDsIds) {
                                for (String upstreamDsId : upstreamDsIds) {
                                    Upstream upstream = new Upstream();
                                    upstream.setDfId(dfId);
                                    upstream.setReId(recipeId);
                                    upstream.setUpstreamDsId(upstreamDsId);
                                    upstreams.add(upstream);
                                }
                            }
                        }
                    }
                }
            } else {
                String errorMsg = "No dataflow [" + dfId + "]";
                throw PrepException
                        .create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_NO_DATAFLOW, errorMsg);
            }
        } catch (Exception e) {
            LOGGER.error("getStreams(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, e);
        }

        return ResponseEntity.status(HttpStatus.SC_OK).body(upstreams);
    }


    @RequestMapping(value = "/{dfId}/update_datasets", method = RequestMethod.PUT, produces = "application/json")
    public
    @ResponseBody
    ResponseEntity<?> updateDatasets(
            @PathVariable("dfId") String dfId,
            @RequestBody PrepParamDatasetIdList dsIds
    ) {
        // If an I.DS is new to the dataflow, we create a corresponding W.DS, except the case of dataset swapping.
        boolean autoCreate = (dsIds.getForSwap() != null && dsIds.getForSwap() == true) ? false : true;
        Dataflow dataflow = dataflowRepository.findOne(dfId);
        Dataflow reponseDataflow = null;
        try {
            if (dataflow != null) {
                this.dataflowService.updateDatasets(dataflow, dsIds, autoCreate);
                reponseDataflow = dataflowRepository.findOne(dfId);
            } else {
                String errorMsg = new String("dataflow[" + dfId + "] was not found");
                throw PrepException
                        .create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_NO_DATAFLOW, errorMsg);
            }
        } catch (Exception e) {
            LOGGER.error("addDataset(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, e);
        }
        return ResponseEntity.status(HttpStatus.SC_OK).body(reponseDataflow);
    }

//    @RequestMapping(value = "/{dfId}/swap_upstream", method = RequestMethod.POST, produces = "application/json")
//    public
//    @ResponseBody
//    ResponseEntity<?> swapUpstream(
//            @PathVariable("dfId") String dfId,
//            @RequestBody SwapRequest swapRequest
//    ) {
//        Dataflow dataflow = dataflowRepository.findOne(dfId);
//
//        try {
//            List<String> affectedDsIds = transformService.swap_upstream(dataflow, swapRequest);
//            transformService.after_swap(affectedDsIds);
//        } catch (Exception e) {
//            LOGGER.error("swap_upstream(): caught an exception: ", e);
//            throw PrepException.create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, e);
//        }
//
//        return ResponseEntity.status(HttpStatus.SC_OK).body(dataflow);
//    }
}
