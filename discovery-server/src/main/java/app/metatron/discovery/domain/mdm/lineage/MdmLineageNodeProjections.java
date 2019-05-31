package app.metatron.discovery.domain.mdm.lineage;

import app.metatron.discovery.common.BaseProjections;
import app.metatron.discovery.domain.mdm.Metadata;
import app.metatron.discovery.domain.mdm.lineage.MdmLineageNode.NodeType;
import org.springframework.data.rest.core.config.Projection;

public class MdmLineageNodeProjections extends BaseProjections {

  @Projection(types = MdmLineageNode.class, name = "default")
  public interface DefaultProjection {

    String getSystemName();
    String getTableName();
    String getColumnName();

    String getName();
    String getDescription();

    NodeType getNodeType();
  }

  @Projection(types = MdmLineageNode.class, name = "forDetailView")
  public interface ForDetailViewProjection {
    String getSystemName();
    String getTableName();
    String getColumnName();

    String getName();
    String getDescription();

    NodeType getNodeType();

    String getAttributes();
    Metadata getMetadata();
  }
}
