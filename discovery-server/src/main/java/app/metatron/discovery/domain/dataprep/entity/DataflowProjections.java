package app.metatron.discovery.domain.dataprep.entity;

import app.metatron.discovery.domain.user.UserProfile;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

import java.util.List;

public class DataflowProjections {

    @Projection(name = "default", types = {Dataflow.class})
    public interface DefaultProjection {

        String getDfId();

        String getName();

        String getDescription();

        String getCustom();

        DateTime getCreatedTime();

        DateTime getModifiedTime();

        List<DataflowDiagram> getDiagrams();

        List<DataflowDiagramResponse> getDiagramData();

        Integer getDatasetCount();

        Integer getRecipeCount();

        @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
        UserProfile getCreatedBy();

        @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
        UserProfile getModifiedBy();
    }
}
