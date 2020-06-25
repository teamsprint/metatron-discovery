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

import app.metatron.discovery.domain.dataprep.entity.*;
import app.metatron.discovery.domain.dataprep.DatasetFileService;
import app.metatron.discovery.domain.dataprep.repository.ConnectionRepository;
import app.metatron.discovery.domain.dataprep.repository.DataflowRepository;
import app.metatron.dataprep.teddy.DataFrame;
import app.metatron.dataprep.teddy.exceptions.TeddyException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.hateoas.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_FILE_KEY_MISSING;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_IMPORT_TYPE_IS_WRONG;
import static app.metatron.discovery.domain.dataprep.util.PrepUtil.datasetError;
import static org.apache.commons.io.FilenameUtils.getExtension;

@Service
@Transactional
public class DatasetService {

    @Autowired
    private DatasetFileService datasetFileService;

    @Autowired
    private ConnectionService connectionService;

    @Autowired
    private ConnectionRepository connectionRepository;

    @Autowired
    private DataflowRepository dataflowRepository;

    private String previewSize = "50";

    @Autowired
    ProjectionFactory projectionFactory;

    public DatasetResponse getDatasetFullInfo(Dataset dataset)  {
        DatasetResponse datasetResponse = new DatasetResponse();
        datasetResponse.setDsId(dataset.getDsId());
        datasetResponse.setName(dataset.getName());
        datasetResponse.setDescription(dataset.getDescription());
        datasetResponse.setCustom(dataset.getCustom());
        datasetResponse.setImportType(dataset.getImportType());
        datasetResponse.setDbName(dataset.getDbName());
        datasetResponse.setTblName(dataset.getTblName());
        datasetResponse.setQueryStmt(dataset.getQueryStmt());
        datasetResponse.setFileFormat(dataset.getFileFormat());
        datasetResponse.setFilenameBeforeUpload(dataset.getFilenameBeforeUpload());
        datasetResponse.setSheetName(dataset.getSheetName());
        datasetResponse.setStoredUri(dataset.getStoredUri());
        datasetResponse.setDelimiter(dataset.getDelimiter());
        datasetResponse.setQuoteChar(dataset.getQuoteChar());
        datasetResponse.setSerializedPreview(dataset.getSerializedPreview());
        datasetResponse.setManualColumnCount(dataset.getManualColumnCount());
        datasetResponse.setTotalLines(dataset.getTotalLines());
        datasetResponse.setTotalBytes(dataset.getTotalBytes());
        datasetResponse.setRsType(dataset.getRsType());
        String connId = dataset.getConnId();
        if(connId!=null && !connId.isEmpty()) {
            Connection connection = connectionRepository.findOne(connId);
            if(connection != null) {
                datasetResponse.setConnName(connection.getName());
                datasetResponse.setImplementor(connection.getImplementor());
                datasetResponse.setHostname(connection.getHostname());
                datasetResponse.setPort(connection.getPort());
                datasetResponse.setDatabase(connection.getDatabase());
                datasetResponse.setCatalog(connection.getCatalog());
                datasetResponse.setSid(connection.getSid());
                datasetResponse.setUrl(connection.getUrl());
                datasetResponse.setConnType(connection.getConnType());
            }
        }
        List<Dataflow> dataflows = this.dataflowRepository.findByNameContainingOrderByCreatedTimeAsc("");
        List<Resource<DataflowProjections.DefaultProjection>> linkDataflows = new ArrayList<>();
        Resource<DataflowProjections.DefaultProjection> projectedDataflow;

        if(dataflows!=null && dataflows.size()>0) {
            for(Dataflow dataflow :dataflows) {
                List<DataflowDiagram> diagrams = dataflow.getDiagrams();
                if(diagrams != null) {
                    for(int i=0; i< diagrams.size(); i++) {
                        if(dataset.getDsId().equals(diagrams.get(i).getDataset().getDsId())) {
                            DataflowProjections.DefaultProjection projection = projectionFactory
                                    .createProjection(DataflowProjections.DefaultProjection.class, dataflow);
                            projectedDataflow = new Resource<>(projection);

                            linkDataflows.add(projectedDataflow);
                            break;
                        }
                    }
                }
            }
        }
        datasetResponse.setGridResponse(dataset.getGridResponse());
        datasetResponse.setDataflows(linkDataflows);
        return datasetResponse;
    }


    public void changeFileFormatToCsv(Dataset dataset) throws Exception {
        String storedUri = dataset.getStoredUri();
        String sheetName = dataset.getSheetName();
        String delimiter = dataset.getDelimiter();
        String csvStrUri;

        if (storedUri == null) {
            throw datasetError(MSG_DP_ALERT_FILE_KEY_MISSING, "Name=" + dataset.getName());
        }

        if (getExtension(storedUri).equals("xls") || getExtension(storedUri).equals("xlsx")) {
            if (dataset.getImportType() == Dataset.IMPORT_TYPE.UPLOAD) {
                csvStrUri = this.datasetFileService.moveExcelToCsv(storedUri, sheetName, delimiter);
            } else {
                csvStrUri = this.datasetFileService.getPathLocalBase(dataset.getDsId() + ".csv");
                csvStrUri = this.datasetFileService.moveExcelToCsv(csvStrUri, storedUri, sheetName, delimiter);
            }
            dataset.setStoredUri(csvStrUri);
        }
    }

    public DataFrame getImportedPreview(Dataset dataset) throws IOException, SQLException, TeddyException {
        DataFrame dataFrame;
        // assert dataset.getDsType() == PrDataset.DS_TYPE.IMPORTED : dataset.getDsType();
        switch (dataset.getImportType()) {
            case UPLOAD:
            case URI:
                dataFrame = datasetFileService.getPreviewLinesFromFileForDataFrame(dataset, previewSize);
                break;
            case DATABASE:
                dataFrame = connectionService.getPreviewLinesFromJdbcForDataFrame(dataset, previewSize);
                break;
//            case KAFKA:
//                dataFrame = kafkaService.createDataFrame(dataset, Integer.valueOf(previewSize));
//                break;
            default:
                throw datasetError(MSG_DP_ALERT_IMPORT_TYPE_IS_WRONG, dataset.getImportType().name());
        }

        return dataFrame;
    }
}
