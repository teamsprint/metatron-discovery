package app.metatron.discovery.domain.mdm.lineage;

import app.metatron.discovery.common.BaseProjections;
import org.springframework.data.rest.core.config.Projection;

public class MdmLineageEdgeProjections extends BaseProjections {

  @Projection(types = MdmLineageEdge.class, name = "default")
  public interface DefaultProjection {

    String getForwardSystemName();
    String getForwardTableName();
    String getForwardColumnName();
    String getTowardSystemName();
    String getTowardTableName();
    String getTowardColumnName();

  }

  @Projection(types = MdmLineageEdge.class, name = "forDetailView")
  public interface ForDetailViewProjection {

    String getForwardSystemName();
    String getForwardTableName();
    String getForwardColumnName();
    String getTowardSystemName();
    String getTowardTableName();
    String getTowardColumnName();
    String getAttributes();

  }
}
