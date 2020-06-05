package app.metatron.discovery.domain.dataprep.entity;

import app.metatron.dataprep.teddy.DataFrame;
import app.metatron.discovery.domain.user.UserProfile;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

public class DatasetProjections {

    @Projection(name = "default", types = {Dataset.class})
    public interface DefaultProjection {

        String getDsId();

        String getName();

        String getDescription();

        String getCustom();

        Dataset.IMPORT_TYPE getImportType();

        String getConnId();

        Dataset.RS_TYPE getRsType();

        String getDbName();

        String getTblName();

        String getQueryStmt();

        Dataset.FILE_FORMAT getFileFormat();

        String getFilenameBeforeUpload();

        String getSheetName();

        String getStoredUri();

        String getDelimiter();

        String getQuoteChar();

        String getSerializedPreview();

        Integer getManualColumnCount();

        Long getTotalLines();

        Long getTotalBytes();

        DataFrame getGridResponse();

        DateTime getCreatedTime();

        DateTime getModifiedTime();

        @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
        UserProfile getCreatedBy();

        @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
        UserProfile getModifiedBy();


    }
}
