package app.metatron.discovery.domain.dataprep.service;

import java.util.List;
import app.metatron.discovery.common.criteria.ListFilterRequest;

public class ConnectionFilterRequest extends ListFilterRequest {
    List<String> implementor;

    public List<String> getImplementor() {
        return implementor;
    }

    public void setImplementor(List<String> implementor) {
        this.implementor = implementor;
    }
}
