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

import {AbstractPopupComponent} from '../../../common/component/abstract-popup.component';
import {Component, ElementRef, Injector, Input, Output, EventEmitter, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {
FileFormat, PrDatasetHive, PrDatasetJdbc,
RsType
} from '../../../domain/data-preparation/pr-dataset';
import {PopupService} from '../../../common/service/popup.service';
import { DatasetService } from '../service/dataset.service';
import { DataflowService } from '../service/dataflow.service';
import { PrConnectionService } from '../service/connection.service';
import {isNullOrUndefined, isUndefined} from 'util';
import {StringUtil} from '../../../common/util/string.util';
import {Alert} from '../../../common/util/alert.util';
import * as _ from 'lodash';
import { concatMap } from 'rxjs/operators';
import { from} from "rxjs/observable/from";
import {PrDataflow} from "../../../domain/data-preparation/pr-dataflow";
import {PreparationCommonUtil} from "../../util/preparation-common.util";

declare let moment;

@Component({
  selector: 'prep-pop-connection-name',
  templateUrl: './prep-pop-connection-name.component.html',
  providers: [DatasetService]
})
export class PrepPopConnectionNameComponent extends AbstractPopupComponent implements OnInit, OnDestroy  {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

    @Input()
    public step: string = '';
    @Output()
    public stepChange : EventEmitter<string> = new EventEmitter();

  @Input()
  public isFromDatasetList: boolean = true;

@Input()
    public connectionInfo: any;
 @Output()
    public connectionInfoChange : EventEmitter<any> = new EventEmitter();
 @Output()
    public createClose : EventEmitter<void> = new EventEmitter();

    @Output()
    public createComplete: EventEmitter<void> = new EventEmitter();

  public isShow = false;
   // name error msg show/hide
    public showNameError: boolean = false;

    // desc error msg show/hide
    public showDescError: boolean = false;

  public prepCommonUtil = PreparationCommonUtil;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor(private popupService: PopupService,
                private connectionService: PrConnectionService,
               protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public ngOnInit() {
    super.ngOnInit();

    this.init();

  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

    public init() {
        this.isShow = true;
    }


    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    | Public Method
    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /** Complete */
  public complete() {
        this.loadingShow();

        this.connectionService.createConnection(this.connectionInfo).then((result) => {

        this.loadingHide();
      console.log(result);
              this.createComplete.emit();
      }).catch(() => {
        this.loadingHide();
      });

  }

  /** go to previous step */
  public prev() {
      this.goto('complete-connection-create');
  }


  /**
   * close popup
   * */
  public close() {
    super.close();
    this.createClose.emit();
  }

    public onSetIntoConnection(target) {
        this.connectionInfo[target.name] = target.value;
    }

    public goto(step) {
        this.step = step;
        this.stepChange.emit( step );
    }

  /**
   * Check if next button is disabled or not
   */
  public isBtnDisabled() : boolean {
    return this.showNameError || this.showDescError;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
}


