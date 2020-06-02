package app.metatron.discovery.domain.dataprep.service;


import app.metatron.discovery.domain.dataprep.entity.Notification;
import org.apache.http.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.PersistentEntityResourceAssembler;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.hateoas.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


import static app.metatron.discovery.domain.dataprep.util.PrepUtil.datasetError;

@RequestMapping(value = "/notifications")
@RepositoryRestController
public class NotificationController {

    @Autowired
    NotificationService notificationService;

    private static Logger LOGGER = LoggerFactory.getLogger(NotificationController.class);

    @RequestMapping(value = "", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<?> getNotificationList(
            PersistentEntityResourceAssembler persistentEntityResourceAssembler
    ) {
        List<Notification> notifications = null;
        try {
            notifications = notificationService.getNotificationList();
        } catch (Exception e) {
            LOGGER.error("getNotificationList(): caught an exception: ", e);
            throw datasetError(e);
        }

        return ResponseEntity.status(HttpStatus.SC_OK).body(notifications);
    }

    @RequestMapping(value = "/unreadcount", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<?> getNotificationUnreadCount(
            PersistentEntityResourceAssembler persistentEntityResourceAssembler
    ) {
        Integer unreadCount=0;
        try {
            unreadCount = notificationService.getUnreadCount();
        } catch (Exception e) {
            LOGGER.error("getNotificationUnreadCount(): caught an exception: ", e);
            throw datasetError(e);
        }

        return ResponseEntity.status(HttpStatus.SC_OK).body(unreadCount);
    }
}
