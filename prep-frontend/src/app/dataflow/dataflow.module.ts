import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {SharedModule} from '../common/shared/shared.module';
import {RouterModule} from '@angular/router';
import {DataflowDetailComponent} from './components/dataflow-detail.component';
import {DataflowListComponent} from './components/dataflow-list.component';
import {CreateDataflowComponent} from './components/create-dataflow.component';
import {CreateDataflowListComponent} from './components/create-dataflow-list.component';
import {CreateDataflowNameComponent} from './components/create-dataflow-name.component';
import {DatasetsService} from '../dataset/services/datasets.service';
import {LnbModule} from '../lnb/lnb.module';
import {DataflowService} from './services/dataflow.service';
import {RecipeService} from '../recipe/services/recipe.service';

const COMPONENTS = [
  DataflowDetailComponent,
  DataflowListComponent,
  CreateDataflowComponent,
  CreateDataflowListComponent,
  CreateDataflowNameComponent
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
  ],
  providers: [
    DatasetsService,
    DataflowService,
    RecipeService
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class DataflowModule {
}
