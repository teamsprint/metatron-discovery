package app.metatron.discovery.domain.dataprep.repository;

import app.metatron.discovery.domain.dataprep.entity.Dataflow;
import app.metatron.discovery.domain.dataprep.entity.DataflowProjections;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(path = "dataflows", itemResourceRel = "dataflow", collectionResourceRel = "dataflow"
        , excerptProjection = DataflowProjections.DefaultProjection.class)
public interface DataflowRepository extends JpaRepository<Dataflow, String> {

    Page<Dataflow> findByNameContaining(@Param("name") String name, Pageable pageable);
}
