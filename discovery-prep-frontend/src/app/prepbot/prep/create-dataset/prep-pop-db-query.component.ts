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
import {DsType, ImportType, PrDatasetJdbc, QueryInfo, TableInfo, RsType, Field} from '../../../domain/data-preparation/pr-dataset';
import {DataconnectionService} from '../../../dataconnection/service/dataconnection.service';
import {ConnectionParam} from "../../../data-storage/service/data-connection-create.service";
import {Dataconnection} from "../../../domain/dataconnection/dataconnection";
import {ActivatedRoute} from "@angular/router";
import {PopupService} from '../../../common/service/popup.service';
import {PageResult} from "../../../domain/common/page";
import {PrConnectionService} from '../service/connection.service';
import {header, SlickGridHeader} from '../../../common/component/grid/grid.header';
import {GridOption} from '../../../common/component/grid/grid.option';
import {ConnectionComponent, ConnectionValid} from "../../../data-storage/component/connection/connection.component";
import {AuthenticationType} from "../../../domain/dataconnection/dataconnection";
import {GridComponent} from '../../../common/component/grid/grid.component';
import {isNullOrUndefined} from 'util';
import * as _ from 'lodash';

@Component({
    selector: 'prep-pop-db-query',
    templateUrl: './prep-pop-db-query.component.html'
})
export class PrepPopDBQueryComponent extends AbstractComponent {

    @ViewChild(GridComponent)
    private gridComponent: GridComponent;

    @Input()
    public datasetJdbc: PrDatasetJdbc;

    @Output()
    public stepChange : EventEmitter<string> = new EventEmitter();

    @Output()
    public createClose : EventEmitter<void> = new EventEmitter();

    public clickable: boolean = false;            // is next btn clickable

    public flag: boolean = false;

    public clearGrid : boolean = false;

    public isTableEmpty: boolean = false;

    public rsType = RsType;

    public connectionList : any = [];
    public selectedConnection: Dataconnection = null;
    public listShow :boolean = false;


    public databaseList: any[] = [];
    public isDatabaseListShow: boolean = false;

    public schemaList: any[] = [];
    public isSchemaListShow: boolean = false;

    get filteredDbList() {
        let databaseList = this.databaseList;

        // const isDbSearchTextEmpty = StringUtil.isNotEmpty(this.dbSearchText);
        //
        // // 검색어가 있다면
        // if (isDbSearchTextEmpty) {
        //     databaseList = databaseList.filter((item) => {
        //         return item.name.toLowerCase().indexOf(this.dbSearchText.toLowerCase()) > -1;
        //     });
        // }
        return databaseList;

    }



    // 생성자
    constructor(protected elementRef: ElementRef,
                private connectionService: PrConnectionService,
                private dataConnectionService: DataconnectionService,
                protected injector: Injector) {

        super(elementRef, injector);
    }

    public ngOnInit() {
        super.ngOnInit();

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
            if(isNullOrUndefined(this.datasetJdbc.dcId) && this.connectionList.length > 0) {
                this.datasetJdbc.dcId = this.connectionList[0].id;
            }
            this.getConnectionDetail();
        }

        this.datasetJdbc.sqlInfo = new QueryInfo();
        this.datasetJdbc.tableInfo = new TableInfo();

