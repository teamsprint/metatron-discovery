import {NgModule} from '@angular/core';
import {SharedModule} from '../common/shared/shared.module';
import {RouterModule} from '@angular/router';
import {DataFlowDetailComponent} from './components/data-flow-detail.component';
import {DataFlowListComponent} from './components/data-flow-list.component';

const COMPONENTS = [
  DataFlowDetailComponent,
  DataFlowListComponent
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
export class DataFlowModule {
}
