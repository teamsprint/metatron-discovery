package app.metatron.discovery.domain.dataprep.service;

import app.metatron.discovery.domain.dataprep.entity.Notification;
import app.metatron.discovery.util.AuthUtils;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;


@Service
@Transactional
public class NotificationService {

    public List<Notification> getNotificationList() {
        List<Notification> notificationList = new ArrayList<>();
        String user = AuthUtils.getAuthUserName();


        return notificationList;
    }

    public Integer getUnreadCount() {
        Integer getUnreadCount=0;
        String user = AuthUtils.getAuthUserName();

        return getUnreadCount;
    }


}
