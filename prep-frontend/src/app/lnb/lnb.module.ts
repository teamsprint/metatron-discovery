import {NgModule} from '@angular/core';
import {SharedModule} from '../common/shared/shared.module';
import {LnbComponent} from './components/lnb.component';
import {RouterModule} from '@angular/router';

const COMPONENTS = [
  LnbComponent
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule
  ],
  declarations: [
    ...COMPONENTS
  ],
  exports: [
    ...COMPONENTS
  ]
})
export class LnbModule {
}
