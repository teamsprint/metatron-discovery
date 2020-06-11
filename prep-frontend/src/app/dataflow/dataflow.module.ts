import {NgModule} from '@angular/core';
import {SharedModule} from '../common/shared/shared.module';
import {RouterModule} from '@angular/router';
import {DataflowDetailComponent} from './components/dataflow-detail.component';
import {DataflowListComponent} from './components/dataflow-list.component';
import {LnbModule} from '../lnb/lnb.module';

const COMPONENTS = [
  DataflowDetailComponent,
  DataflowListComponent
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
export class DataflowModule {
}
