package app.metatron.discovery.domain.dataprep.entity;

import app.metatron.dataprep.teddy.DataFrame;
import org.springframework.hateoas.Resource;

import java.util.List;
public class DatasetResponse {

    private String dsId;
    private String name;
    private String description;
    private String custom;
    private Dataset.IMPORT_TYPE importType;
    private String connId;
    private String connName;
    private String implementor;
    private String hostname;
    private Integer port;
    private String database;
    private String catalog;
    private String sid;
    private String url;
    private Connection.ConnType connType;
    private Dataset.RS_TYPE rsType;
    private String dbName;
    private String tblName;
    private String queryStmt;
    private Dataset.FILE_FORMAT fileFormat;
    private String filenameBeforeUpload;
    private String sheetName;
    private String storedUri;
    private String delimiter;
    private String quoteChar;
    private String serializedPreview;
    private Integer manualColumnCount;
    private Long totalLines;
    private Long totalBytes;
    private DataFrame gridResponse;
    private List<Resource<DataflowProjections.DefaultProjection>> dataflows;

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

    public Dataset.IMPORT_TYPE getImportType() {
        return importType;
    }

    public void setImportType(Dataset.IMPORT_TYPE importType) {
        this.importType = importType;
    }

    public String getConnId() {
        return connId;
    }

    public void setConnId(String connId) {
        this.connId = connId;
    }

    public String getConnName() {
        return connName;
    }

    public void setConnName(String connName) {
        this.connName = connName;
    }

    public String getImplementor() {
        return implementor;
    }

    public void setImplementor(String implementor) {
        this.implementor = implementor;
    }

    public String getHostname() {
        return hostname;
    }

    public void setHostname(String hostname) {
        this.hostname = hostname;
    }

    public Integer getPort() {
        return port;
    }

    public void setPort(Integer port) {
        this.port = port;
    }

    public String getDatabase() {
        return database;
    }

    public void setDatabase(String database) {
        this.database = database;
    }

    public String getCatalog() {
        return catalog;
    }

    public void setCatalog(String catalog) {
        this.catalog = catalog;
    }

    public String getSid() {
        return sid;
    }

    public void setSid(String sid) {
        this.sid = sid;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public Connection.ConnType getConnType() {
        return connType;
    }

    public void setConnType(Connection.ConnType connType) {
        this.connType = connType;
    }

    public Dataset.RS_TYPE getRsType() {
        return rsType;
    }

    public void setRsType(Dataset.RS_TYPE rsType) {
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

    public Dataset.FILE_FORMAT getFileFormat() {
        return fileFormat;
    }

    public void setFileFormat(Dataset.FILE_FORMAT fileFormat) {
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

    public List<Resource<DataflowProjections.DefaultProjection>> getDataflows() {
        return dataflows;
    }

    public void setDataflows(List<Resource<DataflowProjections.DefaultProjection>> dataflows) {
        this.dataflows = dataflows;
    }
}
