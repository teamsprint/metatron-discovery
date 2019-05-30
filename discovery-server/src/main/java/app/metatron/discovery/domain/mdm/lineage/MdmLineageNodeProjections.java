package app.metatron.discovery.domain.mdm.lineage;

import app.metatron.discovery.common.BaseProjections;
import org.springframework.data.rest.core.config.Projection;

public class MdmLineageNodeProjections extends BaseProjections {

  @Projection(types = MdmLineageNode.class, name = "default")
  public interface DefaultProjection {

    String getId();

    String getName();

    String getDescription();

    String getForward();

    String getToward();
  }

}
