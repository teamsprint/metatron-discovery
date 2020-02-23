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


import {Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import {AbstractComponent} from '../../../common/component/abstract.component';
import {PrepPopConnectionInfoComponent} from "./prep-pop-connection-info.component";

@Component({
  selector: 'prep-pop-connection-create',
  templateUrl: './prep-pop-connection-create.component.html'
})
export class PrepPopConnectionCreateComponent extends AbstractComponent implements OnInit, OnDestroy {

    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     | Private Variables
     |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     | Protected Variables
     |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     | Public Variables
     |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

    @Output()
    public closeEvent: EventEmitter<string> = new EventEmitter();

    @Output()
    public createComplete: EventEmitter<void> = new EventEmitter();

   @Input()
    public step: string = '';

 @ViewChild(PrepPopConnectionInfoComponent)
  public prepPopConnectionInfoComponent : PrepPopConnectionInfoComponent;

    public connectionInfo = {};

    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     | Constructor
     |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

    // 생성자
    constructor(protected elementRef: ElementRef,
                protected injector: Injector) {
        super(elementRef, injector);
    }

    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     | Override Method
     |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

    // Init
    public ngOnInit() {
        // Init
        super.ngOnInit();
        this.init();
    }

    public init() {
        this.step='complete-connection-create';
        if( this.prepPopConnectionInfoComponent) {
        this.prepPopConnectionInfoComponent.init();
        }
    }

    public ngOnDestroy() {
        super.ngOnDestroy();
    }

    public stepChange(step) {
        this.step = step;
    }

    public connectionInfoChange(connectionInfo) {
        this.connectionInfo = connectionInfo;
    }
    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     | Public Method
     |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     | Protected Method
     |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

    // 닫기
    public createClose() {
        this.closeEvent.emit('complete-connection-create');
    }

    // 완료
    public createCompleteEvent() {
        this.createComplete.emit();
    }



    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     | Private Method
     |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
}