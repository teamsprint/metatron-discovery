import {NgModule} from '@angular/core';
import {SharedModule} from '../common/shared/shared.module';
import {RecipeDetailComponent} from './components/recipe-detail.component';
import {RouterModule} from '@angular/router';
import {LnbModule} from '../lnb/lnb.module';

const COMPONENTS = [
  RecipeDetailComponent
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
  exports: [
    ...COMPONENTS
  ]
})
export class RecipeModule {
}
