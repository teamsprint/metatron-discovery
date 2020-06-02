package app.metatron.discovery.domain.dataprep.entity;

import app.metatron.discovery.domain.AbstractHistoryEntity;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import javax.persistence.*;
import javax.validation.constraints.Size;

import com.fasterxml.jackson.annotation.JsonValue;
import org.hibernate.annotations.GenericGenerator;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "notification")
public class Notification extends AbstractHistoryEntity {

    @JsonFormat(shape = JsonFormat.Shape.OBJECT)
    public enum NOTI_CD {
        DATASET,
        DATAFLOW,
        JOB,
        CONNECTION;
        @JsonValue
        public String toJson() {
            return name();
        }
    }

    @JsonFormat(shape = JsonFormat.Shape.OBJECT)
    public enum NOTI_STEP {
        CREATE,
        UPDATE,
        DELETE;
        @JsonValue
        public String toJson() {
            return name();
        }
    }

    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "uuid2")
    @Column(name = "noti_id")
    private String notiId;

    @Column(name = "noti_cd")
    @Enumerated(EnumType.STRING)
    private Notification.NOTI_CD notiCd;

    @Column(name = "noti_step")
    @Enumerated(EnumType.STRING)
    private Notification.NOTI_STEP notiStep;

    @Column(name = "noti_source_id")
    private String  notiSourceId;

    @Lob
    @Column(name = "custom")
    private String custom;

    @Column(name = "read_yn")
    protected String readYn;


    public String getNotiId() {
        return notiId;
    }

    public void setNotiId(String notiId) {
        this.notiId = notiId;
    }

    public Notification.NOTI_CD getNotiCd() {
        return notiCd;
    }

    public void setNotiCd(Notification.NOTI_CD notiCd) {
        this.notiCd = notiCd;
    }

    public Notification.NOTI_STEP getNotiStep() {
        return notiStep;
    }

    public void setNotiStep(Notification.NOTI_STEP notiStep) {
        this.notiStep = notiStep;
    }

    public String getNotiSourceId() {
        return notiSourceId;
    }

    public void setNotiSourceId(String notiSourceId) {
        this.notiSourceId = notiSourceId;
    }

    public String getCustom() {
        return custom;
    }

    public void setCustom(String custom) {
        this.custom = custom;
    }

    public String getReadYn() {
        return readYn;
    }

    public void setReadYn(String readYn) {
        this.readYn = readYn;
    }
}
