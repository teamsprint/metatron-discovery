import {NgModule} from '@angular/core';
import {SharedModule} from '../common/shared/shared.module';
import {LnbComponent} from './components/lnb.component';
import {ConnectionModule} from '../connection/connection.module';
import {RouterModule} from '@angular/router';

const COMPONENTS = [
  LnbComponent
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule,
    ConnectionModule
  ],
  declarations: [
    ...COMPONENTS
  ],
  exports: [
    ...COMPONENTS
  ]
})
export class LnbModule {
}
