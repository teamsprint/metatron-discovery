/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
@Table(name = "pr_notification")
public class Pr_Notification extends AbstractHistoryEntity {

    @JsonFormat(shape = JsonFormat.Shape.OBJECT)
    public enum NOTI_CD {
        DATASET,
        DATAFLOW,
        DATARESULT,
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
    String notiId;



    @Column(name = "noti_cd")
    @Enumerated(EnumType.STRING)
    private Pr_Notification.NOTI_CD notiCd;


    @Column(name = "noti_step")
    @Enumerated(EnumType.STRING)
    private Pr_Notification.NOTI_STEP notiStep;

    @Size(max = 2000)
    @Column(name = "full_message", nullable = false)
    private String fullMessage;

    public String getNotiId() {
        return notiId;
    }

    public void setNotiId(String notiId) {
        this.notiId = notiId;
    }

    public NOTI_CD getNotiCd() {
        return notiCd;
    }

    public void setNotiCd(NOTI_CD notiCd) {
        this.notiCd = notiCd;
    }

    public NOTI_STEP getNotiStep() {
        return notiStep;
    }

    public void setNotiStep(NOTI_STEP notiStep) {
        this.notiStep = notiStep;
    }

    public String getFullMessage() {
        return fullMessage;
    }

    public void setFullMessage(String fullMessage) {
        this.fullMessage = fullMessage;
    }
}
