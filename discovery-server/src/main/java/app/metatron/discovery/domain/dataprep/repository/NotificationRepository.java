package app.metatron.discovery.domain.dataprep.repository;

import app.metatron.discovery.domain.dataprep.entity.NotificationProjections;
import app.metatron.discovery.domain.dataprep.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(path = "notifications", itemResourceRel = "notification", collectionResourceRel = "notification"
        , excerptProjection = NotificationProjections.DefaultProjection.class)
public interface NotificationRepository extends JpaRepository<Notification, String> {

}
