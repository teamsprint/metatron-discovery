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
import {PrepPopDataflowNameComponent} from "./prep-pop-dataflow-name.component";
import {PopupService} from "../../../common/service/popup.service";
import { PrDataset, ImportType } from '../../../domain/data-preparation/pr-dataset';

@Component({
  selector: 'prep-pop-dataset-list',
  templateUrl: './prep-pop-dataset-list.component.html'
})
export class PrepPopDatasetListComponent extends AbstractComponent {

    public isShow = false;

    @Input()
    public step: string = '';
    @Output()
    public stepChange : EventEmitter<string> = new EventEmitter();

    // 새로 생성될 데이셋 타입 정보
    @Input()
    public importType: PrDataset = new PrDataset();

    @ViewChild(PrepPopDataflowNameComponent)
    public prepPopDataflowNameComponent : PrepPopDataflowNameComponent;


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
        this.step = step;
        this.stepChange.emit( step );
    }

    /**
     * Create new kafka
     */
    public goToNext() {
        this.prepPopDataflowNameComponent.init();
    }

    // public goToDB() {
    //     const params = this._getDfParams();
    //     this.router.navigate(
    //         ['/management/prepbot/dataflow'])
    //         .then();
    // }

}