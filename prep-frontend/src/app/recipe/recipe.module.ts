import {NgModule} from '@angular/core';
import {SharedModule} from '../common/shared/shared.module';
import {RecipeDetailComponent} from './components/recipe-detail.component';
import {RouterModule} from '@angular/router';
import {LnbModule} from '../lnb/lnb.module';
import {AngularSlickgridModule} from 'angular-slickgrid';

const COMPONENTS = [
  RecipeDetailComponent
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule,
    LnbModule,
    AngularSlickgridModule.forRoot({})
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
