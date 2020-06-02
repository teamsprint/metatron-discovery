package app.metatron.discovery.domain.dataprep.service;

import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.datasource.ingestion.IngestionDataResultResponse;
import app.metatron.discovery.domain.datasource.ingestion.file.FileFormat;

public class ConnectionResultResponse extends IngestionDataResultResponse {
    List<Field> partitionFields;

    FileFormat fileFormat;

    public ConnectionResultResponse() {
        // Empty Constructor
    }

    public ConnectionResultResponse(List<Field> fields, List<Map<String, Object>> data) {
        super.fields = fields;
        super.data = data;
        super.totalRows = 0;
    }

    public List<Field> getPartitionFields() {
        return partitionFields;
    }

    public void setPartitionFields(List<Field> partitionFields) {
        this.partitionFields = partitionFields;
    }

    public FileFormat getFileFormat() {
        return fileFormat;
    }

    public void setFileFormat(FileFormat fileFormat) {
        this.fileFormat = fileFormat;
    }

    @Override
    public String toString() {
        return "QueryResultSet{" +
                "fields=" + fields +
                ", data=" + data +
                ", totalRows=" + totalRows +
                '}';
    }
}
