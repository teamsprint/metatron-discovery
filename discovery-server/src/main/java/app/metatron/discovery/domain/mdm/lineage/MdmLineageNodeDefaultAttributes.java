package app.metatron.discovery.domain.mdm.lineage;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import java.util.Map;

public class MdmLineageNodeDefaultAttributes implements MdmLineageNodeAttributes {
  private Map<String, String> properties;

  @JsonAnyGetter
  public Map<String, String> getProperties() {
    return properties;
  }
}