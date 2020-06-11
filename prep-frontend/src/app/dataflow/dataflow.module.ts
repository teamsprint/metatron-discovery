import {NgModule} from '@angular/core';
import {SharedModule} from '../common/shared/shared.module';
import {RouterModule} from '@angular/router';
import {DataflowDetailComponent} from './components/dataflow-detail.component';
import {DataflowListComponent} from './components/dataflow-list.component';

const COMPONENTS = [
  DataflowDetailComponent,
  DataflowListComponent
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule
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
