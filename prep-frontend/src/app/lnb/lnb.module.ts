import {NgModule} from '@angular/core';
import {SharedModule} from '../common/shared/shared.module';
import {LnbComponent} from './components/lnb.component';
import {RouterModule} from '@angular/router';
import {ConnectionService} from '../connection/services/connection.service';

const COMPONENTS = [
  LnbComponent
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule
  ],
  declarations: [
    ...COMPONENTS
  ],
  providers: [
    ConnectionService
  ],
  exports: [
    ...COMPONENTS
  ]
})
export class LnbModule {
}
