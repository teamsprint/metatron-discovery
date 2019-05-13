package app.metatron.discovery.domain.dataprep.sql;

import java.util.ArrayList;
import java.util.List;

public class PrepSqlParseResult {
    public List<String> grid;

    // Used only in PrepJsonUtil.parse() when onlyCount is true
    public long totalRows;
    public long totalBytes;

    public PrepSqlParseResult() {
        grid = new ArrayList();
    }
}
