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
import {ActivatedRoute} from "@angular/router";
import {PopupService} from '../../../common/service/popup.service';
import {PageResult} from "../../../domain/common/page";
import {PrConnectionService} from '../service/connection.service';
import {header, SlickGridHeader} from '../../../common/component/grid/grid.header';
import {GridOption} from '../../../common/component/grid/grid.option';
import {ConnectionComponent, ConnectionValid} from "../../../data-storage/component/connection/connection.component";
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
                private popupService: PopupService,
                private connectionService: PrConnectionService,
                protected injector: Injector,
                private activatedRoute: ActivatedRoute) {

        super(elementRef, injector);
    }

    public ngOnInit() {
        super.ngOnInit();
        // console.info('PrepPopDBQueryComponent datasetJdbc', this.datasetJdbc);

        // get database list
        this.getDatabases();

        // Only initialise sqlInfo when sqlInfo doesn't have value
        // if (isNullOrUndefined(this.datasetJdbc.sqlInfo)) {
        //     this.datasetJdbc.sqlInfo = new QueryInfo();
        // }
        this.datasetJdbc.sqlInfo = new QueryInfo();

        // Only initialise tableInfo when tableInfo doesn't have value
        // if (isNullOrUndefined(this.datasetJdbc.tableInfo)) {
        //     this.datasetJdbc.tableInfo = new TableInfo();
        // }
        this.datasetJdbc.tableInfo = new TableInfo();

        this._setDefaultValues();

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
        this.stepChange.emit( 'DB' );
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
     * Get database list
     */
    private getDatabases() {
        this.loadingShow();

        if (!this.datasetJdbc.dataconnection.connection) {
            // this.datasetJdbc.dcId = this.datasetJdbc.dataconnection.id;

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