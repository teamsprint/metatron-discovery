import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {RouterUrls} from './common/constants/router.constant';
import {environment} from '../environments/environment';
import {UserRouterUrl} from './user/constants/user-router-url';

@NgModule({
  imports: [
    RouterModule.forRoot([
        {
          path: `${RouterUrls.Prepbot.ROOT}`,
          loadChildren: () => import('./layout/layout.module').then(mod => mod.LayoutModule)
        },
        {
          path: `${UserRouterUrl.ROOT}`,
          loadChildren: () => import('../app/user/user.module').then(mod => mod.UserModule)
        },
        {
          path: '**',
          redirectTo: `${RouterUrls.Prepbot.ROOT}`,
          pathMatch: 'full'
        }
      ],
      {
        initialNavigation: true,
        onSameUrlNavigation: 'reload',
        enableTracing: environment.enableTracing
      }
    )
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {
}
