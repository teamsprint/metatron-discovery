package app.metatron.discovery.domain.dataprep.entity;

import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.user.UserProfile;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;


public class ConnectionProjections {

    @Projection(name = "default", types = {Connection.class})
    public interface DefaultProjection {

        String getConnId();

        String getName();

        String getDescription();

        String getImplementor();

        String getHostname();

        Integer getPort();

        String getDatabase();

        String getCatalog();

        String getSid();

        String getUrl();

        String getUsername();

        String getPassword();

        Connection.ConnType getConnType();

        String getModifySubYn();

        DateTime getCreatedTime();

        DateTime getModifiedTime();

        @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
        UserProfile getCreatedBy();

        @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
        UserProfile getModifiedBy();
    }

    @Projection(name = "forSimpleListView", types = { Connection.class })
    public interface ForSimpleListViewProjection {

        String getConnId();

        String getName();

        Connection.ConnType getConnType();

        String getImplementor();

    }

    @Projection(name = "list", types = { Connection.class })
    public interface listProjection {

        String getConnId();

        String getName();

        String getDescription();

        Connection.ConnType getConnType();

        String getImplementor();

        String getHostname();

        String getPort();

        String getUrl();

        String getDatabase();

        String getModifySubYn();


        @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
        UserProfile getCreatedBy();

        DateTime getCreatedTime();

        @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
        UserProfile getModifiedBy();

        DateTime getModifiedTime();
    }
}
