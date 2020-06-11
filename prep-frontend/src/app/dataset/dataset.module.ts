import {NgModule} from '@angular/core';
import {SharedModule} from '../common/shared/shared.module';
import {DatasetComponent} from './components/dataset.component';
import {LnbModule} from '../lnb/lnb.module';
import {RouterModule} from '@angular/router';

const COMPONENTS = [
  DatasetComponent
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule,
    LnbModule,
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
