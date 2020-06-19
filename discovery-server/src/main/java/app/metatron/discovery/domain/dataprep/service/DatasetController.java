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
import app.metatron.discovery.domain.dataprep.entity.DatasetProjections;
import app.metatron.discovery.domain.dataprep.entity.DatasetResponse;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;
import app.metatron.discovery.domain.dataprep.repository.DatasetRepository;

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

import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_NO_DATASET;
import static app.metatron.discovery.domain.dataprep.util.PrepUtil.datasetError;

@RequestMapping(value = "/datasets")
@RepositoryRestController
public class DatasetController {

    private static Logger LOGGER = LoggerFactory.getLogger(DatasetController.class);

    @Autowired
    ProjectionFactory projectionFactory;

    @Autowired
    private DatasetService datasetService;

    @Autowired
    private DatasetRepository datasetRepository;

    @Autowired
    PreviewLineService previewLineService;


    @RequestMapping(value = "", method = RequestMethod.POST)
    public
    @ResponseBody
    PersistentEntityResource postDataset(
            @RequestParam(value = "storageType", required = false, defaultValue = "") String storageType,
            @RequestBody Resource<Dataset> datasetResource,
            PersistentEntityResourceAssembler resourceAssembler
    ) {
        Dataset dataset;
        Dataset savedDataset;

        try {
            dataset = datasetResource.getContent();
            savedDataset = this.datasetRepository.save(dataset);
            LOGGER.debug(savedDataset.toString());

            if (dataset.getImportType() == Dataset.IMPORT_TYPE.UPLOAD
                    || dataset.getImportType() == Dataset.IMPORT_TYPE.URI) {
                this.datasetService.changeFileFormatToCsv(dataset);
            }

            previewLineService.savePreviewLines(savedDataset.getDsId());

            datasetRepository.flush();
        } catch (Exception e) {
            LOGGER.error("postDataset(): caught an exception: ", e);
            throw datasetError(PrepMessageKey.MSG_DP_ALERT_DATASET_FAIL_TO_CREATE, e.getMessage());
        }

        return resourceAssembler.toResource(savedDataset);
    }


    @RequestMapping(value = "/{dsId}", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<?> getDataset(
            @PathVariable("dsId") String dsId,
            @RequestParam(value = "preview", required = false, defaultValue = "false") Boolean preview
    ) {
        Dataset dataset;
        DatasetResponse datasetResponse = null;
        try {
            dataset = getDatasetEntity(dsId);
            if (preview) {
                DataFrame dataFrame = previewLineService.getPreviewLines(dsId);
                dataset.setGridResponse(dataFrame);
            }
            datasetResponse = this.datasetService.getDatasetFullInfo(dataset);
        } catch (Exception e) {
            LOGGER.error("getDataset(): caught an exception: ", e);
            throw datasetError(e);
        }
        return ResponseEntity.status(HttpStatus.SC_OK).body(datasetResponse);
    }

    private Dataset getDatasetEntity(String dsId) {
        Dataset dataset = datasetRepository.findOne(dsId);
        if (dataset == null) {
            throw datasetError(MSG_DP_ALERT_NO_DATASET, dsId);
        }
        return dataset;
    }
}
