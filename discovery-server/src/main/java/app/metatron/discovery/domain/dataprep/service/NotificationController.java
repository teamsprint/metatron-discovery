/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
