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
// import {PrepPopConnectionNameComponent} from "./prep-pop-connection-name.component";
import {PopupService} from "../../../common/service/popup.service";
import {StorageService} from "../../../data-storage/service/storage.service";
import {DataconnectionService} from "../../../dataconnection/service/dataconnection.service";
import {ConnectionParam} from "../../../data-storage/service/data-connection-create.service";


import {TranslateService} from "@ngx-translate/core";
import {AuthenticationType, InputMandatory, JdbcDialect, Dataconnection} from "../../../domain/dataconnection/dataconnection";
import {StringUtil} from "../../../common/util/string.util";
import {isNullOrUndefined} from "util";
import * as _ from 'lodash';

export enum ConnectionValid {
    ENABLE_CONNECTION = 0,
    DISABLE_CONNECTION = 1,
    REQUIRE_CONNECTION_CHECK = 2
}

@Component({
    selector: 'prep-pop-connection-update',
    templateUrl: './prep-pop-connection-update.component.html'
})
export class PrepPopConnectionUpdateComponent extends AbstractComponent {

    @Output()
    public closeEvent : EventEmitter<void> = new EventEmitter();
    @Output()
    public createComplete: EventEmitter<void> = new EventEmitter();

    public connectionType = '';



    // @Input()
    // public readonly isShowDialogGuide: boolean;
    @Input()
    public readonly isDisableChangeConnectionInfo: boolean;
    @Input()
    public readonly isDisableChangeConnectionType: boolean;
    @Output()
    public readonly createdName: EventEmitter<string> = new EventEmitter();

    @Input()
    public readonly isUsedNameInitial: boolean;

    public connectionName: string;
    public connectionDescription: string;


    @Input()
    public readonly connectionId: string;


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


    private originConnectionData: Dataconnection = null;
    // name error msg show/hide
    public showNameError: boolean = false;



    // 생성자
    constructor(protected elementRef: ElementRef,
                private connectionService: DataconnectionService,
                protected injector: Injector) {

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
        this.selectedAuthenticationType = this.authenticationTypeList[0];
        this.properties = [];
        this.selectedAuthenticationType = this.authenticationTypeList[0];
        this.selectedConnectionType = this.connectionTypeList[0];
        //console.info('connectionId', this.connectionId);


        this.connectionService.getDataconnectionDetail(this.connectionId)
            .then((result: Dataconnection) => {
                // console.info("result", result);
                // // loading hide
                this.loadingHide();
                // set origin connection data
                this.originConnectionData = result;
                // this.published = result.published;
                // this.linkedWorkspaces = result.linkedWorkspaces;
                this.connectionName = result.name;
                this.connectionDescription = result.description;
                this.setConnectionInput(result);
            })
            .catch(error => this.commonExceptionHandler(error));

    }

    /**
     * Set connection input
     * @param {Dataconnection} connection
     */
    public setConnectionInput(connection: Dataconnection | ConnectionParam): void {
        this.hostname = StringUtil.isNotEmpty(connection.hostname) ?connection.hostname : undefined;
        this.port = connection.port || undefined;
        this.catalog = StringUtil.isNotEmpty(connection.catalog) ?connection.catalog : undefined;
        this.database = StringUtil.isNotEmpty(connection.database) ?connection.database : undefined;
        this.sid = StringUtil.isNotEmpty(connection.sid) ?connection.sid : undefined;
        this.url = StringUtil.isNotEmpty(connection.url) ?connection.url : undefined;
        this.username = StringUtil.isNotEmpty(connection.username) ? connection.username : undefined;
        this.password = StringUtil.isNotEmpty(connection.password) ? connection.password : undefined;
        // this.selectedAuthenticationType = this.authenticationTypeList.find(authenticationType => authenticationType.value === connection.authenticationType) || this.authenticationTypeList[0];
        this.selectedConnectionType = connection.implementor ? this.connectionTypeList.find(type => type.implementor.toString() === connection.implementor.toString()) : this.connectionTypeList[0];
        // this.properties = connection.properties ? this.getConvertedProperties(connection.properties) : [];
        this.isUsedUrl = StringUtil.isNotEmpty(connection.url);
    }



