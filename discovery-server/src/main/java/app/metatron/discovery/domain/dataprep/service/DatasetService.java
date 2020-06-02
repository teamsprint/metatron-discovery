package app.metatron.discovery.domain.dataprep.service;

import app.metatron.discovery.domain.dataprep.entity.Connection;
import app.metatron.discovery.domain.dataprep.entity.Dataset;
import app.metatron.discovery.domain.dataprep.service.ConnectionService;
import app.metatron.discovery.domain.dataprep.entity.PrDataset;
import app.metatron.discovery.domain.dataprep.repository.ConnectionRepository;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.DatasetFileService;

import app.metatron.dataprep.teddy.DataFrame;
import app.metatron.dataprep.teddy.exceptions.TeddyException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.io.IOException;
import java.sql.SQLException;

import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_FILE_KEY_MISSING;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_IMPORT_TYPE_IS_WRONG;
import static app.metatron.discovery.domain.dataprep.util.PrepUtil.datasetError;
import static org.apache.commons.io.FilenameUtils.getExtension;

@Service
@Transactional
public class DatasetService {

    @Autowired
    private ConnectionRepository connectionRepository;

    @Autowired
    private DatasetFileService datasetFileService;

    @Autowired
    private ConnectionService connectionService;

    private String previewSize = "50";

    public void setConnectionInfo(Dataset dataset) throws PrepException {
//        String connId = dataset.getConnId();
//        if (connId != null) {
//            Connection connection = this.connectionRepository.getOne(connId);
//            if(connection!= null) {
//                dataset.setImplementor(connection.getImplementor());
//                dataset.setHostname(connection.getHostname());
//                dataset.setPort(connection.getPort());
//                dataset.setDatabase(connection.getDatabase());
//                dataset.setCatalog(connection.getCatalog());
//                dataset.setSid(connection.getSid());
//                dataset.setUrl(connection.getUrl());
//                dataset.setUsername(connection.getUsername());
//                dataset.setPassword(connection.getPassword());
//                dataset.setConnType(connection.getConnType());
//            }
//        }
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
