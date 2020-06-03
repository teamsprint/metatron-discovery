package app.metatron.discovery.domain.dataprep.repository;

import app.metatron.discovery.domain.dataprep.entity.NotificationProjections;
import app.metatron.discovery.domain.dataprep.entity.Notification;
import org.joda.time.DateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;
import java.util.Date;

@RepositoryRestResource(path = "notifications", itemResourceRel = "notification", collectionResourceRel = "notification"
        , excerptProjection = NotificationProjections.DefaultProjection.class)
public interface NotificationRepository extends JpaRepository<Notification, String> {

    Page<Notification> findByCreatedBy(@Param("createdBy") String createdBy, Pageable pageable);

    // List<Notification> findByCreatedByAndCreatedTimeBetween(@Param("createdBy") String createdBy, DateTime startDate, DateTime endDate);
     List<Notification> findByCreatedByAndCreatedTimeBetween(@Param("createdBy") String createdBy, @Param("startDate") DateTime startDate, @Param("endDate") DateTime endDate);

//    List<Notification> findByCreatedTimeBetween(@Param("startDate") DateTime startDate, @Param("endDate") DateTime endDate);

    int countByCreatedByAndReadYn(@Param("createdBy") String createdBy, @Param("readYn") String readYn);

}
