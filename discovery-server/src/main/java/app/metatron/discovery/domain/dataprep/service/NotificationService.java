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

import app.metatron.discovery.domain.dataprep.entity.Connection;
import app.metatron.discovery.domain.dataprep.entity.Dataflow;
import app.metatron.discovery.domain.dataprep.entity.Dataset;
import app.metatron.discovery.domain.dataprep.entity.Notification;
import app.metatron.discovery.domain.dataprep.entity.NotificationResponse;
import app.metatron.discovery.domain.dataprep.repository.ConnectionRepository;
import app.metatron.discovery.domain.dataprep.repository.DataflowRepository;
import app.metatron.discovery.domain.dataprep.repository.DatasetRepository;
import app.metatron.discovery.domain.dataprep.repository.NotificationRepository;
import app.metatron.discovery.util.AuthUtils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;

@Service
@Transactional
public class NotificationService {

    private static Logger LOGGER = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    NotificationRepository notificationRepository;

    @Autowired
    ConnectionRepository connectionRepository;

    @Autowired
    DataflowRepository dataflowRepository;

    @Autowired
    DatasetRepository datasetRepository;

    public NotificationResponse getNotificationList(Pageable pageable) {
        NotificationResponse notificationResponse = new NotificationResponse();
        String user = AuthUtils.getAuthUserName();
        Page<Notification> notificationPage = notificationRepository.findByCreatedBy(user, pageable);
        Map<String,Object> page = new HashMap<>();
        page.put("number",notificationPage.getNumber());
        page.put("size",notificationPage.getSize());
        page.put("totalElements",notificationPage.getTotalElements());
        page.put("totalPages",notificationPage.getTotalPages());
        notificationResponse.setPage(page);

        List<Notification> loadNotificationList = notificationPage.getContent();
        if(loadNotificationList!=null && loadNotificationList.size()>0) {
            for(Notification notification:loadNotificationList) {
                if("N".equals(notification.getReadYn())) {
                    notification.setReadYn("Y");
                    this.notificationRepository.saveAndFlush(notification);
                }
            }
        }
        String notiSourceName  = null;
        String notiSourceId = null;
        String division = null;
        Connection connection = null;
        Dataflow dataflow = null;
        Dataset dataset  = null;

        DateTimeFormatter fmt = DateTimeFormat.forPattern("yyyyMMdd");
        List<String> divisions = new ArrayList<>();

        for(Notification notification:loadNotificationList) {
            notiSourceName  = "";
            notiSourceId = notification.getNotiSourceId();
            if(notification.getNotiCd().equals(Notification.NOTI_CD.CONNECTION)) {
                connection = connectionRepository.findOne(notiSourceId);
                if(connection!=null) { notiSourceName = connection.getName(); }
            } else if(notification.getNotiCd().equals(Notification.NOTI_CD.DATAFLOW)) {
                dataflow = dataflowRepository.findOne(notiSourceId);
                if(dataflow!=null) { notiSourceName = dataflow.getName(); }
            } else if(notification.getNotiCd().equals(Notification.NOTI_CD.DATASET)) {
                dataset = datasetRepository.findOne(notiSourceId);
                if(dataset!=null) { notiSourceName = dataset.getName(); }
            }
            notification.setNotiSourceName(notiSourceName);
            division = fmt.print(notification.getCreatedTime());
            notification.setDivision(division);
            if(!divisions.contains(division)) {
                divisions.add(division);
            }
        }
        notificationResponse.setDivisions(divisions);
        notificationResponse.setNotifications(loadNotificationList);
        notificationResponse.setUnreadCount(commonUnreadCount());
        return notificationResponse;
    }

    public NotificationResponse getUnreadCount() {
        NotificationResponse notificationResponse = new NotificationResponse();
        notificationResponse.setUnreadCount(this.commonUnreadCount());
        return notificationResponse;
    }


    public Integer commonUnreadCount() {
        Integer getUnreadCount=0;
        String readYn="N";
        String user = AuthUtils.getAuthUserName();
        getUnreadCount = notificationRepository.countByCreatedByAndReadYn(user, readYn);
        return getUnreadCount;
    }

    public NotificationResponse deleteNotificationList(String division) {
        NotificationResponse notificationResponse = new NotificationResponse();
        String start = division + "000001";
        String end = division + "235959";
        String user = AuthUtils.getAuthUserName();

        DateTime startDate = DateTime.parse(start, DateTimeFormat.forPattern("yyyyMMddHHmmss"));
        DateTime endDate = DateTime.parse(end, DateTimeFormat.forPattern("yyyyMMddHHmmss"));
        List<Notification> notificationList = notificationRepository.findByCreatedByAndCreatedTimeBetween(user, startDate, endDate);
        this.notificationRepository.delete(notificationList);
        this.notificationRepository.flush();

        notificationResponse.setUnreadCount(commonUnreadCount());
        return notificationResponse;
    }

}
