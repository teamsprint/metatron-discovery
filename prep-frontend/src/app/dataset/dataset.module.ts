import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {SharedModule} from '../common/shared/shared.module';
import {RouterModule} from '@angular/router';
import {LnbModule} from '../lnb/lnb.module';
import {DatasetListComponent} from './components/dataset-list.component';
import {DatasetsService} from './services/datasets.service';

const COMPONENTS = [
  DatasetListComponent
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
    DatasetsService
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class DatasetModule {
}
