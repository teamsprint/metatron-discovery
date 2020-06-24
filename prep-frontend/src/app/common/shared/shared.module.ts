import {NgModule} from '@angular/core';
import {CommonModule, Location} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgPipesModule} from 'ngx-pipes';
import {ClickOutsideModule} from 'ng-click-outside';
import {DragulaModule, DragulaService} from 'ng2-dragula';
import {NgxEchartsModule} from 'ngx-echarts';
import * as echarts from 'echarts';
import {AngularSlickgridModule} from 'angular-slickgrid';

const MODULES = [
  CommonModule,
  FormsModule,
  NgPipesModule,
  ClickOutsideModule,
  DragulaModule,
  NgxEchartsModule.forRoot({
    echarts
  }),
  AngularSlickgridModule.forRoot({})
];

const COMPONENTS = [];

const SERVICES = [
  DragulaService,
  Location
];

@NgModule({
  imports: [
    ...MODULES
  ],
  declarations: [
    ...COMPONENTS
  ],
  exports: [
    ...MODULES,
    ...COMPONENTS
  ],
  providers: [
    ...SERVICES
  ]
})
export class SharedModule {
}
