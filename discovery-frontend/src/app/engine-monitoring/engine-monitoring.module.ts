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
import {OverviewComponent} from './component/overview/overview.component';
import {IngestionComponent} from './component/ingestion/ingestion.component';
import {QueryComponent} from './component/query/query.component';
import {EngineMonitoringComponent} from './engine-monitoring.component';
import {CommonModule} from '../common/common.module';
import {RouterModule} from '@angular/router';
import {DruidClusterInformationComponent} from './component/druid-cluster-information/druid-cluster-information.component';
import {Engine} from '../domain/engine-monitoring/engine';
import {HeaderOptionComponent} from './component/header-option/header-option.component';
import {HeaderMenuComponent} from './component/header-menu/header-menu.component';
import {HeaderComponent} from './component/header/header.component';
import {EngineServiceModule} from './service/engine-service.module';
import {EngineService} from './service/engine.service';
import {StatusComponent} from './component/overview/component/status.component';
import {OkIconComponent} from './component/overview/component/ok-icon.component';
import {ErrorIconComponent} from './component/overview/component/error-icon.component';
import {SearchComponent} from './component/overview/component/search.component';
import {RadioComponent} from './component/overview/component/radio.component';
import {TableSortPipe} from './component/overview/component/table-sort.pipe';
import {TableFilterPipe} from './component/overview/component/table-filter.pipe';

const _routes = [
  {
    path: '',
    redirectTo: Engine.ContentType.OVERVIEW,
    pathMatch: 'full'
  },
  {
    path: Engine.ContentType.OVERVIEW,
    component: EngineMonitoringComponent,
    data: { 'type': Engine.ContentType.OVERVIEW }
  },
  {
    path: Engine.ContentType.INGESTION,
    component: EngineMonitoringComponent,
    data: { 'type': Engine.ContentType.INGESTION }
  }
];

@NgModule({
  imports: [
    CommonModule,
    EngineServiceModule,
    RouterModule.forChild(_routes)
  ],
  declarations: [
    OverviewComponent,
    IngestionComponent,
    QueryComponent,
    EngineMonitoringComponent,
    DruidClusterInformationComponent,
    HeaderComponent,
    HeaderMenuComponent,
    HeaderOptionComponent,
    StatusComponent,
    OkIconComponent,
    ErrorIconComponent,
    SearchComponent,
    RadioComponent,
    TableFilterPipe,
    TableSortPipe
  ],
  providers: [
    EngineService
  ]
})
export class EngineMonitoringModule {
}
