package app.metatron.discovery.domain.dataprep.transform;

public class TransformRequest {

    private String dfId;
    private TransformService.OP_TYPE op;
    private Integer ruleIdx;
    private String ruleString;
    private String uiRuleString;
    private String predefinedDsName;
    private Integer count;

    public String getDfId() {
        return dfId;
    }

    public void setDfId(String dfId) {
        this.dfId = dfId;
    }

    public TransformService.OP_TYPE getOp() {
        return op;
    }

    public void setOp(TransformService.OP_TYPE op) {
        this.op = op;
    }

    public Integer getRuleIdx() {
        return ruleIdx;
    }

    public void setRuleIdx(Integer ruleIdx) {
        this.ruleIdx = ruleIdx;
    }

    public String getRuleString() {
        return ruleString;
    }

    public void setRuleString(String ruleString) {
        this.ruleString = ruleString;
    }

    public String getUiRuleString() {
        return uiRuleString;
    }

    public void setUiRuleString(String uiRuleString) {
        this.uiRuleString = uiRuleString;
    }

    public String getPredefinedDsName() {
        return predefinedDsName;
    }

    public void setPredefinedDsName(String predefinedDsName) {
        this.predefinedDsName = predefinedDsName;
    }

    public Integer getCount() {
        return count;
    }

    public void setCount(Integer count) {
        this.count = count;
    }
}
