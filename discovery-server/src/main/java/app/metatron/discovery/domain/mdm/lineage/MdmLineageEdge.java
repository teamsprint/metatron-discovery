package app.metatron.discovery.domain.mdm.lineage;

import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import org.hibernate.annotations.GenericGenerator;

@Entity
@Table(name="mdm_lineage_edge")
public class MdmLineageEdge {

  @Id
  @GeneratedValue(generator = "uuid")
  @GenericGenerator(name = "uuid", strategy = "uuid2")
  @Column(name = "id")
  private String id;

  @Column(name="forward_system_name")
  String forwardSystemName;

  @Column(name="forward_table_name")
  String forwardTableName;

  @Column(name="forward_column_name")
  String forwardColumnName;

  @Column(name="toward_system_name")
  String towardSystemName;

  @Column(name="toward_table_name")
  String towardTableName;

  @Column(name="toward_column_name")
  String towardColumnName;

  /*
  @ManyToOne
  @JoinColumns({
      @JoinColumn(name="forward_system_name", referencedColumnName="system_name"),
      @JoinColumn(name="forward_table_name", referencedColumnName="table_name"),
      @JoinColumn(name="forward_column_name", referencedColumnName="column_name")
  })
  private MdmLineageNode forwardNode;

  @ManyToOne
  @JoinColumns({
      @JoinColumn(name="toward_system_name", referencedColumnName="system_name"),
      @JoinColumn(name="toward_table_name", referencedColumnName="table_name"),
      @JoinColumn(name="toward_column_name", referencedColumnName="column_name")
  })
  private MdmLineageNode towardNode;
  */

  /**
   * Lineage Edge Attributes
   */
  @Column(name = "lineage_edge_attributes", length = 65535, columnDefinition = "TEXT")
  @Basic(fetch = FetchType.LAZY)
  private String attributes;

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getForwardSystemName() {
    return forwardSystemName;
  }

  public void setForwardSystemName(String forwardSystemName) {
    this.forwardSystemName = forwardSystemName;
  }

  public String getForwardTableName() {
    return forwardTableName;
  }

  public void setForwardTableName(String forwardTableName) {
    this.forwardTableName = forwardTableName;
  }

  public String getForwardColumnName() {
    return forwardColumnName;
  }

  public void setForwardColumnName(String forwardColumnName) {
    this.forwardColumnName = forwardColumnName;
  }

  public String getTowardSystemName() {
    return towardSystemName;
  }

  public void setTowardSystemName(String towardSystemName) {
    this.towardSystemName = towardSystemName;
  }

  public String getTowardTableName() {
    return towardTableName;
  }

  public void setTowardTableName(String towardTableName) {
    this.towardTableName = towardTableName;
  }

  public String getTowardColumnName() {
    return towardColumnName;
  }

  public void setTowardColumnName(String towardColumnName) {
    this.towardColumnName = towardColumnName;
  }

  public String getAttributes() {
    return attributes;
  }

  public void setAttributes(String attributes) {
    this.attributes = attributes;
  }

  @Override
  public String toString() {
    return "MdmLineageEdge{" +
        "id='" + id + '\'' +
        ", attirubutesLength=" + attributes.length() +
        "} " + super.toString();
  }
}
