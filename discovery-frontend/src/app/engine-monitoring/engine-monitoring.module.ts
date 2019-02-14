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

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
      {
        path: 'overview',
        component: EngineMonitoringComponent,
        data: {'type': 'overview'},
      },
      {
        path: 'ingestion',
        component: EngineMonitoringComponent,
        data: {'type': 'ingestion'},
      },
      {
        path: 'query',
        component: EngineMonitoringComponent,
        data: {'type': 'query'},
      },
    ]),
  ],
  declarations: [
    OverviewComponent,
    IngestionComponent,
    QueryComponent,
    EngineMonitoringComponent,
    DruidClusterInformationComponent,
  ],
})
export class EngineMonitoringModule {
}
