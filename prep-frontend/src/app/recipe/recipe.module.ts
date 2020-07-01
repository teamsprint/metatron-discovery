import {NgModule} from '@angular/core';
import {SharedModule} from '../common/shared/shared.module';
import {RecipeDetailComponent} from './components/recipe-detail.component';
import {RouterModule} from '@angular/router';
import {LnbModule} from '../lnb/lnb.module';
import {PreRecipeDetailGuard} from './services/pre-recipe-detail.guard';
import {RecipeRuleEditComponent} from './components/recipe-rule-edit.component';
import {RecipeHeaderRuleComponent} from './components/recipe-header-rule.component';
import {RecipeKeepRuleComponent} from './components/recipe-keep-rule.component';
import {RecipeReplaceRuleComponent} from './components/recipe-replace-rule.component';
import {RecipeRenameRuleComponent} from './components/recipe-rename-rule.component';
import {RecipeSetRuleComponent} from './components/recipe-set-rule.component';
import {RecipeSettypeRuleComponent} from './components/recipe-settype-rule.component';
import {RecipeCountpatternRuleComponent} from './components/recipe-countpattern-rule.component';
import {RecipeSplitRuleComponent} from './components/recipe-split-rule.component';
import {RecipeDeriveRuleComponent} from './components/recipe-derive-rule.component';
import {RecipeDeleteRuleComponent} from './components/recipe-delete-rule.component';
import {RecipeDropRuleComponent} from './components/recipe-drop-rule.component';
import {RecipePivotRuleComponent} from './components/recipe-pivot-rule.component';
import {RecipeUnpivotRuleComponent} from './components/recipe-unpivot-rule.component';
import {RecipeJoinRuleComponent} from './components/recipe-join-rule.component';
import {RecipeExtractRuleComponent} from './components/recipe-extract-rule.component';
import {RecipeFlattenRuleComponent} from './components/recipe-flatten-rule.component';
import {RecipeMergeRuleComponent} from './components/recipe-merge-rule.component';
import {RecipeNestRuleComponent} from './components/recipe-nest-rule.component';
import {RecipeUnnestRuleComponent} from './components/recipe-unnest-rule.component';
import {RecipeAggregateRuleComponent} from './components/recipe-aggregate-rule.component';
import {RecipeSortRuleComponent} from './components/recipe-sort-rule.component';
import {RecipeMoveRuleComponent} from './components/recipe-move-rule.component';
import {RecipeUnionRuleComponent} from './components/recipe-union-rule.component';

const COMPONENTS = [
  RecipeDetailComponent,
  RecipeRuleEditComponent,
  RecipeHeaderRuleComponent,
  RecipeKeepRuleComponent,
  RecipeReplaceRuleComponent,
  RecipeRenameRuleComponent,
  RecipeSetRuleComponent,
  RecipeSettypeRuleComponent,
  RecipeCountpatternRuleComponent,
  RecipeSplitRuleComponent,
  RecipeDeriveRuleComponent,
  RecipeDeleteRuleComponent,
  RecipeDropRuleComponent,
  RecipePivotRuleComponent,
  RecipeUnpivotRuleComponent,
  RecipeJoinRuleComponent,
  RecipeExtractRuleComponent,
  RecipeFlattenRuleComponent,
  RecipeMergeRuleComponent,
  RecipeNestRuleComponent,
  RecipeUnnestRuleComponent,
  RecipeAggregateRuleComponent,
  RecipeSortRuleComponent,
  RecipeMoveRuleComponent,
  RecipeUnionRuleComponent
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule,
    LnbModule
  ],
  declarations: [
    ...COMPONENTS
  ],
  providers: [
    PreRecipeDetailGuard
  ],
  exports: [
    ...COMPONENTS
  ]
})
export class RecipeModule {
}
