package app.metatron.discovery.domain.mdm.lineage;

import java.io.Serializable;
import javax.persistence.Embeddable;

@Embeddable
public class MdmLineageNodeIdentifier implements Serializable {
  private String systemName;
  private String tableName;
  private String columnName;

  public MdmLineageNodeIdentifier() {
  }

  public MdmLineageNodeIdentifier(String systemName, String tableName, String columnName) {
    this.systemName = systemName;
    this.tableName = tableName;
    this.columnName = columnName;
  }

  @Override
  public int hashCode() {
    return super.hashCode();
  }

  @Override
  public boolean equals(Object obj) {
    return super.equals(obj);
  }

  public String getSystemName() {
    return systemName;
  }

  public void setSystemName(String systemName) {
    this.systemName = systemName;
  }

  public String getTableName() {
    return tableName;
  }

  public void setTableName(String tableName) {
    this.tableName = tableName;
  }

  public String getColumnName() {
    return columnName;
  }

  public void setColumnName(String columnName) {
    this.columnName = columnName;
  }
}
