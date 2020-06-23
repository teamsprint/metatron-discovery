import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {PreFlowGuard} from './services/pre-flow.guard';
import {SharedModule} from '../common/shared/shared.module';
import {DataflowModule} from '../dataflow/dataflow.module';
import {ConnectionModule} from '../connection/connection.module';
import {DatasetModule} from '../dataset/dataset.module';
import {LayoutComponent} from './components/layout.component';
import {RouterUrls} from '../common/constants/router.constant';
import {MainComponent} from '../main/components/main.component';
import {UserVerifyGuard} from '../main/services/user-verify/user-verify.guard';
import {PreMainGuard} from '../main/services/pre-main/pre-main.guard';
import {DataflowListComponent} from '../dataflow/components/dataflow-list.component';
import {DataflowDetailComponent} from '../dataflow/components/dataflow-detail.component';
import {GnbComponent} from './components/gnb.component';
import {ConnectionListComponent} from '../connection/components/connection-list.component';
import {DatasetListComponent} from '../dataset/components/dataset-list.component';
import {DatasetDetailComponent} from '../dataset/components/dataset-detail.component';
import {LnbModule} from '../lnb/lnb.module';
import {DataflowService} from '../dataflow/services/dataflow.service';
import {RecipeDetailComponent} from '../recipe/components/recipe-detail.component';
import {RecipeModule} from '../recipe/recipe.module';

const GUARDS = [
  PreMainGuard,
  PreFlowGuard
];

@NgModule({
  imports: [
    SharedModule,
    ConnectionModule,
    DataflowModule,
    DatasetModule,
    RecipeModule,
    LnbModule,
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
            path: `${RouterUrls.Managements.ROOT}/${RouterUrls.Managements.PREP_BOT}/${RouterUrls.Managements.CONNECTION}`,
            component: ConnectionListComponent,
            canActivate: [
              UserVerifyGuard
            ]
          },
          {
            path: `${RouterUrls.Managements.ROOT}/${RouterUrls.Managements.PREP_BOT}/${RouterUrls.Managements.DATASETS}`,
            children: [
              {
                path: '',
                component: DatasetListComponent,
                canActivate: [
                  UserVerifyGuard
                ]
              },
              {
                path: ':id',
                component: DatasetDetailComponent,
                canActivate: [
                  UserVerifyGuard
                ]
              }
            ]
          },
          {
            path: `${RouterUrls.Managements.ROOT}/${RouterUrls.Managements.PREP_BOT}/${RouterUrls.Managements.FLOWS}`,
            children: [
              {
                path: '',
                component: DataflowListComponent,
                canActivate: [
                  UserVerifyGuard
                ]
              },
              {
                path: `:${RouterUrls.Managements.getFlowDetailPathVariableKey()}`,
                component: DataflowDetailComponent,
                canActivate: [
                  UserVerifyGuard
                ]
              },
              {
                path: `:id/${RouterUrls.Managements.RECIPES}/:id`,
                component: RecipeDetailComponent,
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
    GnbComponent,
    MainComponent
  ],
  providers: [
    DataflowService,
    ...GUARDS
  ],
  exports: [
    RouterModule
  ]
})
export class LayoutRoutingModule {
}
