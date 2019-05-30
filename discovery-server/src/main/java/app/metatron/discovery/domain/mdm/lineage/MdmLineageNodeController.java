package app.metatron.discovery.domain.mdm.lineage;

import app.metatron.discovery.domain.mdm.Metadata;
import app.metatron.discovery.domain.mdm.MetadataRepository;
import com.google.common.collect.Lists;
import com.querydsl.core.types.Predicate;
import java.util.Iterator;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.data.rest.webmvc.PersistentEntityResourceAssembler;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.hateoas.Resources;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

@RepositoryRestController
public class MdmLineageNodeController {

  private static Logger LOGGER = LoggerFactory.getLogger(MdmLineageNodeController.class);

  @Autowired
  MdmLineageNodeRepository lineageNodeRepository;

  @Autowired
  MetadataRepository metadataRepository;

  @Autowired
  PagedResourcesAssembler pagedResourcesAssembler;

  @Autowired
  ProjectionFactory projectionFactory;

  public MdmLineageNodeController() {
  }

  /**
   * Lineage Node 목록을 조회합니다.
   */
  @RequestMapping(value = "/lineagenodes", method = RequestMethod.GET)
  public ResponseEntity<?> findLineageNodes(
      @RequestParam(value = "nameContains", required = false) String nameContains,
      Pageable pageable, PersistentEntityResourceAssembler resourceAssembler) {

    // Get Predicate
    Predicate searchPredicated = MdmLineageNodePredicate.searchList(nameContains);

    // 기본 정렬 조건 셋팅
    if (pageable.getSort() == null || !pageable.getSort().iterator().hasNext()) {
      pageable = new PageRequest(pageable.getPageNumber(), pageable.getPageSize(),
          new Sort(Sort.Direction.ASC, "name"));
    }

    Page<MdmLineageNode> lineageNodes = lineageNodeRepository.findAll(searchPredicated, pageable);

    return ResponseEntity.ok(this.pagedResourcesAssembler.toResource(lineageNodes, resourceAssembler));
  }

  /**
   * Lineage Node 목록을 조회합니다.
   */
  @RequestMapping(value = "/lineagenodes/{metadataId}", method = RequestMethod.POST)
  public ResponseEntity<?> postLineageNodes(
      @PathVariable("metadataId") String metadataId,
      @RequestBody Resources<MdmLineageNode> lineageNodeResources,
      Pageable pageable, PersistentEntityResourceAssembler resourceAssembler ) {

    List<MdmLineageNode> lineageNodes = Lists.newArrayList();
    Metadata metadata = this.metadataRepository.findOne(metadataId);

    Iterator<MdmLineageNode> lineageNodeIterator = lineageNodeResources.iterator();
    while(lineageNodeIterator.hasNext()) {
      MdmLineageNode lineageNode = lineageNodeIterator.next();
      lineageNode.setMetadata(metadata);
      lineageNodes.add( this.lineageNodeRepository.save(lineageNode) );
    }

    return ResponseEntity.ok( resourceAssembler.toFullResource(lineageNodes) );
  }
}
