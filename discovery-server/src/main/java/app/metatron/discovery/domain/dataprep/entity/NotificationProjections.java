package app.metatron.discovery.domain.dataprep.entity;

import app.metatron.discovery.domain.user.UserProfile;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

public class NotificationProjections {

    @Projection(name = "default", types = {Notification.class})
    public interface DefaultProjection {

        String getNotiId();

        Notification.NOTI_CD getNotiCd();

        Notification.NOTI_STEP getNotiStep();

        String getNotiSourceId();

        String getCustom();

        String getReadYn();

        DateTime getCreatedTime();

        DateTime getModifiedTime();

        @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
        UserProfile getCreatedBy();

        @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
        UserProfile getModifiedBy();
    }
}
