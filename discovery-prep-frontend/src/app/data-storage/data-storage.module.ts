/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '../common/common.module';
import {RouterModule, Routes} from '@angular/router';
import {DataConnectionComponent} from './data-connection/data-connection.component';
import {CreateConnectionComponent} from './data-connection/create-connection.component';
import {UpdateConnectionComponent} from './data-connection/update-connection.component';
import {DndModule} from 'ng2-dnd';
import {CanDeactivateGuard} from '../common/gaurd/can.deactivate.guard';
import {DataConnectionCreateService} from "./service/data-connection-create.service";
import {DataStorageCommonModule} from "./data-storage-common.module";
import {DataStorageShareModule} from "./data-storage-share.module";
import {DataStorageCriteriaModule} from "./data-storage-criteria.module";
import {TimeComponent} from "./component/time-compoent/time.component";

const storageRoutes: Routes = [
  { path: 'data-connection', component: DataConnectionComponent }
];

@NgModule({
  imports: [
    CommonModule,
    DndModule,
    DataStorageCommonModule,
    DataStorageShareModule,
    DataStorageCriteriaModule,
    RouterModule.forChild(storageRoutes)
  ],
  declarations: [
    // data connection
    DataConnectionComponent,
    CreateConnectionComponent,
    TimeComponent,
    UpdateConnectionComponent
  ],

  providers: [
    DataConnectionCreateService
  ]
})
export class DataStorageModule {
}
