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

import {Component, ElementRef, HostListener, Injector, OnDestroy, OnInit, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {AbstractComponent} from '../../../common/component/abstract.component';
import {DataflowService} from '../service/dataflow.service';
import {DsType, ImportType, PrDatasetJdbc, QueryInfo, TableInfo,} from '../../../domain/data-preparation/pr-dataset';
import {Dataconnection} from "../../../domain/dataconnection/dataconnection";
import {DataconnectionService} from "../../../dataconnection/service/dataconnection.service";
import {ConnectionParam} from "../../../data-storage/service/data-connection-create.service";
import {AuthenticationType} from "../../../domain/dataconnection/dataconnection";
import {ActivatedRoute} from "@angular/router";
import {PopupService} from '../../../common/service/popup.service';
import {PageResult} from "../../../domain/common/page";
import {PrConnectionService} from '../service/connection.service';
import {ConnectionComponent, ConnectionValid} from "../../../data-storage/component/connection/connection.component";
import {isNullOrUndefined} from 'util';

@Component({
  selector: 'prep-pop-db-create',
  templateUrl: './prep-pop-db-create.component.html'
})
export class PrepPopDBCreateComponent extends AbstractComponent {

    @ViewChild(ConnectionComponent)
    private readonly _connectionComponent: ConnectionComponent;


    @Input()
    public step: string = '';
    @Output()
    public stepChange : EventEmitter<string> = new EventEmitter();

    @Output()
    public createClose : EventEmitter<void> = new EventEmitter();

    @Input()
    public datasetJdbc: PrDatasetJdbc;

    public connectionList : any = [];

    public selectedConnection: Dataconnection = null;



    // 생성자
    constructor(protected elementRef: ElementRef,
                private popupService: PopupService,
                private connectionService: PrConnectionService,
                private dataConnectionService: DataconnectionService,
                protected injector: Injector,
                private activatedRoute: ActivatedRoute) {

        super(elementRef, injector);
    }

    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     | Override Method
     |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

    public ngOnInit() {
        super.ngOnInit();
        // this.init();

        this.pageResult.number = 0;
        this.pageResult.size = 20;

        // 처음
        if (isNullOrUndefined(this.datasetJdbc.connectionList)) {
            this.datasetJdbc.dsType = DsType.IMPORTED;
            this.datasetJdbc.importType = ImportType.DATABASE;
            this._getConnections();
        } else {

            // 이미 커넥션 리스트가 있음
            this.connectionList = this.datasetJdbc.connectionList;
            // this._connectionComponent.init(this.datasetJdbc.dataconnection.connection);
            // this._connectionComponent.connectionValidation = ConnectionValid.ENABLE_CONNECTION;

            if(isNullOrUndefined(this.datasetJdbc.dcId) && this.connectionList.length > 0) {
                this.datasetJdbc.dcId = this.connectionList[0].id;
            }
            this.getConnectionDetail();
        }
    }

    public ngAfterViewInit() {
            // this._getConnections();
    }

    // Destory
    public ngOnDestroy() {
        super.ngOnDestroy();
    }

    public init() {
        // this.isShow = true;
    }
    public goto(step) {
      // this.step = step;
      this.stepChange.emit( step );
    }

    public next() {
        if(this.selectedConnection == null || isNullOrUndefined(this.selectedConnection)) return;
        this.checkConnection();
        // this.stepChange.emit( 'DB-QUERY' );
    }

    public close() {
        this.createClose.emit();
    }

    public goPre(){
        this.stepChange.emit( 'complete-create-dataset' );
    }



    // should be changed with ngIf
    public listShow :boolean = false;
    public toggleList() {
        this.listShow = !this.listShow;
    }


    /**
     * When a connection is selected from list
     * @param event
     */
    public onConnectionSelected(event) {
        // only fetch data when it's different
        if (this.datasetJdbc.dcId !== event.id) {
            this.datasetJdbc.dcId = event.id;
            this.getConnectionDetail();

            // refresh existing data
            this.datasetJdbc.sqlInfo = new QueryInfo();
            this.datasetJdbc.tableInfo = new TableInfo();
            this.datasetJdbc.rsType = undefined;
        }
        this.listShow = !this.listShow;
    }


    /**
     * Get connection detail information
     */
    public getConnectionDetail() {

        this.loadingShow();
        //  get connection data in preset
        this.connectionService.getDataconnectionDetail(this.datasetJdbc.dcId)
            .then((connection: Dataconnection) => {
                // loading hide
                this.loadingHide();
                this.selectConnection(connection);
            })
            .catch(error => this.commonExceptionHandler(error));
    }


    /**
     * Initialise _connection component
     * @param connection
     */
    public selectConnection(connection) {
        this.selectedConnection = connection;

    }


    /**
     * Fetch dataset connections
     */

    private _getConnectionPresetListParams(pageResult: PageResult): object {
        return {
            authenticationType:'MANUAL',
            size: pageResult.size,
            page: pageResult.number,
            type: 'jdbc'
        };
    }


    private _getConnections() {

        this.loadingShow();

        this.connectionService.getAllDataconnections(this._getConnectionPresetListParams(this.pageResult), 'forSimpleListView')
            .then((data) => {

                // 리스트가 있다면
                if (data.hasOwnProperty('_embedded')) {

                    // 리스트 추가
                    this.connectionList = this.connectionList.concat(data['_embedded'].connections);

                    if (this.connectionList.length !== 0 ) {

                        // 첫번째 커넥션 등록
                        this.datasetJdbc.dcId = this.connectionList[0].id;

                        this.getConnectionDetail();
                    } else {

                        this.loadingHide();
                        // 커넥션 리스트가 0개 라면
                        this.selectConnection(null);
                    }

                } else {
                    this.loadingHide();
                    // no connections
                    this.connectionList = [];
                    this.selectConnection(null)
                }

                this.pageResult = data['page'];

            })
            .catch((err) => {
                this.loadingHide();
                console.info('getConnections err)', err.toString());
            });
    }

    /**
     * Check valid connection
     */
    private checkConnection(): void {
        // init connection validation
        this.loadingShow();
        // check connection
        this.dataConnectionService.checkConnection({connection: this.getConnectionParams(this.selectedConnection)})
            .then((result: {connected: boolean}) => {
                // set connection validation result

                if(result.connected) {
                    this.datasetJdbc.dataconnection = this.getConnectionParams(this.selectedConnection);
                    this.datasetJdbc.connectionList = this.connectionList;
                    this.stepChange.emit( 'DB-QUERY');
                }else{

                }
            })
            .catch((error) => {
                this.loadingHide();
                console.info('getConnections err)', error.toString());
            });
    }

    /**
     * Get connection params
     * @return {ConnectionParam}
     */
    private getConnectionParams(connection: Dataconnection) {
        let connectionParam: ConnectionParam = {
            implementor: connection.implementor
        };
        connectionParam.username = connection.username;
        connectionParam.password = connection.password;


        // not use URL
        if (isNullOrUndefined(connection.url)) {
            // HOST
            connectionParam.hostname = connection.hostname;
            connectionParam.port = connection.port;
            if (!isNullOrUndefined(connection.sid)) {
                connectionParam.sid = connection.sid;
            } else if (!isNullOrUndefined(connection.database)) {
                connectionParam.database = connection.database;
            } else if (!isNullOrUndefined(connection.catalog)) {
                connectionParam.catalog = connection.catalog
            }
        } else {  // use URL
            connectionParam.url = connection.url;
        }
        // check enable authentication
        if (!isNullOrUndefined(connection.authenticationType)) {
            connectionParam.authenticationType = connection.authenticationType;
            // check username
            // if (!this.isDisableUsername() && this.selectedAuthenticationType.value !== AuthenticationType.USERINFO) {
            //     connectionParam.username = this.username;
            // }
            // // check password
            // if (!this.isDisablePassword() && this.selectedAuthenticationType.value !== AuthenticationType.USERINFO) {
            //     connectionParam.password = this.password;
            // }
        } else { // if disable authentication, set default type
            connectionParam.authenticationType = AuthenticationType.MANUAL;
        }

        return connectionParam;
    }
}