    /**
     * Change selected connection type
     * @param {JdbcDialect} connectionType
     *
     */
    // connectionType: JdbcDialect
    public onChangeConnectionType(connectionTypeName: string): void {
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
     * Check valid connection
     */
    public checkConnection(): void {
        // init connection validation
        this.connectionValidation = undefined;
        // check valid connection input
        if (this.isValidConnectionInput()) {
            // loading show
            this.loadingShow();
            // check connection
            this.connectionService.checkConnection({connection: this.getConnectionParams()})
                .then((result: {connected: boolean}) => {
                    // set connection validation result
                    this.connectionValidation = result.connected ? ConnectionValid.ENABLE_CONNECTION : ConnectionValid.DISABLE_CONNECTION;
                    // scroll into connection invalid input
                    this.scrollIntoConnectionInvalidInput();
                    // loading hide
                    this.loadingHide();
                    // if used name initial
                    if (this.isUsedNameInitial && !this.connectionName) {
                        this.createdName.emit(this.isUsedUrl ? `${this.selectedConnectionType.name}-${this.url}` : `${this.selectedConnectionType.name}-${this.hostname}-${this.port}`);
                    }
                })
                .catch((error) => {
                    // set connection result fail
                    this.connectionValidation = ConnectionValid.DISABLE_CONNECTION;
                    // scroll into connection invalid input
                    this.scrollIntoConnectionInvalidInput();
                    // loading hide
                    this.commonExceptionHandler(error);
                });
        } else {
            // scroll into connection invalid input
            this.scrollIntoConnectionInvalidInput();
        }
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
     * Is disable authentication type
     * @return {boolean}
     */
    public isDisableAuthenticationType() {
        return this.selectedConnectionType.inputSpec.authenticationType === InputMandatory.NONE;
    }

    /**
     * Is disable username
     * @return {boolean}
     */
    public isDisableUsername() {
        return this.selectedConnectionType.inputSpec.username === InputMandatory.NONE;
    }
    /**
     * Is disable password
     * @return {boolean}
     */
    public isDisablePassword() {
        return this.selectedConnectionType.inputSpec.password === InputMandatory.NONE;
    }


    /**
     * Is valid connection input
     * @return {boolean}
     */
    public isValidConnectionInput(): boolean {
        let result: boolean = true;
        // not use URL
        if (!this.isUsedUrl) {
            // check HOST
            if (StringUtil.isEmpty(this.hostname)) {
                this.isHostnameError = true;
                result = false;
            }
            // check PORT
            if (!this.port) {
                this.isPortError = true;
                result = false;
            }
            // check SID
            if (!this.isDisableSid() && StringUtil.isEmpty(this.sid)) {
                this.isSidError = true;
                result = false;
            } else if (!this.isDisableDatabase() && StringUtil.isEmpty(this.database)) {
                this.isDatabaseError = true;
                result = false;
            } else if (!this.isDisableCatalog() && StringUtil.isEmpty(this.catalog)) {
                this.isCatalogError = true;
                result = false;
            }
        } else if (StringUtil.isEmpty(this.url)) {  // check URL
            this.isUrlError = true;
            result = false;
        }
        // check enable authentication
        if (!this.isDisableAuthenticationType()) {
            // check username
            if (!this.isDisableUsername() && this.selectedAuthenticationType.value !== AuthenticationType.USERINFO && StringUtil.isEmpty(this.username)) {
                this.isUsernameError = true;
                result = false;
            }
            // check password
            if (!this.isDisablePassword() && this.selectedAuthenticationType.value !== AuthenticationType.USERINFO && StringUtil.isEmpty(this.password)) {
                this.isPasswordError = true;
                result = false;
            }
        }
        return result;
    }

    /**
     * Is exist properties
     * @return {boolean}
     */
    public isExistProperties(): boolean {
        return this.properties && this.properties.length > 0;
    }

    /**
     * Is valid properties
     * @return {boolean}
     */
    public isValidProperties(): boolean {
        return this.properties.reduce((acc, property) => {
            // check key empty
            if (StringUtil.isEmpty(property.key)) {
                // set empty message
                property.keyValidMessage = this.translateService.instant('msg.storage.ui.required');
                // set error flag
                property.keyError = true;
                // set valid false
                acc = false;
                return acc;
            }
            // check key special characters, and korean (enable .dot)
            else if (property.key.trim().match(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣|\{\}\[\]\/?,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi)) {
                // set duplicate message
                property.keyValidMessage = this.translateService.instant('msg.storage.ui.custom.property.special.char.disable');
                // set error flag
                property.keyError = true;
                // set valid false
                acc = false;
                return acc;
            }
            // check key duplicate
            else if (this.properties.filter(item => item.key.trim() === property.key.trim()).length > 1) {
                // set duplicate message
                property.keyValidMessage = this.translateService.instant('msg.storage.ui.custom.property.duplicated');
                // set error flag
                property.keyError = true;
                // set valid false
                acc = false;
                return acc;
            } else {
                return acc;
            }
        }, true);
    }

    /**
     * Is show username and password input
     */
    public isShowUsernameAndPasswordInput(): boolean {
        return this.selectedAuthenticationType.value !== this.AUTHENTICATION_TYPE.USERINFO;
    }

    /**
     * Get properties (key-value object)
     * @return {{}}
     */
    public getProperties() {
        // return this.properties.reduce((acc, property) => {
        //     acc[property.key.trim()] = _.isNil(property.value) ? '' : property.value.trim();
        //     return acc;
        // }, {});
    }

    /**
     * Get converted properties
     * @param properties
     * @return {any[]}
     */
    public getConvertedProperties(properties) {
        return Object.keys(properties).reduce((acc, key) => {
            acc.push({key: key, value: properties[key], keyError: false, valueError: false});
            return acc;
        }, []);
    }

    /**
     * Get connection params
     * @return {ConnectionParam}
     */
    public getConnectionParams(isIncludeProperties?: boolean) {
        let connectionParam: ConnectionParam = {
            implementor: this.selectedConnectionType.implementor
        };
        // not use URL
        if (!this.isUsedUrl) {
            // HOST
            connectionParam.hostname = this.hostname;
            connectionParam.port = this.port;
            if (!this.isDisableSid()) {
                connectionParam.sid = this.sid;
            } else if (!this.isDisableDatabase()) {
                connectionParam.database = this.database;
            } else if (!this.isDisableCatalog()) {
                connectionParam.catalog = this.catalog
            }
        } else {  // use URL
            connectionParam.url = this.url;
        }
        // check enable authentication
        if (!this.isDisableAuthenticationType()) {
            connectionParam.authenticationType = this.selectedAuthenticationType.value;
            // check username
            if (!this.isDisableUsername() && this.selectedAuthenticationType.value !== AuthenticationType.USERINFO) {
                connectionParam.username = this.username;
            }
            // check password
            if (!this.isDisablePassword() && this.selectedAuthenticationType.value !== AuthenticationType.USERINFO) {
                connectionParam.password = this.password;
            }
        } else { // if disable authentication, set default type
            connectionParam.authenticationType = this.authenticationTypeList[0].value;
        }
        // Properties 미사용으로 주석 처리
        // if is exist properties and include properties
        // if (isIncludeProperties && this.isExistProperties()) {
        //     connectionParam.properties = this.getProperties();
        // }
        return connectionParam;
    }

    /**
     * Scroll into connection invalid input
     */
    public scrollIntoConnectionInvalidInput(): void {
        // if invalid HOST or PORT or URL
        // if (this.isUrlError || this.isHostnameError || this.isPortError || (this.isCatalogError || this.isDatabaseError || this.isSidError)) {
        //     this.HOST_PORT_ELEMENT.nativeElement.scrollIntoView();
        // }
        // // if invalid username or password
        // else if (this.isShowUsernameAndPasswordInput() && (this.isUsernameError || this.isPasswordError)) {
        //     this.USERNAME_PASS_ELEMENT.nativeElement.scrollIntoView();
        // } else if (this.isRequireCheckConnection() || this.isDisableConnection()) {  // if require check connection
        //     this.CHECK_ELEMENT.nativeElement.scrollIntoView();
        // }
    }

    /**
     * Scroll into preperties
     */
    public scrollIntoPropertyInvalidInput(): void {
        // if (!this.isDisableProperties) {
        //     // if close advanced settings
        //     if (!this.isShowAdvancedSettings) {
        //         // open
        //         this.isShowAdvancedSettings = true;
        //         this.safelyDetectChanges();
        //     }
        //     // scroll into invalid property
        //     this.PROPERTIES_ELEMENT.nativeElement.scrollIntoView();
        // }
    }
    /**
     * Is enable connection
     * @return {boolean}
     */
    public isEnableConnection(): boolean {
        return this.connectionValidation === ConnectionValid.ENABLE_CONNECTION;
    }

    /**
     * Is disable connection
     * @return {boolean}
     */
    public isDisableConnection(): boolean {
        return this.connectionValidation === ConnectionValid.DISABLE_CONNECTION;
    }

    /**
     * Is require check connection
     * @return {boolean}
     */
    public isRequireCheckConnection(): boolean {
        return this.connectionValidation === ConnectionValid.REQUIRE_CONNECTION_CHECK;
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
        this.showNameError = undefined;
    }


    /**
     * Is empty connection validation
     * @return {boolean}
     */
    public isEmptyConnectionValidation(): boolean {
        return _.isNil(this.connectionValidation);
    }

    /**
     * Set require check connection
     */
    public setRequireCheckConnection(): void {
        this.connectionValidation = ConnectionValid.REQUIRE_CONNECTION_CHECK;
    }


    public next() {
        if (this.isEmptyConnectionValidation()) {
            this.setRequireCheckConnection();
            return;
        }

        if (this.isEnableConnection()) {
            const name : string = this.connectionName;
            if(name==null || name.replace(/ /g,'') =='') {
                this.showNameError = true;
                return;
            }
            const param: any = this._getUpdateParams();
            this._updateConnection(param);
        }else{
            return;
        }
    }






    public close() {
        this.closeEvent.emit();
    }

    public selectType(type: string) {
        this.connectionType = type;
    }
    

    /**
     * Get update params in PATCH method
     * @returns {Object}
     * @private
     */
    private _updateConnection(params: any): void {
        // loading show
        this.loadingShow();
        // update connection
        this.connectionService.updateConnection(this.connectionId, params)
            .then((result) => {
                this.loadingHide();
                this.createComplete.emit();
            })
            .catch(error => this.commonExceptionHandler(error));
    }



    /**
     * Get update params in PATCH method
     * @returns {Object}
     * @private
     */
    private _getUpdateParams(): object {
        // only the changed, update
        const params: any = {};
        // if different connection name
        if (this.connectionName.trim() !== this.originConnectionData.name) {
            params.name = this.connectionName.trim();
        }
        if (this.connectionDescription.trim() !== this.originConnectionData.description) {
            params.description = this.connectionDescription.trim();
        }

        // not use URL
        if (!this.isUsedUrl) {
            // 입력한 host가 다른경우
            if (this.hostname.trim() !== this.originConnectionData.hostname) {
                params.hostname = this.hostname.trim();
            }
            // 입력한 port가 다른경우
            if (this.port !== this.originConnectionData.port) {
                params.port = this.port;
            }
            // 기존에 URL이 있었다면
            if (StringUtil.isNotEmpty(this.originConnectionData.url)) {
                params.url = '';
            }
            // if enable database and different database
            if (!this.isDisableDatabase() && this.database.trim() !== this.originConnectionData.database) {
                params.database = this.database.trim();
            }
            // if enable SID and different SID
            if (!this.isDisableSid() && this.sid.trim() !== this.originConnectionData.sid) {
                params.sid = this.sid.trim();
            }
            // if enable catalog and different catalog
            if (!this.isDisableCatalog() && this.catalog.trim() !== this.originConnectionData.catalog) {
                params.catalog = this.catalog.trim();
            }
            // if enable URL and different URL
        } else if (this.url.trim() !== this.originConnectionData.url) {
            params.url = this.url.trim();
            // if exist hostname or port in origin connection data
            if (this.originConnectionData.hostname || this.originConnectionData.port) {
                params.hostname = '';
                params.port = '';
            }
        }
        // if enable authentication type
        if (!this.isDisableAuthenticationType()) {
            // if security type is MANUAL
            if (this.selectedAuthenticationType.value === AuthenticationType.MANUAL) {
                // if password different
                if (this.password.trim() !== this.originConnectionData.password) {
                    params.password = this.password.trim();
                }
                // if username different
                if (this.username.trim() !== this.originConnectionData.username) {
                    params.username = this.username.trim();
                }
            }
            // if changed security type
            // if (this.originConnectionData.authenticationType !== this._connectionComponent.selectedAuthenticationType.value) {
            //     params.authenticationType = this._connectionComponent.selectedAuthenticationType.value;
            //     // if origin security type is MANUAL, delete username and password
            //     if (this.originConnectionData.authenticationType === AuthenticationType.MANUAL) {
            //         params.username = '';
            //         params.password = '';
            //     }
            // }
        }
        // if changed property
        // if (this._isChangedProperties()) {
        //     params.properties = this._connectionComponent.getProperties();
        // }
        return params;
    }
}
