package app.metatron.discovery.domain.dataprep;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.dataprep.entity.Dataset;
import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.dataprep.teddy.ColumnDescription;
import app.metatron.dataprep.teddy.ColumnType;
import app.metatron.dataprep.teddy.DataFrame;
import app.metatron.dataprep.teddy.Row;
import app.metatron.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.domain.dataprep.transform.PrepTransformResponse;
import app.metatron.discovery.domain.dataprep.service.DatasetService;
import app.metatron.discovery.domain.dataprep.repository.DatasetRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Lists;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.List;

@Service
public class PreviewLineService {

    private static Logger LOGGER = LoggerFactory.getLogger(PreviewLineService.class);

    @Autowired(required = false)
    PrepProperties prepProperties;

    @Autowired
    DatasetRepository datasetRepository;

    @Autowired
    DatasetService datasetService;


    Integer limit;

    PreviewLineService() {
        limit = 200;
    }


    private String getPreviewPath() {
        String tempDirPath = prepProperties.getLocalBaseDir() + File.separator + PrepProperties.dirPreview;

        File tempPath = new File(tempDirPath);
        if (!tempPath.exists()) {
            tempPath.mkdirs();
        }

        return tempDirPath;
    }

    private String getPreviewPath(String dsId) {
        String tempDirPath = getPreviewPath();
        String pathStr = tempDirPath + File.separator + dsId + ".df";

        return pathStr;
    }

    public int putPreviewLines(String dsId, DataFrame gridResponse) {
        int size;

        LOGGER.trace("putPreviewLines(): start");
        // Dataset dataset = datasetRepository.findRealOne(datasetRepository.findOne(dsId));
        Dataset dataset = this.datasetRepository.findOne(dsId);
        assert dataset != null;

        DataFrame previewGrid = new DataFrame();
        previewGrid.colCnt = gridResponse.colCnt;
        previewGrid.colNames = gridResponse.colNames;
        previewGrid.colDescs = gridResponse.colDescs;
        previewGrid.colHists = gridResponse.colHists;
        previewGrid.mapColno = gridResponse.mapColno;
        previewGrid.newColNames = gridResponse.newColNames;
        previewGrid.interestedColNames = gridResponse.interestedColNames;
        previewGrid.dsName = gridResponse.dsName;
        previewGrid.slaveDsNameMap = gridResponse.slaveDsNameMap;
        previewGrid.ruleString = gridResponse.ruleString;

        size = gridResponse.rows.size();
        if (limit < size) {
            previewGrid.rows = gridResponse.rows.subList(0, limit);
        } else {
            previewGrid.rows = gridResponse.rows;
        }

        String previewPath = getPreviewPath(dsId);
        try {
            ObjectMapper mapper = GlobalObjectMapper.getDefaultMapper();
            mapper.writeValue(new File(previewPath), previewGrid);
        } catch (Exception e) {
            e.printStackTrace();
            LOGGER.debug(e.getMessage());
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, e);
        }

        LOGGER.trace("putPreviewLines(): end");
        return size;
    }

    public DataFrame getPreviewLines(String dsId) {
        DataFrame dataFrame;

        try {
            // Dataset dataset = datasetRepository.findRealOne(datasetRepository.findOne(dsId));
            Dataset dataset = this.datasetRepository.findOne(dsId);
            assert (dataset != null);

            ObjectMapper mapper = GlobalObjectMapper.getDefaultMapper();
            String filepath = getPreviewPath() + File.separator + dataset.getDsId() + ".df";
            File theFile = new File(filepath);
            if (theFile.exists()) {
                dataFrame = mapper.readValue(theFile, DataFrame.class);
            } else {
                dataFrame = savePreviewLines(dsId);
            }
            assert dataFrame != null;

            for (Row row : dataFrame.rows) {
                for (int i = 0; i < dataFrame.getColCnt(); i++) {
                    Object obj = row.get(i);
                    if (obj instanceof Integer) {
                        row.objCols.set(i, ((Integer) obj).longValue());
                    } else if (obj instanceof Float) {
                        row.objCols.set(i, ((Float) obj).doubleValue());
                    }
                }
            }

            List<ColumnDescription> columnDescs = dataFrame.colDescs;
            List<Integer> colNos = Lists.newArrayList();
            int colIdx = 0;
            for (ColumnDescription columnDesc : columnDescs) {
                if (columnDesc.getType().equals(ColumnType.TIMESTAMP)) {
                    colNos.add(colIdx);
                }
                colIdx++;
            }

            if (colNos.size() > 0) {
                for (Row row : dataFrame.rows) {
                    for (Integer colNo : colNos) {
                        Object jodaTime = row.get(colNo);
                        if (jodaTime instanceof LinkedHashMap) {
                            LinkedHashMap mapTime = (LinkedHashMap) jodaTime;
                            DateTime dateTime = new DateTime(Long.parseLong(mapTime.get("millis").toString()));
                            row.objCols.set(colNo, dateTime);
                        }
                    }
                }
            }

        } catch (TeddyException e) {
            e.printStackTrace();
            throw PrepException.fromTeddyException(e);
        } catch (SQLException | IOException e) {
            LOGGER.error(e.getMessage());
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, e);
        }

        return dataFrame;
    }

    public DataFrame savePreviewLines(String dsId) throws IOException, SQLException, TeddyException {
        DataFrame dataFrame = null;

        // Dataset dataset = datasetRepository.findRealOne(datasetRepository.findOne(dsId));
        Dataset dataset = this.datasetRepository.findOne(dsId);
        assert (dataset != null);
        dataFrame = datasetService.getImportedPreview(dataset);
        assert dataFrame != null;
        putPreviewLines(dsId, dataFrame);
        return dataFrame;
    }
}
