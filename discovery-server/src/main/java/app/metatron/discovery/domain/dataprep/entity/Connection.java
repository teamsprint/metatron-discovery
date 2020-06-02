package app.metatron.discovery.domain.dataprep.entity;

import app.metatron.discovery.domain.AbstractHistoryEntity;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import javax.persistence.*;
import javax.validation.constraints.Size;

import com.fasterxml.jackson.annotation.JsonValue;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.validator.constraints.NotBlank;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "connection")
public class Connection extends AbstractHistoryEntity {

    @JsonFormat(shape = JsonFormat.Shape.OBJECT)
    public enum ConnType {
        API,
        JDBC;
        @JsonValue
        public String toJson() {
            return name();
        }
    }


    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "uuid2")
    @Column(name = "conn_id")
    protected String connId;

    @Column(name = "name")
    @NotBlank
    @Size(max = 150)
    protected String name;

    @Lob
    @Column(name = "description")
    protected String description;

    @Column(name = "conn_implementor")
    protected String implementor;

    @Column(name = "conn_hostname")
    protected String hostname;

    @Column(name = "conn_port")
    protected Integer port;

    @Column(name = "conn_database")
    protected String database;

    @Column(name = "conn_catalog")
    protected String catalog;

    @Column(name = "conn_sid")
    protected String sid;

    @Column(name = "conn_string_url")
    protected String url;

    @Column(name = "conn_username")
    protected String username;

    @Column(name = "conn_password")
    protected String password;

    @Column(name = "conn_type")
    @Enumerated(EnumType.STRING)
    protected Connection.ConnType connType;

    @Column(name = "modify_sub_yn")
    protected String modifySubYn;

    public String getConnId() {
        return connId;
    }

    public void setConnId(String connId) {
        this.connId = connId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImplementor() {
        return implementor;
    }

    public void setImplementor(String implementor) {
        this.implementor = implementor;
    }

    public String getHostname() {
        return hostname;
    }

    public void setHostname(String hostname) {
        this.hostname = hostname;
    }

    public Integer getPort() {
        return port;
    }

    public void setPort(Integer port) {
        this.port = port;
    }

    public String getDatabase() {
        return database;
    }

    public void setDatabase(String database) {
        this.database = database;
    }

    public String getCatalog() {
        return catalog;
    }

    public void setCatalog(String catalog) {
        this.catalog = catalog;
    }

    public String getSid() {
        return sid;
    }

    public void setSid(String sid) {
        this.sid = sid;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public ConnType getConnType() {
        return connType;
    }

    public void setConnType(ConnType connType) {
        this.connType = connType;
    }

    public String getModifySubYn() {
        return modifySubYn;
    }

    public void setModifySubYn(String modifySubYn) {
        this.modifySubYn = modifySubYn;
    }
}
