package app.metatron.discovery.domain.dataprep.entity;

import app.metatron.discovery.domain.AbstractHistoryEntity;
import app.metatron.dataprep.teddy.DataFrame;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonValue;
import org.hibernate.annotations.GenericGenerator;
import javax.persistence.*;
import javax.validation.constraints.Size;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "dataset")
public class Dataset extends AbstractHistoryEntity {

    @JsonFormat(shape = JsonFormat.Shape.OBJECT)
    public enum IMPORT_TYPE {
        UPLOAD,
        URI,
        DATABASE,
        KAFKA;
        @JsonValue
        public String toJson() {
            return name();
        }
    }

    @JsonFormat(shape = JsonFormat.Shape.OBJECT)
    public enum FILE_FORMAT {
        CSV,
        EXCEL,
        JSON;

        @JsonValue
        public String toJson() {
            return name();
        }
    }

    @JsonFormat(shape = JsonFormat.Shape.OBJECT)
    public enum RS_TYPE {
        TABLE,
        QUERY;

        @JsonValue
        public String toJson() {
            return name();
        }
    }

    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "uuid2")
    @Column(name = "ds_id")
    String dsId;

    @Size(max = 2000)
    @Column(name = "name", nullable = false)
    private String name;

    @Lob
    @Column(name = "description")
    private String description;

    @Lob
    @Column(name = "custom")
    private String custom;

    @Column(name = "import_type")
    @Enumerated(EnumType.STRING)
    private Dataset.IMPORT_TYPE importType;

    @Column(name = "conn_id")
    private String connId;

    @Column(name = "rs_type")
    @Enumerated(EnumType.STRING)
    private Dataset.RS_TYPE rsType;


    @Size(max = 255)
    @Column(name = "db_name")
    private String dbName;

    @Size(max = 255)
    @Column(name = "tbl_name")
    private String tblName;

    @Lob
    @Column(name = "query_stmt")
    private String queryStmt;

    @Column(name = "file_format")
    @Enumerated(EnumType.STRING)
    private Dataset.FILE_FORMAT fileFormat;

    @Lob
    @Column(name = "filename_before_upload")
    private String filenameBeforeUpload;

    @Size(max = 2000)
    @Column(name = "sheet_name")
    private String sheetName;

    @Lob
    @Column(name = "stored_uri")
    private String storedUri;

    @Column(name = "delimiter")
    private String delimiter;

    @Column(name = "quote_char")
    private String quoteChar;

    @Lob
    @Column(name = "serialized_preview")
    String serializedPreview;

    @Column(name = "manual_column_count")
    private Integer manualColumnCount;

    @Column(name = "total_lines")
    private Long totalLines;

    @Column(name = "total_bytes")
    private Long totalBytes;

    @Transient
    @JsonProperty
    DataFrame gridResponse;


    public String getDsId() {
        return dsId;
    }

    public void setDsId(String dsId) {
        this.dsId = dsId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCustom() {
        return custom;
    }

    public void setCustom(String custom) {
        this.custom = custom;
    }

    public IMPORT_TYPE getImportType() {
        return importType;
    }

    public void setImportType(IMPORT_TYPE importType) {
        this.importType = importType;
    }

    public String getConnId() {
        return connId;
    }

    public void setConnId(String connId) {
        this.connId = connId;
    }

    public RS_TYPE getRsType() {
        return rsType;
    }

    public void setRsType(RS_TYPE rsType) {
        this.rsType = rsType;
    }

    public String getDbName() {
        return dbName;
    }

    public void setDbName(String dbName) {
        this.dbName = dbName;
    }

    public String getTblName() {
        return tblName;
    }

    public void setTblName(String tblName) {
        this.tblName = tblName;
    }

    public String getQueryStmt() {
        return queryStmt;
    }

    public void setQueryStmt(String queryStmt) {
        this.queryStmt = queryStmt;
    }

    public FILE_FORMAT getFileFormat() {
        return fileFormat;
    }

    public void setFileFormat(FILE_FORMAT fileFormat) {
        this.fileFormat = fileFormat;
    }

    public String getFilenameBeforeUpload() {
        return filenameBeforeUpload;
    }

    public void setFilenameBeforeUpload(String filenameBeforeUpload) {
        this.filenameBeforeUpload = filenameBeforeUpload;
    }

    public String getSheetName() {
        return sheetName;
    }

    public void setSheetName(String sheetName) {
        this.sheetName = sheetName;
    }

    public String getStoredUri() {
        return storedUri;
    }

    public void setStoredUri(String storedUri) {
        this.storedUri = storedUri;
    }

    public String getDelimiter() {
        return delimiter;
    }

    public void setDelimiter(String delimiter) {
        this.delimiter = delimiter;
    }

    public String getQuoteChar() {
        return quoteChar;
    }

    public void setQuoteChar(String quoteChar) {
        this.quoteChar = quoteChar;
    }

    public String getSerializedPreview() {
        return serializedPreview;
    }

    public void setSerializedPreview(String serializedPreview) {
        this.serializedPreview = serializedPreview;
    }

    public Integer getManualColumnCount() {
        return manualColumnCount;
    }

    public void setManualColumnCount(Integer manualColumnCount) {
        this.manualColumnCount = manualColumnCount;
    }

    public Long getTotalLines() {
        return totalLines;
    }

    public void setTotalLines(Long totalLines) {
        this.totalLines = totalLines;
    }

    public Long getTotalBytes() {
        return totalBytes;
    }

    public void setTotalBytes(Long totalBytes) {
        this.totalBytes = totalBytes;
    }

    public DataFrame getGridResponse() {
        return gridResponse;
    }

    public void setGridResponse(DataFrame gridResponse) {
        this.gridResponse = gridResponse;
    }
}
