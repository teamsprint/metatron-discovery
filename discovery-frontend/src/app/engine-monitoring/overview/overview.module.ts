import {NgModule} from '@angular/core';
import {OverviewComponent} from './overview.component';
import {StatusComponent} from './component/status.component';
import {OkIconComponent} from './component/ok-icon.component';
import {ErrorIconComponent} from './component/error-icon.component';
import {SearchComponent} from './component/search.component';
import {RadioComponent} from './component/radio.component';
import {TableFilterPipe} from './pipe/table-filter.pipe';
import {TableSortPipe} from './pipe/table-sort.pipe';
import {EngineService} from '../service/engine.service';
import {CommonModule} from '../../common/common.module';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    OverviewComponent,
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
  ],
  exports: [
    OverviewComponent
  ]
})
export class OverviewModule {
}
