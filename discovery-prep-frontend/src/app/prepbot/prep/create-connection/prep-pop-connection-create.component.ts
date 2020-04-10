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
import {ConnectionParam} from "../../../data-storage/service/data-connection-create.service";
import {DataconnectionService} from '../../../dataconnection/service/dataconnection.service';
import {PrepPopConnectionInfoComponent} from "./prep-pop-connection-info.component";
import {PrepPopConnectionNameComponent} from "./prep-pop-connection-name.component";
import {Alert} from '../../../common/util/alert.util';

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

    @ViewChild(PrepPopConnectionNameComponent)
    public popConnectionNameComponent : PrepPopConnectionNameComponent;

    public connectionInfo = {};

    public connectionParam: ConnectionParam;

    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     | Constructor
     |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

    // 생성자
    constructor(private connectionService: DataconnectionService,
                protected elementRef: ElementRef,
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

    public stepChange(step : string) {
        this.connectionParam = null;

        if(step=='connection-name') {
            if (this.prepPopConnectionInfoComponent.isEmptyConnectionValidation()) {
                this.prepPopConnectionInfoComponent.setRequireCheckConnection();
                return;
            }

            if (this.prepPopConnectionInfoComponent.isEnableConnection()) {
                this.connectionParam = this._getCreateConnectionParams();
                this.step = step;
                // console.info('this.connectionParam', this.connectionParam);
            }
        }else{
            this.step = step;
        }
    }

    /**
     * Get create connection params
     * @return {{implementor: ImplementorType}}
     * @private
     */
    public _getCreateConnectionParams() {
        let result = this.prepPopConnectionInfoComponent.getConnectionParams(true);
        result['type'] = 'JDBC';
        // result['name'] = this.connectionName.trim();
        result['published'] = true;

        return result;
    }



    public connectionInfoChange(connectionInfo) {
        this.connectionInfo = connectionInfo;
    }
    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     | Public Method
     |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/



    // 닫기
    public createClose() {
        this.connectionParam = null;
        this.closeEvent.emit('complete-connection-create');
    }

    // 완료
    public createCompleteEvent() {
        // this.createComplete.emit();
        const connectionInfo= this.popConnectionNameComponent.getConnectionInfo();
        this.connectionParam['name'] = connectionInfo.dcName;
        this.connectionParam['description'] = connectionInfo.dcDesc;


        // loading show
        this.loadingShow();
        // create connection
        this.connectionService.createConnection(this.connectionParam)
            .then((result) => {
                // alert
                this.prepNotiShow('Dataconnection saving complete', this.connectionParam['name']+'<br/>저장되었습니다.');
                // Alert.success(this.connectionParam['name'] + this.translateService.instant('msg.storage.alert.dconn.create.success'));
                // loading hide
                this.loadingHide();
                // close
                this.createComplete.emit();
            })
            .catch(error => this.commonExceptionHandler(error));

    }





    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    | Protected Method
    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     | Private Method
     |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
}