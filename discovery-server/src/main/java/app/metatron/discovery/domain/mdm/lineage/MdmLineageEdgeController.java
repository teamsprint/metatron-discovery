package app.metatron.discovery.domain.mdm.lineage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

public class MdmLineageEdgeController {

  private static Logger LOGGER = LoggerFactory.getLogger(MdmLineageNodeController.class);

  @Autowired
  MdmLineageEdgeRepository lineageEdgeRepository;

}
