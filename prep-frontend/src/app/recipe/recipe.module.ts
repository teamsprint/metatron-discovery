import {NgModule} from '@angular/core';
import {SharedModule} from '../common/shared/shared.module';
import {RecipeDetailComponent} from './components/recipe-detail.component';
import {RouterModule} from '@angular/router';
import {LnbModule} from '../lnb/lnb.module';
import {PreRecipeDetailGuard} from './services/pre-recipe-detail.guard';
import {RecipeRuleEditComponent} from './components/rule-edit/recipe-rule-edit.component';

const COMPONENTS = [
  RecipeDetailComponent,
  RecipeRuleEditComponent
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
