package app.metatron.discovery.domain.dataprep.repository;

import app.metatron.discovery.domain.dataprep.entity.RecipeRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecipeRuleRepository extends JpaRepository<RecipeRule, String> {


    List<RecipeRule> findAllByOrderByRuleNoAsc();
}
