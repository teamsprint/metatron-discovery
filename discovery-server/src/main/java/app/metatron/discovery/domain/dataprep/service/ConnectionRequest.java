package app.metatron.discovery.domain.dataprep.service;

import app.metatron.discovery.domain.dataprep.entity.Connection;
import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;

public class ConnectionRequest {

    @NotNull
    Connection connection;

    String database;

    String table;

    String type;

    String query;

    List<Map<String, Object>> partitions;

    public Connection getConnection() {
        return connection;
    }

    public void setConnection(Connection connection) {
        this.connection = connection;
    }

    public String getDatabase() {
        return database;
    }

    public void setDatabase(String database) {
        this.database = database;
    }

    public String getTable() {
        return table;
    }

    public void setTable(String table) {
        this.table = table;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public List<Map<String, Object>> getPartitions() {
        return partitions;
    }

    public void setPartitions(List<Map<String, Object>> partitions) {
        this.partitions = partitions;
    }
}
