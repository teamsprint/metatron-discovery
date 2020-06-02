package app.metatron.discovery.domain.dataprep.entity;

import com.fasterxml.jackson.annotation.*;
import org.hibernate.validator.constraints.NotBlank;

import javax.persistence.*;
import javax.validation.constraints.Size;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@IdClass(DataflowDiagramId.class)
@Table(name = "dataflow_diagram")
public class DataflowDiagram  {

    @JsonFormat(shape = JsonFormat.Shape.OBJECT)
    public enum ObjectType {
        DATASET,
        RECIPE;
        @JsonValue
        public String toJson() {
            return name();
        }
    }


    @Id
    @Column(name = "order_no", nullable = false)
    private Long orderNo;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "df_id")
    @JsonIgnore
    private Dataflow dataflow;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ds_id")
    @JsonIgnore
    private Dataset dataset;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "re_id")
    @JsonIgnore
    private Recipe recipe;

    @Column(name = "object_type")
    @Enumerated(EnumType.STRING)
    private DataflowDiagram.ObjectType objType;


    public Long getOrderNo() {
        return orderNo;
    }

    public void setOrderNo(Long orderNo) {
        this.orderNo = orderNo;
    }

    public Dataflow getDataflow() {
        return dataflow;
    }

    public void setDataflow(Dataflow dataflow) {
        this.dataflow = dataflow;
    }

    public Dataset getDataset() {
        return dataset;
    }

    public void setDataset(Dataset dataset) {
        this.dataset = dataset;
    }

    public Recipe getRecipe() {
        return recipe;
    }

    public void setRecipe(Recipe recipe) {
        this.recipe = recipe;
    }

    public ObjectType getObjType() {
        return objType;
    }

    public void setObjType(ObjectType objType) {
        this.objType = objType;
    }
}
