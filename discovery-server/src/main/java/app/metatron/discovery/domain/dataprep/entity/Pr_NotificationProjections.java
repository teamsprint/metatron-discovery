package app.metatron.discovery.domain.dataprep.entity;

import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;
import app.metatron.discovery.domain.user.UserProfile;

public class Pr_NotificationProjections {

    @Projection(name = "default", types = {Pr_Notification.class})
    public interface DefaultProjection {

        String getNotiId();

        Pr_Notification.NOTI_CD getNotiCd();

        Pr_Notification.NOTI_STEP getNotiStep();

        String getFullMessage();

        DateTime getCreatedTime();

        DateTime getModifiedTime();

        @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
        UserProfile getCreatedBy();

        @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
        UserProfile getModifiedBy();
    }
}
