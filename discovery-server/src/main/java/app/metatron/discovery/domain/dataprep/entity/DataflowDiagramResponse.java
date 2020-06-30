package app.metatron.discovery.domain.dataprep.entity;

import org.joda.time.DateTime;

public class DataflowDiagramResponse {

    private String creatorDfId;
    private String creatorDfName;
    private String objId;
    private String objName;
    private Long orderNo;
    private DataflowDiagram.ObjectType objType;
    private String parentId;
    private DateTime createdTime;

    public String getCreatorDfId() {
        return creatorDfId;
    }

    public void setCreatorDfId(String creatorDfId) {
        this.creatorDfId = creatorDfId;
    }

    public String getCreatorDfName() {
        return creatorDfName;
    }

    public void setCreatorDfName(String creatorDfName) {
        this.creatorDfName = creatorDfName;
    }

    public String getObjId() {
        return objId;
    }

    public void setObjId(String objId) {
        this.objId = objId;
    }

    public String getObjName() {
        return objName;
    }

    public void setObjName(String objName) {
        this.objName = objName;
    }

    public Long getOrderNo() {
        return orderNo;
    }

    public void setOrderNo(Long orderNo) {
        this.orderNo = orderNo;
    }

    public DataflowDiagram.ObjectType getObjType() {
        return objType;
    }

    public void setObjType(DataflowDiagram.ObjectType objType) {
        this.objType = objType;
    }

    public String getParentId() {
        return parentId;
    }

    public void setParentId(String parentId) {
        this.parentId = parentId;
    }

    public DateTime getCreatedTime() {
        return createdTime;
    }

    public void setCreatedTime(DateTime createdTime) {
        this.createdTime = createdTime;
    }
}
