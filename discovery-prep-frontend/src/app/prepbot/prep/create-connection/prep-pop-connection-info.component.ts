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

import {Component, ElementRef, Injector, Input, ViewChild, Output, EventEmitter} from '@angular/core';
import {AbstractComponent} from '../../../common/component/abstract.component';
import {ActivatedRoute} from "@angular/router";
import {PrepPopConnectionNameComponent} from "./prep-pop-connection-name.component";
import {PopupService} from "../../../common/service/popup.service";

@Component({
  selector: 'prep-pop-connection-info',
  templateUrl: './prep-pop-connection-info.component.html'
})
export class PrepPopConnectionInfoComponent extends AbstractComponent {

    public isShow = false;

    @Input()
    public step: string = '';
    @Output()
    public stepChange : EventEmitter<string> = new EventEmitter();
    @Input()
    public connectionInfo: any;
 @Output()
    public connectionInfoChange : EventEmitter<any> = new EventEmitter();
 @Output()
    public createClose : EventEmitter<void> = new EventEmitter();

    @ViewChild(PrepPopConnectionNameComponent)
    public prepPopDataflowNameComponent : PrepPopConnectionNameComponent;

    public connectionType = '';

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

        // Destory
        super.ngOnDestroy();
    }

    public init() {
        this.isShow = true;
    }

    public goto(step) {
        if(step==='connection-name') {
            this.connectionInfo['connectionType'] = this.connectionType;
            this.connectionInfoChange.emit(this.connectionInfo);
        }
        this.step = step;
        this.stepChange.emit( step );
    }

    public next() {
        if(this.connectionType!=='') {
        this.goto('connection-name');
        }
    }
    public close() {
        this.createClose.emit();
    }

    public selectType(type: string) {
        this.connectionType = type;
    }

    public onSetIntoConnection(target) {
        this.connectionInfo[target.name] = target.value;
    }
}