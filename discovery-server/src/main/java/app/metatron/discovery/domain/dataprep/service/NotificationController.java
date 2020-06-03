package app.metatron.discovery.domain.dataprep.service;

import app.metatron.discovery.domain.dataprep.entity.NotificationResponse;
import org.apache.http.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import static app.metatron.discovery.domain.dataprep.util.PrepUtil.notificationError;

@RequestMapping(value = "/notifications")
@RepositoryRestController
public class NotificationController {

    @Autowired
    NotificationService notificationService;

    private static Logger LOGGER = LoggerFactory.getLogger(NotificationController.class);

    @RequestMapping(value = "/list", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<?> getNotificationList(
            Pageable pageable
    ) {
        NotificationResponse notificationResponse = null;
        try {
            notificationResponse = notificationService.getNotificationList(pageable);
        } catch (Exception e) {
            LOGGER.error("getNotificationList(): caught an exception: ", e);
            throw notificationError(e);
        }
        return ResponseEntity.status(HttpStatus.SC_OK).body(notificationResponse);
    }


    @RequestMapping(value = "/{division}", method = RequestMethod.DELETE)
    @ResponseBody
    public ResponseEntity<?> deleteNotificationList(
            @PathVariable("division") String division
    ) {
        NotificationResponse notificationResponse = null;
        try {
            notificationResponse = this.notificationService.deleteNotificationList(division);
        } catch (Exception e) {
            LOGGER.error("deleteNotificationList(): caught an exception: ", e);
            throw notificationError(e);
        }
        return ResponseEntity.status(HttpStatus.SC_OK).body(notificationResponse);
    }



    @RequestMapping(value = "/unreadcount", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<?> getNotificationUnreadCount(
    ) {
        NotificationResponse notificationResponse = null;
        try {
            notificationResponse = notificationService.getUnreadCount();
        } catch (Exception e) {
            LOGGER.error("getNotificationUnreadCount(): caught an exception: ", e);
            throw notificationError(e);
        }
        return ResponseEntity.status(HttpStatus.SC_OK).body(notificationResponse);
    }
}
