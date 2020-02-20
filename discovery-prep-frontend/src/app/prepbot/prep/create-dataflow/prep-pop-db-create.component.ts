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

import {Component, ElementRef, HostListener, Injector, OnDestroy, OnInit, ViewChild, Input} from '@angular/core';
import {AbstractComponent} from '../../../common/component/abstract.component';
import {DataflowService} from '../../dataflow/service/dataflow.service';
import {ActivatedRoute} from "@angular/router";
import {PopupService} from '../../../common/service/popup.service';

@Component({
  selector: 'prep-pop2-db-create',
  templateUrl: './prep-pop-db-create.component.html'
})
export class PrepPopDBCreateComponent extends AbstractComponent {

    @Input()
    public step: string = '';

    public isShow = false;

    // 생성자
    constructor(protected elementRef: ElementRef,
                private popupService: PopupService,
                protected injector: Injector,
                private activatedRoute: ActivatedRoute) {

        super(elementRef, injector);
    }

    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     | Override Method
     |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

    public ngOnInit() {
        super.ngOnInit();
        this.init();
    }

    // Destory
    public ngOnDestroy() {
        super.ngOnDestroy();
    }

    public init() {
        this.isShow = true;
    }

    public goPre(){
        //this.prepPopCreateComponent.init();
        // this.popupService.notiPopup({
        //     name: 'prep-pop-create',
        //     data: null
        // });
    }
}