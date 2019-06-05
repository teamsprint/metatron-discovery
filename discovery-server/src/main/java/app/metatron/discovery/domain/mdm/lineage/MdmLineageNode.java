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

package app.metatron.discovery.domain.mdm.lineage;

import app.metatron.discovery.common.KeepAsJsonDeserialzier;
import app.metatron.discovery.common.entity.Spec;
import app.metatron.discovery.domain.AbstractHistoryEntity;
import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.IdClass;
import javax.persistence.Table;
import javax.validation.constraints.Size;
import org.hibernate.validator.constraints.NotBlank;

@Entity
@IdClass(MdmLineageNodeIdentifier.class)
@Table(name="mdm_lineage_node")
public class MdmLineageNode extends AbstractHistoryEntity {

  /*
   * It will be used as ID soon
   *
  @Id
  @GeneratedValue(generator = "uuid")
  @GenericGenerator(name = "uuid", strategy = "uuid2")
  @Column(name = "id")
  private String id;
  */

  @Id
  @Column(name = "system_name", nullable = false)
  @Size(max = 150)
  String systemName;

  @Id
  @Column(name = "table_name", nullable = false)
  @Size(max = 150)
  String tableName;

  @Id
  @Column(name = "column_name", nullable = false)
  @Size(max = 150)
  String columnName;

  @Column(name = "lineage_node_name", nullable = false)
  @NotBlank
  @Size(max = 150)
  private String name;

  @Column(name = "lineage_node_desc", length = 1000)
  @Size(max = 900)
  private String description;

  @Column(name = "meta_source_type")
  @Enumerated(EnumType.STRING)
  private NodeType nodeType;

  /**
   * Lineage Node Attributes
   */
  @Column(name = "lineage_node_attributes", length = 65535, columnDefinition = "TEXT")
  @Basic(fetch = FetchType.LAZY)
  @Spec(target = MdmLineageNodeAttributes.class)
  @JsonRawValue
  @JsonDeserialize(using = KeepAsJsonDeserialzier.class)
  private String attributes;

  /**
   * Linked Metadata
   */
  /*
  @ManyToOne(fetch = FetchType.LAZY, cascade = { CascadeType.MERGE })
  @JoinColumn(name = "meta_id")
  private Metadata metadata;
  */

  public MdmLineageNode() {
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

  public NodeType getNodeType() {
    return nodeType;
  }

  public void setNodeType(
      NodeType nodeType) {
    this.nodeType = nodeType;
  }

  public String getAttributes() {
    return attributes;
  }

  public void setAttributes(String attributes) {
    this.attributes = attributes;
  }

  @Override
  public String toString() {
    return "MdmLineageNode{" +
        "id='" + systemName +'_'+ tableName +'_'+ columnName + '\'' +
        ", name='" + name + '\'' +
        ", description='" + description + '\'' +
        ", nodeType=" + nodeType +
        "} " + super.toString();
  }

  public enum NodeType {
    TABLE, VIEW, COLUMN, SYSTEM
  }
}
