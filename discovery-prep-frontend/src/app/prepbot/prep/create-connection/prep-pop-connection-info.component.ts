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
import {StorageService} from "../../../data-storage/service/storage.service";

import {TranslateService} from "@ngx-translate/core";
import {AuthenticationType, Dataconnection, InputMandatory, JdbcDialect, Scope} from "../../../domain/dataconnection/dataconnection";
import {isNullOrUndefined} from "util";

export enum ConnectionValid {
    ENABLE_CONNECTION = 0,
    DISABLE_CONNECTION = 1,
    REQUIRE_CONNECTION_CHECK = 2
}

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



    @Input()
    public readonly isShowDialogGuide: boolean;
    @Input()
    public readonly isDisableChangeConnectionInfo: boolean;
    @Input()
    public readonly isDisableChangeConnectionType: boolean;

    public readonly connectionTypeList: JdbcDialect[] = StorageService.connectionTypeList;
    public selectedConnectionType: JdbcDialect;

    // enum
    public readonly AUTHENTICATION_TYPE = AuthenticationType;
    private _translateService: TranslateService;
    public authenticationTypeList: {label: string, value: AuthenticationType}[];
    public selectedAuthenticationType;


    // flag
    public connectionValidation: ConnectionValid;
    public isUsedUrl: boolean;
    // input error
    public isUrlError: boolean;
    public isHostnameError: boolean;
    public isPortError: boolean;
    public isDatabaseError: boolean;
    public isSidError: boolean;
    public isCatalogError: boolean;
    public isUsernameError: boolean;
    public isPasswordError: boolean;

    public hostname: string;
    public port: number;
    public url: string;
    public database: string;
    public sid: string;
    public catalog: string;
    public username: string;
    public password: string;
    public properties: {key: string, value: string, keyError?: boolean, valueError?: boolean, keyValidMessage?: string, valueValidMessage?: string}[];



    // 생성자
    constructor(protected elementRef: ElementRef,
                private popupService: PopupService,
                protected injector: Injector,
                private activatedRoute: ActivatedRoute) {

        super(elementRef, injector);
        this._translateService = injector.get(TranslateService);

        // set authentication type list
        this.authenticationTypeList = [
            { label: this._translateService.instant('msg.storage.li.connect.always'), value: AuthenticationType.MANUAL },
            { label: this._translateService.instant('msg.storage.li.connect.account'), value: AuthenticationType.USERINFO },
            { label: this._translateService.instant('msg.storage.li.connect.id'), value: AuthenticationType.DIALOG }
        ];
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
        this.selectedAuthenticationType = this.authenticationTypeList[0];
        // if (isNullOrUndefined(connection)) {
        //     this.properties = [];
        //     this.selectedAuthenticationType = this.authenticationTypeList[0];
        //     this.selectedConnectionType = this.connectionTypeList[0];
        // } else {
        //     this.setConnectionInput(connection);
        // }
        this.properties = [];
        this.selectedAuthenticationType = this.authenticationTypeList[0];
        this.selectedConnectionType = this.connectionTypeList[0];

        console.info('connectionTypeList', this.connectionTypeList);


    }

    public goto(step) {
        if(step==='connection-name') {
            this.connectionInfo['connectionType'] = this.connectionType;
            this.connectionInfoChange.emit(this.connectionInfo);
        }
        this.step = step;
        this.stepChange.emit( step );
    }

    /**
     * Change selected connection type
     * @param {JdbcDialect} connectionType
     *
     */
    // connectionType: JdbcDialect
    public onChangeConnectionType(connectionTypeName: String): void {
        let connectionType: JdbcDialect = null;

        for(let i: number =0; i< this.connectionTypeList.length; i ++) {
            if(this.connectionTypeList[i]['name']=== connectionTypeName) {
                connectionType = this.connectionTypeList[i];
                break;
            }
        }
        if(connectionType === null) return;
        if (!this.isDisableChangeConnectionType && connectionType.implementor !== this.selectedConnectionType.implementor) {
            this.selectedConnectionType = connectionType;
            // init input form
            this._connectionInputInitialize();
            // input error initial
            this.inputErrorInitialize();
            this.connectionValidInitialize();
        }
    }


    /**
     * Change use URL
     */
    public onChangeUseUrl(): void {
        // console.info('onChangeUseUrl', this.connectionType);
        if (!this.isDisableChangeConnectionInfo) {
            this.isUsedUrl = !this.isUsedUrl;
            // input error initial
            this.inputErrorInitialize();
            this.connectionValidInitialize();
        }
    }

    /**
     * Change selected authentication type
     * @param authenticationType
     */
    public onChangeAuthenticationType(authenticationType): void {
        if (!this.isDisableChangeConnectionInfo && this.selectedAuthenticationType.value !== authenticationType.value) {
            this.selectedAuthenticationType = authenticationType;
            // input error initial
            this.inputErrorInitialize();
            this.connectionValidInitialize();
        }
    }

    /**
     * Initial input error
     */
    public inputErrorInitialize(): void {
        this.isUrlError = undefined;
        this.isHostnameError = undefined;
        this.isPortError = undefined;
        this.isDatabaseError = undefined;
        this.isSidError = undefined;
        this.isCatalogError = undefined;
        this.isUsernameError = undefined;
        this.isPasswordError = undefined;
    }
    /**
     * Initial connection valid
     */
    public connectionValidInitialize(): void {
        this.connectionValidation = undefined;
    }
    /**
     * Is disable SID
     * @return {boolean}
     */
    public isDisableSid() {
        return this.selectedConnectionType.inputSpec.sid === InputMandatory.NONE;
    }

    /**
     * Is disable database
     * @return {boolean}
     */
    public isDisableDatabase() {
        return this.selectedConnectionType.inputSpec.database === InputMandatory.NONE;
    }

    /**
     * Is disable catalog
     * @return {boolean}
     */
    public isDisableCatalog() {
        return this.selectedConnectionType.inputSpec.catalog === InputMandatory.NONE;
    }

    /**
     * Initail connection input
     * @private
     */
    private _connectionInputInitialize(): void {
        this.selectedAuthenticationType = this.authenticationTypeList[0];
        this.hostname = undefined;
        this.port = undefined;
        this.url = undefined;
        this.database = undefined;
        this.sid = undefined;
        this.catalog = undefined;
        this.username = undefined;
        this.password = undefined;
        this.isUsedUrl = undefined;
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
