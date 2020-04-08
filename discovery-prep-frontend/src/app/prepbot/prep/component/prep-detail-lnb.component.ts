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


@Component({
    selector: 'prep-detail-lnb',
    templateUrl: './prep-detail-lnb.component.html'
})

export class PrepDetailLnbComponent extends AbstractComponent {


    @Output()
    public viewModeChangeEvent: EventEmitter<string> = new EventEmitter();

    @Input()
    public viewMode: string;

    @Input()
    public workflowType: boolean;


    public isNaivationOpen: boolean;





    // 생성자
    constructor(protected elementRef: ElementRef,
                protected injector: Injector) {
        super(elementRef, injector);
    }


    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     | Override Method
     |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

    public ngOnInit() {
        super.ngOnInit();
    }


    public openNavigation() : void {
        this.isNaivationOpen = !this.isNaivationOpen;
    }


    public changeViewMode(viewMode: string) : void {
        this.viewMode = viewMode;
        this.viewModeChangeEvent.emit(viewMode);

    }

}