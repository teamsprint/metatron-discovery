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
        component: EngineMonitoringComponent,
        data: {'type': 'overview'},
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
