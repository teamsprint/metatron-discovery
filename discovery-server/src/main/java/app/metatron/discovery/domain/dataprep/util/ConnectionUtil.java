package app.metatron.discovery.domain.dataprep.util;

import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.dsl.BooleanExpression;
import app.metatron.discovery.domain.dataprep.entity.Connection;
import app.metatron.discovery.domain.dataprep.entity.QConnection;
import com.querydsl.core.BooleanBuilder;
import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;

import java.util.List;

public class ConnectionUtil {

    public static String getDriver(String implementor) {
        switch (implementor) {
            case "MYSQL": return "com.mysql.jdbc.Driver";
            case "POSTGRESQL": return "org.postgresql.Driver";
            case "HIVE": return "org.apache.hive.jdbc.HiveDriver";
            case "PRESTO": return "com.facebook.presto.jdbc.PrestoDriver";
            case "ORACLE": return "oracle.jdbc.driver.OracleDriver";
            default: break;
        }
        return null;
    }

    public static String makeJdbcUrlBuilder(Connection connection) {
        StringBuilder sb = new StringBuilder();
        switch (connection.getImplementor()) {
            case "MYSQL":
                sb.append("jdbc:mysql://");sb.append(connection.getHostname()+":"+connection.getPort() + "/");
                return sb.toString();
            case "POSTGRESQL":
                sb.append("jdbc:postgresql://");sb.append(connection.getHostname()+":"+connection.getPort()+"/" + connection.getDatabase());
                return sb.toString();
            case "HIVE":
                sb.append("jdbc:hive2://");sb.append(connection.getHostname()+":"+connection.getPort() + "/default");
                return sb.toString();
            case "PRESTO":
                sb.append("jdbc:presto://");sb.append(connection.getHostname()+":"+connection.getPort()+"/"+connection.getCatalog());
                return sb.toString();
            case "ORACLE":
                sb.append("jdbc:oracle:thin:@");sb.append(connection.getHostname()+":"+connection.getPort()+":"+connection.getDatabase());
                return sb.toString();
            default:
                break;
        }
        return null;
    }

    public static String getTestQuery(String implementor) {
        switch (implementor) {
            case "MYSQL":
            case "HIVE":
            case "POSTGRESQL":
            case "PRESTO": return "SELECT 1";
            case "ORACLE": return "SELECT 1 FROM DUAL";
            default: break;
        }
        return null;
    }

    public static String getDataBaseCountQuery(String implementor) {
        StringBuilder sb = new StringBuilder();
        switch (implementor) {
            case "MYSQL":
                sb.append(" SELECT COUNT(SCHEMA_NAME) AS COUNT ");
                sb.append(" FROM INFORMATION_SCHEMA.SCHEMATA ");
                sb.append(" WHERE 1=1 ");
                return sb.toString();
            case "POSTGRESQL":

                return sb.toString();
            case "PRESTO":

                return sb.toString();
            case "ORACLE":

                return sb.toString();
            default:
                break;
        }
        return sb.toString();
    }

    public static String getDataBaseQuery(Connection connection) {
        StringBuilder sb = new StringBuilder();
        switch (connection.getImplementor()) {
            case "MYSQL":
                sb.append("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE 1=1 ");
                return sb.toString();
            case "POSTGRESQL":

                return sb.toString();
            case "PRESTO":

                return sb.toString();
            case "ORACLE":

                return sb.toString();
            default:
                break;
        }
        return sb.toString();
    }

    public static String getTableQuery(String implementor, String schema) {
        StringBuilder sb = new StringBuilder();
        switch (implementor) {
            case "MYSQL":
                sb.append(" SELECT TABLE_NAME name, TABLE_TYPE type, TABLE_COMMENT comment ");
                sb.append(" FROM INFORMATION_SCHEMA.TABLES ");
                sb.append(" WHERE 1 = 1 ");
                if (schema != null && !schema.isEmpty()) {
                    sb.append(" AND TABLE_SCHEMA='" + schema + "' ");
                }
                return sb.toString();
            case "POSTGRESQL":

                return sb.toString();
            case "PRESTO":

                return sb.toString();
            case "ORACLE":

                return sb.toString();
            default:
                break;
        }
        return sb.toString();
    }

    public static Predicate searchList(
                                    List<String> implementors,
                                    DateTime createdTimeFrom,
                                    DateTime createdTimeTo,
                                    DateTime modifiedTimeFrom,
                                    DateTime modifiedTimeTo,
                                    String containsText) {

        QConnection connection = QConnection.connection;
        BooleanBuilder builder = new BooleanBuilder();

        // implementors
        if(implementors != null && !implementors.isEmpty()){
            BooleanBuilder subBuilder = new BooleanBuilder();
            for(String implementor : implementors){
                subBuilder = subBuilder.or(connection.implementor.eq(implementor));
            }
            builder = builder.and(subBuilder);
        }

        //containsText
        if(StringUtils.isNotEmpty(containsText)){
            builder = builder.andAnyOf(connection.name.containsIgnoreCase(containsText),
                    connection.description.containsIgnoreCase(containsText));
        }

        //createdTime
        if(createdTimeFrom != null && createdTimeTo != null) {
            builder = builder.and(connection.createdTime.between(createdTimeFrom, createdTimeTo));
        } else if(createdTimeFrom != null){
            builder = builder.and(connection.createdTime.goe(createdTimeFrom));
        } else if(createdTimeTo != null){
            builder = builder.and(connection.createdTime.loe(createdTimeTo));
        }

        //modifiedTime
        if(modifiedTimeFrom != null && modifiedTimeTo != null) {
            builder = builder.and(connection.modifiedTime.between(modifiedTimeFrom, modifiedTimeTo));
        } else if(modifiedTimeFrom != null){
            builder = builder.and(connection.modifiedTime.goe(modifiedTimeFrom));
        } else if(modifiedTimeTo != null){
            builder = builder.and(connection.modifiedTime.loe(modifiedTimeTo));
        }

        return builder;
    }


}
