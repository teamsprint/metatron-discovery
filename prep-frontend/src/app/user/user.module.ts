import {NgModule} from '@angular/core';
import {LoginComponent} from './components/login/login.component';
import {RouterModule} from '@angular/router';
import {SharedModule} from '../common/shared/shared.module';
import {PreLoginGuard} from './services/pre-login/pre-login.guard';
import {UserRouterUrl} from './constants/user-router-url';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        redirectTo: `${UserRouterUrl.LOGIN}`,
        pathMatch: 'full'
      },
      {
        path: `${UserRouterUrl.LOGIN}`,
        component: LoginComponent,
        canActivate: [
          PreLoginGuard
        ]
      }
    ])
  ],
  declarations: [
    LoginComponent
  ],
  providers: [
    PreLoginGuard
  ]
})
export class UserModule {
}
