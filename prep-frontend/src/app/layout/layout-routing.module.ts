import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {PreFlowGuard} from './services/pre-flow.guard';
import {SharedModule} from '../common/shared/shared.module';
import {DataFlowModule} from '../data-flow/data-flow.module';
import {DatasetModule} from '../dataset/dataset.module';
import {LayoutComponent} from './components/layout.component';
import {RouterUrls} from '../common/constants/router.constant';
import {MainComponent} from '../main/components/main.component';
import {UserVerifyGuard} from '../main/services/user-verify/user-verify.guard';
import {PreMainGuard} from '../main/services/pre-main/pre-main.guard';
import {DataFlowListComponent} from '../data-flow/components/data-flow-list.component';
import {DataFlowDetailComponent} from '../data-flow/components/data-flow-detail.component';
import {DatasetComponent} from '../dataset/components/dataset.component';
import {LnbComponent} from './components/lnb.component';
import {GnbComponent} from './components/gnb.component';

@NgModule({
  imports: [
    SharedModule,
    DataFlowModule,
    DatasetModule,
    RouterModule.forChild([
      {
        path: '',
        component: LayoutComponent,
        children: [
          {
            path: '',
            redirectTo: `${RouterUrls.Managements.ROOT}/${RouterUrls.Managements.PREP_BOT}`,
            pathMatch: 'full'
          },
          {
            path: `${RouterUrls.Managements.ROOT}/${RouterUrls.Managements.PREP_BOT}`,
            component: MainComponent,
            canActivate: [
              UserVerifyGuard,
              PreMainGuard
            ]
          },
          {
            path: `${RouterUrls.Managements.ROOT}/${RouterUrls.Managements.PREP_BOT}/${RouterUrls.Managements.FLOWS}`,
            children: [
              {
                path: '',
                component: DataFlowListComponent,
              },
              {
                path: ':id',
                component: DataFlowDetailComponent,
                canActivate: [
                  UserVerifyGuard
                ]
              },
              {
                path: `:id/${RouterUrls.Managements.DATASET}/:id`,
                component: DatasetComponent,
                canActivate: [
                  UserVerifyGuard
                ]
              }
            ]
          }
        ]
      }
    ])
  ],
  declarations: [
    LayoutComponent,
    LnbComponent,
    GnbComponent,
    MainComponent
  ],
  providers: [
    PreMainGuard,
    PreFlowGuard
  ],
  exports: [
    RouterModule
  ]
})
export class LayoutRoutingModule {
}
