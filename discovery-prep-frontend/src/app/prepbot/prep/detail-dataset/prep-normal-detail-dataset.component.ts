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
import {Location} from "@angular/common";

@Component({
    selector: 'prep-normal-detail-dataset',
    templateUrl: './prep-normal-detail-dataset.component.html'
})


export class PrepNormalDetailDatasetComponent extends AbstractComponent {
    private dsId: string;

    // 생성자
    constructor(protected elementRef: ElementRef,
                private activatedRoute: ActivatedRoute,
                private _location: Location,
                protected injector: Injector) {

        super(elementRef, injector);
    }

    public ngOnInit() {
        this.activatedRoute.params.subscribe((params) => {
            this.dsId = params['dsId'];
        });


        super.ngOnInit();
        this.init();
    }

    // Destory
    public ngOnDestroy() {
        super.ngOnDestroy();
    }
    public init() {
        // console.info(this.dsId);
    }


    public onClickPrev(): void {
        this._location.back();
    }


}