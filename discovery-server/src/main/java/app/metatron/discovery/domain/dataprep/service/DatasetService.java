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

import app.metatron.discovery.domain.dataprep.entity.Dataset;
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
    private DatasetFileService datasetFileService;

    @Autowired
    private ConnectionService connectionService;

    private String previewSize = "50";

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
