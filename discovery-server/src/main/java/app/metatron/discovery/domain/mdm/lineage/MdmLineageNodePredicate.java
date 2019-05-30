package app.metatron.discovery.domain.mdm.lineage;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;
import org.apache.commons.lang3.StringUtils;

public class MdmLineageNodePredicate {
 /**
   * 기본 목록 조회 옵션 지정
   *
   * @param nameContains 노드 명 내 포함되는 문자
   * @return
   */
  public static Predicate searchList(String nameContains) {

    BooleanBuilder builder = new BooleanBuilder();
    QMdmLineageNode lineageNode = QMdmLineageNode.mdmLineageNode;

    if(StringUtils.isNotEmpty(nameContains)) {
      builder = builder.and(lineageNode.name.containsIgnoreCase(nameContains));
    }

    return builder;
  }

  /**
   * Metadata ID를 통한 조회
   *
   * @param metadataId meta_id 와 일치
   * @return
   */
  public static Predicate searchListByMetaId(String metadataId) {

    BooleanBuilder builder = new BooleanBuilder();
    QMdmLineageNode lineageNode = QMdmLineageNode.mdmLineageNode;

    if(StringUtils.isNotEmpty(metadataId)) {
      builder = builder.and(lineageNode.metadata.id.equalsIgnoreCase(metadataId));
    }

    return builder;
  }
}
