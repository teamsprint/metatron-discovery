package app.metatron.discovery.domain.dataprep.entity;

import java.util.List;
import java.util.Map;
public class NotificationResponse {

    Integer unreadCount;
    List<Notification> notifications;
    Map<String,Object> page;
    List<String> divisions;

    public Integer getUnreadCount() {
        return unreadCount;
    }

    public void setUnreadCount(Integer unreadCount) {
        this.unreadCount = unreadCount;
    }

    public List<Notification> getNotifications() {
        return notifications;
    }

    public void setNotifications(List<Notification> notifications) {
        this.notifications = notifications;
    }

    public Map<String, Object> getPage() {
        return page;
    }

    public void setPage(Map<String, Object> page) {
        this.page = page;
    }

    public List<String> getDivisions() {
        return divisions;
    }

    public void setDivisions(List<String> divisions) {
        this.divisions = divisions;
    }
}
