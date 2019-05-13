package app.metatron.discovery.domain.dataprep.sql;

import static app.metatron.discovery.domain.dataprep.PrepProperties.HADOOP_CONF_DIR;

import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;

import java.io.*;
import java.net.URI;
import java.net.URISyntaxException;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FSDataOutputStream;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PrepSqlUtil {
    private static Logger LOGGER = LoggerFactory.getLogger(PrepSqlUtil.class);

    /**
     * @param strUri      URI as String (to be java.net.URI)
     * @param conf        Hadoop configuration which is mandatory when the url's protocol is hdfs
     *
     *  header will be false for table-type snapshots.
     */
    public static PrintWriter getSqlPrinter(String strUri, Configuration conf) {
        PrintWriter printWriter;
        URI uri;

        try {
            uri = new URI(strUri);
        } catch (URISyntaxException e) {
            e.printStackTrace();
            throw PrepException.create(PrepErrorCodes.PREP_SNAPSHOT_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_MALFORMED_URI_SYNTAX, strUri);
        }

        switch (uri.getScheme()) {
            case "hdfs":
                if (conf == null) {
                    throw PrepException.create(PrepErrorCodes.PREP_INVALID_CONFIG_CODE, PrepMessageKey.MSG_DP_ALERT_REQUIRED_PROPERTY_MISSING, HADOOP_CONF_DIR);
                }
                Path path = new Path(uri);

                FileSystem hdfsFs;
                try {
                    hdfsFs = FileSystem.get(conf);
                } catch (IOException e) {
                    e.printStackTrace();
                    throw PrepException.create(PrepErrorCodes.PREP_SNAPSHOT_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_CANNOT_GET_HDFS_FILE_SYSTEM, strUri);
                }

                FSDataOutputStream hos;
                try {
                    hos = hdfsFs.create(path);
                } catch (IOException e) {
                    e.printStackTrace();
                    throw PrepException.create(PrepErrorCodes.PREP_SNAPSHOT_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_CANNOT_WRITE_TO_HDFS_PATH, strUri);
                }

                printWriter = new PrintWriter(new BufferedWriter( new OutputStreamWriter(hos)));
                break;

            case "file":
                File file = new File(uri);
                File dirParent = file.getParentFile();
                if(dirParent==null) {
                    throw PrepException.create(PrepErrorCodes.PREP_SNAPSHOT_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_CANNOT_WRITE_TO_LOCAL_PATH, strUri);
                }
                if(false==dirParent.exists()) {
                    if(false==dirParent.mkdirs()) {
                        throw PrepException.create(PrepErrorCodes.PREP_SNAPSHOT_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_CANNOT_WRITE_TO_LOCAL_PATH, strUri);
                    }
                }

                FileOutputStream fos;
                try {
                    fos = new FileOutputStream(file);
                } catch (FileNotFoundException e) {
                    e.printStackTrace();
                    throw PrepException.create(PrepErrorCodes.PREP_SNAPSHOT_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_CANNOT_READ_FROM_LOCAL_PATH, strUri);
                }

                printWriter = new PrintWriter(new BufferedWriter( new OutputStreamWriter(fos)));
                break;

            default:
                throw PrepException.create(PrepErrorCodes.PREP_SNAPSHOT_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_UNSUPPORTED_URI_SCHEME, strUri);
        }

        return printWriter;
    }


}
