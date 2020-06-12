import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CreateConnectionComponent as CreateConnectionComponent} from './components/create-connection.component';
import {CreateConnectionInfoComponent as CreateConnectionInfoComponent} from './components/create-connection-info.component';
import {CreateConnectionNameComponent as CreateConnectionNameComponent} from './components/create-connection-name.component';
import {SharedModule} from '../common/shared/shared.module';
import {ConnectionService} from './services/connection.service';

const COMPONENTS = [
  CreateConnectionComponent,
  CreateConnectionInfoComponent,
  CreateConnectionNameComponent
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
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class ConnectionModule {
}
