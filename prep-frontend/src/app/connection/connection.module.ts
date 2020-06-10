import {NgModule} from '@angular/core';
import {CreateConnectionComponent as CreateConnectionComponent} from './components/create/create-connection.component';
import {SharedModule} from '../common/shared/shared.module';
import {ConnectionService} from './services/connection.service';

const COMPONENTS = [
  CreateConnectionComponent
];

@NgModule({
  imports: [
    SharedModule
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
export class ConnectionModule {
}
