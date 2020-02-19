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
import { PrDataset, ImportType } from '../../../domain/data-preparation/pr-dataset';
import {PrepPopTypeComponent} from "./prep-pop-type.component";
import {PrepPopDBCreateComponent} from "./prep-pop-db-create.component";
import {PrepPopFileUploadCreateComponent} from "./prep-pop-file-upload-create.component";
import {PrepPopFileSelectsheetComponent} from "./prep-pop-file-selectsheet.component";

@Component({
  selector: 'prep-pop-create',
  templateUrl: './prep-pop-create.component.html'
})
export class PrepPopCreateComponent  extends AbstractComponent implements OnInit, OnDestroy {

    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     | Private Variables
     |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     | Protected Variables
     |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     | Public Variables
     |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(PrepPopTypeComponent)
  public prepPopType : PrepPopTypeComponent;

  @ViewChild(PrepPopDBCreateComponent)
  public prepPopDbCreate : PrepPopDBCreateComponent;

  @ViewChild(PrepPopFileUploadCreateComponent)
  public prepPopFileUploadCreate : PrepPopFileUploadCreateComponent;

    @Output('sourceCreateClose')
    public closeEvent: EventEmitter<string> = new EventEmitter();

    @Output('sourceCreateComplete')
    public completeEvent: EventEmitter<PrDataset> = new EventEmitter();

   @Input()
    public step: string = '';

    // 새로 생성될 데이터소스 정보
    public importType: PrDataset = new PrDataset();

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
        this.step='';
    }

    public ngOnDestroy() {
        super.ngOnDestroy();
    }

    public stepChange(step) {
        this.step = step;
    }

    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     | Public Method
     |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     | Protected Method
     |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

    // 닫기
    public createClose() {
        this.closeEvent.emit('close-create');
    }

    // 완료
    public createComplete() {
        this.completeEvent.emit();
    }

    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     | Private Method
     |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
}