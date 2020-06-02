package app.metatron.discovery.domain.dataprep;

public class Upstream {
    private String dfId;
    private String upstreamDsId;
    private String reId;

    public String getDfId() {
        return dfId;
    }

    public void setDfId(String dfId) {
        this.dfId = dfId;
    }

    public String getUpstreamDsId() {
        return upstreamDsId;
    }

    public void setUpstreamDsId(String upstreamDsId) {
        this.upstreamDsId = upstreamDsId;
    }

    public String getReId() {
        return reId;
    }

    public void setReId(String reId) {
        this.reId = reId;
    }
}
