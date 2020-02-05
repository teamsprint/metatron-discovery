/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { NgModule } from '@angular/core';
import { PrepbotComponent } from './prepbot.component';
import { PrepbotGuard } from './prepbot.guard';
import { PrepbotService } from './service/prepbot.service';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '../common/common.module';
import { FileModule } from '../common/file.module';
import { SplitPaneModule } from 'ng2-split-pane/lib/ng2-split-pane';
import {DatasetComponent} from "../data-preparation/dataset/dataset.component";


const dataPreparationRoutes: Routes = [
  { path: '', component: PrepbotComponent },
  { path: 'prepbot', component: PrepbotComponent }
];

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    PrepbotComponent
  ],
  providers: [
    PrepbotService
  ],
  exports: [
  ]
})
export class PrepbotModule { }
