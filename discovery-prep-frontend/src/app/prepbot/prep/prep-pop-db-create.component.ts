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

import {Component, ElementRef, HostListener, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AbstractComponent} from '../../common/component/abstract.component';
import {DataflowService} from '../dataflow/service/dataflow.service';
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'prep-pop-db-create',
  templateUrl: './prep-pop-db-create.component.html'
})
export class PrepPopDBCreateComponent extends AbstractComponent {

    public isShow = false;


    // 생성자
    constructor(protected elementRef: ElementRef,
                protected injector: Injector,
                private activatedRoute: ActivatedRoute) {

        super(elementRef, injector);
    }

    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     | Override Method
     |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

    public ngOnInit() {
        super.ngOnInit();
    }

    // Destory
    public ngOnDestroy() {
        // Destory
        super.ngOnDestroy();
    }

    public init() {
        this.isShow = true;
    }
}