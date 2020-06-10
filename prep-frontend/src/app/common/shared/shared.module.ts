import {NgModule} from '@angular/core';
import {CommonModule, Location} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgPipesModule} from 'ngx-pipes';
import {ClickOutsideModule} from 'ng-click-outside';
import {DragulaModule, DragulaService} from 'ng2-dragula';

const MODULES = [
  CommonModule,
  FormsModule,
  NgPipesModule,
  ClickOutsideModule,
  DragulaModule
];

const SERVICES = [
  DragulaService,
  Location
];

@NgModule({
  imports: [
    ...MODULES
  ],
  exports: [
    ...MODULES
  ],
  providers: [
    ...SERVICES
  ]
})
export class SharedModule {
}
