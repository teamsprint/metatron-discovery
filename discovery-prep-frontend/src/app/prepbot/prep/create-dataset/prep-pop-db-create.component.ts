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
import {ActivatedRoute} from "@angular/router";
import {PopupService} from '../../../common/service/popup.service';
import {PageResult} from "../../../domain/common/page";
import { PrConnectionService } from '../service/connection.service';
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
    public datasetJdbc: PrDatasetJdbc = new PrDatasetJdbc();

    public connectionList : any = [];
    // public isShow = false;
    public selectedFormMessage:string = '';



    // 생성자
    constructor(protected elementRef: ElementRef,
                private popupService: PopupService,
                public connectionService: PrConnectionService,
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

        this.pageResult.number = 0;
        this.pageResult.size = 20;

        this.datasetJdbc.dsType = DsType.IMPORTED;
        this.datasetJdbc.importType = ImportType.DATABASE;

        this.selectedFormMessage = this.translateService.instant('msg.storage.ui.load.dconn');

    }

    public ngAfterViewInit() {
            this._getConnections();
    }

    // Destory
    public ngOnDestroy() {
        super.ngOnDestroy();
    }

    public init() {
        // this.isShow = true;
    }
  public goto(step) {
      this.step = step;
      this.stepChange.emit( step );
    }

    public next() {
         // this.goto('create-dataset-name');
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
        console.info(event);

        // only fetch data when it's different
        if (this.datasetJdbc.dcId !== event.id) {
            this.datasetJdbc.dcId = event.id;
            this.getConnectionDetail();

            // refresh existing data
            this.datasetJdbc.sqlInfo = new QueryInfo();
            this.datasetJdbc.tableInfo = new TableInfo();
            this.datasetJdbc.rsType = undefined;
        }
        this.selectedFormMessage = event.name;
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
        // if (!isNullOrUndefined(connection)) {
        //     this._connectionComponent.init(connection);
        // } else {
        //     this._connectionComponent.init();
        // }

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
                        this.selectedFormMessage = this.connectionList[0].name;


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
}