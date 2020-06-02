package app.metatron.discovery.domain.dataprep.repository;

import app.metatron.discovery.domain.dataprep.entity.Connection;
import app.metatron.discovery.domain.dataprep.entity.ConnectionProjections;

import org.springframework.data.querydsl.QueryDslPredicateExecutor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(path = "connections",
        itemResourceRel = "connection", collectionResourceRel = "connections",
        excerptProjection = ConnectionProjections.DefaultProjection.class)
public interface  ConnectionRepository extends JpaRepository<Connection, String>,
        QueryDslPredicateExecutor<Connection> {


}
