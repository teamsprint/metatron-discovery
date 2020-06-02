package app.metatron.discovery.domain.dataprep.repository;

import app.metatron.discovery.domain.dataprep.entity.Dataset;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;

public interface DatasetRepositoryCustom {

    Page<Dataset> searchByQuery(@Param("query") String query, Pageable pageable);

    Dataset findRealOne(Dataset lazyOne);
}
