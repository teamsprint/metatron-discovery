package app.metatron.discovery.domain.mdm.lineage;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;
import java.util.List;
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
   * 기본 목록 조회 옵션 지정
   *
   * @param identifierList Identifier 목록
   * @return
   */
  public static Predicate searchListbyIdentifiers(List<MdmLineageNodeIdentifier> identifierList) {

    BooleanBuilder builder = new BooleanBuilder();
    QMdmLineageNode lineageNode = QMdmLineageNode.mdmLineageNode;

    for(MdmLineageNodeIdentifier identifier : identifierList) {
      if ( identifier.getColumnName()!=null
          && identifier.getSystemName()!=null
          && identifier.getTableName()!=null ) {
        BooleanBuilder itembuilder = new BooleanBuilder();
        itembuilder = itembuilder.and(lineageNode.columnName.equalsIgnoreCase(identifier.getColumnName()));
        itembuilder = itembuilder.and(lineageNode.tableName.equalsIgnoreCase(identifier.getTableName()));
        itembuilder = itembuilder.and(lineageNode.systemName.equalsIgnoreCase(identifier.getSystemName()));

        builder = builder.or(itembuilder);
      }
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
