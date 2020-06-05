package app.metatron.discovery.domain.dataprep.entity;
import app.metatron.discovery.domain.AbstractHistoryEntity;
import app.metatron.discovery.domain.dataprep.Upstream;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import javax.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "dataflow")
public class Dataflow extends AbstractHistoryEntity {

    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "uuid2")
    @Column(name = "df_id")
    private String dfId;

    @Size(max = 2000)
    @Column(name = "name", nullable = false)
    private String name;

    @Lob
    @Column(name = "description")
    private String description;

    @Lob
    @Column(name = "custom")
    private String custom;

    @OneToMany(mappedBy = "dataflow", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<DataflowDiagram> diagrams;


    @Transient
    @JsonProperty
    List<Upstream> upstreams;


    public String getDfId() {
        return dfId;
    }

    public void setDfId(String dfId) {
        this.dfId = dfId;
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

    public String getCustom() {
        return custom;
    }

    public void setCustom(String custom) {
        this.custom = custom;
    }

    public List<DataflowDiagram> getDiagrams() {
        return diagrams;
    }

    public void setDiagrams(List<DataflowDiagram> diagrams) {
        this.diagrams = diagrams;
    }


    public List<Upstream> getUpstreams() {
        return upstreams;
    }

    public void setUpstreams(List<Upstream> upstreams) {
        this.upstreams = upstreams;
    }

    public boolean addDiagram(DataflowDiagram diagram) {
        if (diagram != null) {
            if (this.diagrams == null) {
                this.diagrams = new ArrayList();
            }
            for (DataflowDiagram ds : this.diagrams) {
                if (ds.getDataset().getDsId() == diagram.getDataset().getDsId() && ds.getRecipe().getRecipeId() == diagram.getRecipe().getRecipeId()) {
                    return false;
                }
            }
            if(diagram.getObjType() == DataflowDiagram.ObjectType.DATASET) {
                diagram.setRecipe(null);
            }

            this.diagrams.add(diagram);
            return true;
        }
        return false;
    }

    @JsonIgnore
    public Integer getObjectCountByType(DataflowDiagram.ObjectType type) {
        Integer count = 0;
        if (this.diagrams != null) {
            for (DataflowDiagram dataflowDiagram : this.diagrams) {
                DataflowDiagram.ObjectType dsType = dataflowDiagram.getObjType();
                if (null != dsType && dsType == type) {
                    count++;
                }
            }
        }
        return count;
    }

    public Integer getDatasetCount() {
        return this.getObjectCountByType(DataflowDiagram.ObjectType.DATASET);
    }

    public Integer getRecipeCount() {
        return this.getObjectCountByType(DataflowDiagram.ObjectType.RECIPE);
    }


    public List<DataflowDiagramResponse> getDiagramData() {
        List<DataflowDiagramResponse> diagramResponseList = new ArrayList<>();
        DataflowDiagramResponse diagramResponse = null;
        if (this.diagrams != null && this.diagrams.size() > 0) {
            for(DataflowDiagram diagram :this.diagrams) {
                diagramResponse = new DataflowDiagramResponse();
                diagramResponse.setCreatorDfId(this.dfId);
                diagramResponse.setCreatorDfName(this.name);
                diagramResponse.setObjType(diagram.getObjType());
                if(diagram.getObjType() == DataflowDiagram.ObjectType.DATASET) {
                    diagramResponse.setObjId(diagram.getDataset().getDsId());
                    diagramResponse.setObjName(diagram.getDataset().getName());
                    diagramResponse.setCreatedTime(diagram.getDataset().getCreatedTime());
                }else if(diagram.getObjType() == DataflowDiagram.ObjectType.RECIPE) {
                    diagramResponse.setObjId(diagram.getRecipe().getRecipeId());
                    diagramResponse.setObjName(diagram.getRecipe().getName());
                    diagramResponse.setCreatedTime(diagram.getRecipe().getCreatedTime());
                }
                diagramResponseList.add(diagramResponse);
            }
        }
        return  diagramResponseList;
    }


    @Override
    public String toString() {
        return this.getClass().getName() + "{" +
                "dfId='" + String.valueOf(dfId) + '\'' +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", custom='" + custom + '\'' +
                '}';
    }


}
