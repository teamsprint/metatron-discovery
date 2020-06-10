import {NgModule} from '@angular/core';
import {SharedModule} from '../common/shared/shared.module';
import {DatasetComponent} from './components/dataset.component';

const COMPONENTS = [
  DatasetComponent
];

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    ...COMPONENTS
  ],
  exports: [
    ...COMPONENTS
  ]
})
export class DatasetModule {
}
