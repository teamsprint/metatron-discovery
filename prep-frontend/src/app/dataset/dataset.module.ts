import {NgModule} from '@angular/core';
import {SharedModule} from '../common/shared/shared.module';
import {LnbModule} from '../lnb/lnb.module';
import {RouterModule} from '@angular/router';

@NgModule({
  imports: [
    SharedModule,
    RouterModule,
    LnbModule
  ]
})
export class DatasetModule {
}
