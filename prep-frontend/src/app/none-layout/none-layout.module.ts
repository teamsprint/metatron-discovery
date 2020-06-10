import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {NoneLayoutComponent} from './components/none-layout/none-layout.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: NoneLayoutComponent,
        children: [
          {
            path: '/user/login',
            loadChildren: () => import('../user/user.module').then(mod => mod.UserModule)
          }
        ]
      }
    ])
  ],
  declarations: [NoneLayoutComponent]
})
export class NoneLayoutModule {
}