        // this._setDefaultValues();

    }
    public ngAfterViewInit() {

    }

    // Destory
    public ngOnDestroy() {
        super.ngOnDestroy();
    }

    public init() {
        // this.isShow = true;
    }

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

    public toggleList() {
        if(this.connectionList == null || this.connectionList.length==0){
            return;
        }
        this.listShow = !this.listShow;
    }

    public toggleDatabaseList(): void {
        if(this.databaseList == null || this.databaseList.length ==0) {
            this.isDatabaseListShow = false;
            return;
        }

        this.isDatabaseListShow = !this.isDatabaseListShow;
    }

    public toggleTableList(): void {
        if(this.schemaList == null || this.schemaList.length ==0) {
            this.isSchemaListShow = false;
            return;
        }
        this.isSchemaListShow = !this.isSchemaListShow;
    }



    public close() {
        this.createClose.emit();
    }

    public goPre(){
        // this.stepChange.emit( 'DB' );
        this.stepChange.emit( 'complete-create-dataset' );
    }

    public next() {
        if (!this.clickable) {
            return;
        }
        this.gridComponent.destroy();
        this.clearGrid = true;
        this.clickable = false;

        this.stepChange.emit( 'create-dataset-name' );


        // console.info('next','nextClick');

    }



    /**
     * Table Tab : open/close database select box
     * @param event
     */
    public showDatabaseList(event?) {

        event ? event.stopImmediatePropagation() : null;
        //
        // // Reset search text
        // this.dbSearchText = '';
        //
        // // Open select box and focus on input
        // setTimeout(() => {
        //     this.isDatabaseListShow = true;
        //     $('#table-db-input').trigger('focus');
        // });

        // this.isSchemaListShow = false;

    } // function - showDatabaseList



    /**
     * Change selected database
     * @param event
     * @param database
     */
    public selectDatabase(database) {
        this.isDatabaseListShow = false;
        this.datasetJdbc.tableInfo.databaseName = database.name;
        this.datasetJdbc.tableInfo.tableName = undefined;
        this._deleteGridInfo(this.datasetJdbc.rsType);
        this.getTables(database.name);
        this.initSelectedCommand(this.filteredDbList);

    } // function - onChangeDatabase



    /**
     * change selected table
     * @param event
     * @param data
     */
    public onChangeTable(event, data:any) {
        this.isSchemaListShow = false;
        event.stopPropagation();

        this.loadingShow();

        // Save table name -
        this.datasetJdbc.tableInfo.tableName = data.name;

        let params = {
            connection : this.datasetJdbc.dataconnection.connection,
            database : this.datasetJdbc.tableInfo.databaseName,
            query : this.datasetJdbc.tableInfo.tableName,
            type : RsType.TABLE
        };

        this.connectionService.getTableDetailWitoutId(params, false).then((result) => {

            this.loadingHide();
            if (result.fields.length > 0 ) {

                const headers: header[] = this._getHeaders(result.fields);
                const rows: any[] = this._getRows(result.data);

                // Save grid info -
                this.datasetJdbc.tableInfo.headers = headers;
                this.datasetJdbc.tableInfo.rows = rows;

                this.clearGrid = false;
                this._drawGrid(headers, rows);
                this.clickable = true;

            } else {
                this.gridComponent.destroy();
                this._deleteGridInfo(this.datasetJdbc.rsType);
            }

        })
            .catch((error) => {
                this.loadingHide();
                let prep_error = this.dataprepExceptionHandler(error);
                // PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
            });
        // this.initSelectedCommand(this.filteredSchemaList);
    } // function - onChangeTable



    /**
     * Initialise _connection component
     * @param connection
     */
    private selectConnection(connection) {

        this.databaseList = [];
        this.schemaList = [];

        this.selectedConnection = connection;
        this.datasetJdbc.sqlInfo = new QueryInfo();
        this.datasetJdbc.tableInfo = new TableInfo();
        if(this.selectedConnection == null || isNullOrUndefined(this.selectedConnection)) return;
        this.checkConnection();
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
                    // this.stepChange.emit( 'DB-QUERY');

                    this.datasetJdbc.sqlInfo = new QueryInfo();
                    this.datasetJdbc.tableInfo = new TableInfo();

                    this.getDatabases();
                    this._setDefaultValues();
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
        } else { // if disable authentication, set default type
            connectionParam.authenticationType = AuthenticationType.MANUAL;
        }

        return connectionParam;
    }



    /**
     * Get database list
     */
    private getDatabases() {
        this.loadingShow();

        if (!this.datasetJdbc.dataconnection.connection) {
            const connectionInfo = _.clone(this.datasetJdbc.dataconnection);
            this.datasetJdbc.dataconnection = {connection : {
                hostname: connectionInfo.hostname,
                implementor: connectionInfo.implementor,
                password: connectionInfo.password,
                port: connectionInfo.port,
                url: connectionInfo.url,
                username: connectionInfo.username,
                authenticationType: connectionInfo.authenticationType
            }
            };

            if (this.datasetJdbc.dataconnection.connection.implementor === 'POSTGRESQL' && !connectionInfo.url) {
                this.datasetJdbc.dataconnection.connection.database = connectionInfo.database;
            }

            if (this.datasetJdbc.dataconnection.connection.implementor === 'PRESTO' && !connectionInfo.url) {
                this.datasetJdbc.dataconnection.connection.catalog = connectionInfo.catalog;
            }

            if ( (this.datasetJdbc.dataconnection.connection.implementor === 'TIBERO' || this.datasetJdbc.dataconnection.connection.implementor === 'ORACLE')
                && !connectionInfo.url) {

                this.datasetJdbc.dataconnection.connection.sid = connectionInfo.sid;
            }

        }


        this.loadingShow();
        this.connectionService.getDatabasesWithoutId(this.datasetJdbc.dataconnection)
            .then((data) => {
                this.loadingHide();

                this.databaseList = [];

                if (data && data.databases) {
                    data.databases.forEach((item, index) => {
                        this.databaseList.push({idx : index, name : item, selected : false})
                    })
                }

                // TABLE && GRID INFO
                if (this.datasetJdbc.rsType === RsType.TABLE && this.datasetJdbc.tableInfo.headers && this.datasetJdbc.tableInfo.headers.length > 0) {
                    this.clearGrid = false;
                    this.getTables(this.datasetJdbc.tableInfo.databaseName);
                    this._drawGrid(this.datasetJdbc.tableInfo.headers,this.datasetJdbc.tableInfo.rows);

                    // QUERY AND GRID INFO
                } else if (this.datasetJdbc.rsType === RsType.QUERY && this.datasetJdbc.sqlInfo.databaseName && this.datasetJdbc.sqlInfo.queryStmt !== '') {

                    // STILL NEED TO GET TABLE INFO
                    if (this.datasetJdbc.tableInfo && this.datasetJdbc.tableInfo.databaseName) {
                        this.getTables(this.datasetJdbc.tableInfo.databaseName);
                    }

                    // GRID INFO O
                    if (this.datasetJdbc.sqlInfo.headers.length > 0) {
                        this.clearGrid = false;
                        this._drawGrid(this.datasetJdbc.sqlInfo.headers,this.datasetJdbc.sqlInfo.rows);
                    } else {

                        // GRID INFO X
                        this.clickable = true;
                        this.clearGrid = true;
                    }

                } else {  // Neither
                    this.showDatabaseList();
                }

            }).catch((error) => {
            this.loadingHide();
            let prep_error = this.dataprepExceptionHandler(error);
            // PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
        });


    } // function - getDatabases






    /** change list selected -> false (초기화) */
    public initSelectedCommand(list) {
        list.forEach((item) => {
            return item.selected = false;
        })
    } // function - initSelectedCommand



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
     * Set default values
     * @private
     */
    private _setDefaultValues() {

        // Imported and DB type is default value
        this.datasetJdbc.dsType = DsType.IMPORTED;
        this.datasetJdbc.importType = ImportType.DATABASE;


        // When no tab is selected -> default is TABLE
        if (isNullOrUndefined(this.datasetJdbc.rsType)) {
            this.datasetJdbc.rsType = RsType.TABLE;
        }

        // Check if validity is already checked
        if (this.datasetJdbc.sqlInfo && this.datasetJdbc.sqlInfo.valid) {
            // this.isQuerySuccess = true;
            // this.showQueryStatus = true;
            this.clickable = true;
            this.clearGrid = false;
        }
    }


    /**
     * Get table list
     * @param {string} database
     */
    private getTables(database:string) {
        this.loadingShow();

        const param = {
            connection : this.datasetJdbc.dataconnection.connection,
            database : database
        };

        this.connectionService.getTablesWitoutId(param).then((data) => {
            this.loadingHide();

            this.schemaList = [];
            if (data && data.tables.length > 0) {
                data.tables.forEach((item, index) => {
                    this.schemaList.push({idx : index, name : item, selected : false});
                });
                this.isTableEmpty = false;

            } else {
                this.schemaList = [];
                this.datasetJdbc.tableInfo.tableName = undefined;
                this.isTableEmpty = true;
                setTimeout(() => this.isSchemaListShow = true );
                if (this.gridComponent) {
                    this.gridComponent.destroy();
                }
            }

        }).catch((error) => {
            this.schemaList = [];
            this.isTableEmpty = true;
            this.loadingHide();
            let prep_error = this.dataprepExceptionHandler(error);
            // PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
        });

    } // function - getTables



    /**
     * Returns headers for grid
     * @param headers
     * @returns {header[]}
     * @private
     */
    private _getHeaders(headers) : header[] {
        return headers.map(
            (field: Field) => {
                return new SlickGridHeader()
                    .Id(field.name)
                    .Name('<span style="padding-left:20px;"><em class="' + this.getFieldTypeIconClass(field.type === 'UNKNOWN' ? field.logicalType : field.type) + '"></em>' + field.name + '</span>')
                    .Field(field.name)
                    .Behavior('select')
                    .Selectable(false)
                    .CssClass('cell-selection')
                    .Width(12 * (field.name.length) + 20)
                    .MinWidth(100)
                    .CannotTriggerInsert(true)
                    .Resizable(true)
                    .Unselectable(true)
                    .Sortable(true)
                    .build();
            }
        );
        // .Width(10 * (field.name.length) + 20)
    }

    /**
     * Return Rows for grid
     * @param rows
     * @returns {any[]}
     * @private
     */
    private _getRows(rows) : any[] {
        let result = rows;
        if (result.length > 0 && !result[0].hasOwnProperty('id')) {
            result = rows.map((row: any, idx: number) => {
                row.id = idx;
                return row;
            });
        }
        return result;
    }




    /**
     * Draw Grid
     * @param {header[]} headers
     * @param {any[]} rows
     * @private
     */
    private _drawGrid(headers: header[], rows : any[]) {
        // 그리드가 영역을 잡지 못해서 setTimeout으로 처리
        if (this.gridComponent) {
            setTimeout(() => {
                this.gridComponent.create(headers, rows, new GridOption()
                    .SyncColumnCellResize(true)
                    .MultiColumnSort(true)
                    .RowHeight(32)
                    .NullCellStyleActivate(true)
                    .build()
                ); $('.slick-viewport').css('top', 50 + 'px');},400);
            this.clickable = true;
        }


        // this.gridComponent.create(headers, rows, new GridOption()
        //     .SyncColumnCellResize(true)
        //     .MultiColumnSort(true)
        //     .RowHeight(32)
        //     .NullCellStyleActivate(true)
        //     .build()
        // );
        //
        // // slick-viewport - Custom Top
        // $('.slick-viewport').css('top', 50 + 'px');
        // this.clickable = true;
        // this.loadingHide();
    }





    /**
     * Initialise status
     * @param {RsType} type
     * @private
     */
    private _deleteGridInfo(type : RsType) {

        if (type === RsType.QUERY) {

            this.datasetJdbc.sqlInfo.headers = [];
            this.datasetJdbc.sqlInfo.rows = [];
            // this.showQueryStatus = false;

        } else {

            this.datasetJdbc.tableInfo.headers = [];
            this.datasetJdbc.tableInfo.rows = [];

        }

        this.gridComponent.destroy();
        this.clearGrid = true;
        this.clickable = false;
    }

}