import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CreateConnectionComponent as CreateConnectionComponent} from './components/create-connection.component';
import {CreateConnectionInfoComponent as CreateConnectionInfoComponent} from './components/create-connection-info.component';
import {ConnectionListComponent as ConnectionListComponent} from './components/connection-list.component';
import {CreateConnectionNameComponent as CreateConnectionNameComponent} from './components/create-connection-name.component';
import {UpdateConnectionComponent as UpdateConnectionComponent} from './components/update-connection.component';
import {SharedModule} from '../common/shared/shared.module';
import {RouterModule} from '@angular/router';
import {LnbModule} from '../lnb/lnb.module';
import {ConnectionService} from './services/connection.service';

const COMPONENTS = [
  CreateConnectionComponent,
  CreateConnectionInfoComponent,
  CreateConnectionNameComponent,
  ConnectionListComponent,
  UpdateConnectionComponent
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
    ConnectionService
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class ConnectionModule {
}
