package app.metatron.discovery.domain.dataprep.repository;

import app.metatron.discovery.domain.dataprep.entity.Dataset;
import app.metatron.discovery.domain.dataprep.entity.DatasetProjections;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;

@RepositoryRestResource(path = "datasets", itemResourceRel = "dataset", collectionResourceRel = "dataset"
        , excerptProjection = DatasetProjections.DefaultProjection.class)
public interface DatasetRepository extends JpaRepository<Dataset, String>, DatasetRepositoryCustom{

    List<Dataset> findByName(String name);

    Page<Dataset> findByNameContaining(@Param("name") String name, Pageable pageable);

    Page<Dataset> findByNameContainingAndImportType(@Param("name") String name,
                                                                 @Param("importType") Dataset.IMPORT_TYPE importType, Pageable pageable);


}
