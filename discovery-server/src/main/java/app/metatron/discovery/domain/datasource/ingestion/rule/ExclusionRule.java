package app.metatron.discovery.domain.datasource.ingestion.rule;

import app.metatron.discovery.spec.druid.ingestion.Validation;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class ExclusionRule extends ValidationRule implements IngestionRule {

  String expr;

  @JsonCreator
  public ExclusionRule(@JsonProperty("expr") String expr) {
    this.expr = expr;
  }

  public String getExpr() {
    return expr;
  }

  @Override
  public Validation toValidation(String name) {
    return new Validation(name, expr);
  }
}
