package app.metatron.discovery.domain.dataprep.service;


import app.metatron.discovery.domain.dataprep.PreviewLineService;
import app.metatron.discovery.domain.dataprep.entity.Dataset;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;
import app.metatron.discovery.domain.dataprep.repository.DatasetRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.PersistentEntityResource;
import org.springframework.data.rest.webmvc.PersistentEntityResourceAssembler;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.hateoas.Resource;
import org.springframework.web.bind.annotation.*;

import static app.metatron.discovery.domain.dataprep.util.PrepUtil.datasetError;

@RequestMapping(value = "/datasets")
@RepositoryRestController
public class DatasetController {

    private static Logger LOGGER = LoggerFactory.getLogger(DatasetController.class);

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
            // this.datasetService.setConnectionInfo(dataset);
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
}
