package app.metatron.discovery.domain.dataprep.entity;

import java.io.Serializable;

public class DataflowDiagramId implements Serializable {

    Long orderNo;
    String dataflow;

    public DataflowDiagramId() {}

    public DataflowDiagramId(Long orderNo, String dataflow) {
        this.dataflow = dataflow;
        this.orderNo  = orderNo;
    }

    @Override
    public int hashCode() {
        return super.hashCode();
    }

    @Override
    public boolean equals(Object obj) {
        return super.equals(obj);
    }

}
