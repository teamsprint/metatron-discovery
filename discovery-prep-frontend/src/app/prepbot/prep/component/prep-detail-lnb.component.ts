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
import {PrDataflow} from "../../../domain/data-preparation/pr-dataflow";
import {PrDataset} from "../../../domain/data-preparation/pr-dataset";
import {PrDataSnapshot} from "../../../domain/data-preparation/pr-snapshot";
import {DataflowService} from '../service/dataflow.service';
import {DatasetService} from "../service/dataset.service";
import {SnapshotService} from "../service/snapshot.service";
import {isNullOrUndefined} from "util";
import {StringUtil} from "../../../common/util/string.util";

@Component({
    selector: 'prep-detail-lnb',
    templateUrl: './prep-detail-lnb.component.html'
})

export class PrepDetailLnbComponent extends AbstractComponent {


    @Output()
    public viewModeChangeEvent: EventEmitter<string> = new EventEmitter();

    @Input()
    public viewMode: string;

    @Input()
    public workflowType: boolean;

    @Input()
    public zoomViewMode: string;

    public isNaivationOpen: boolean;
    public dataflows : PrDataflow[];
    public datasets : PrDataset[];
    public datasnapshots: PrDataSnapshot[];

    // search text
    public searchText: string='';

    // 정렬
    public selectedContentSort: Order = new Order();

    // 생성자
    constructor(protected elementRef: ElementRef,
                private _dataflowService: DataflowService,
                private _datasetService: DatasetService,
                private _dataSnapshotService: SnapshotService,
                protected injector: Injector) {
        super(elementRef, injector);
    }


    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     | Override Method
     |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

    public ngOnInit() {
        super.ngOnInit();
        if(isNullOrUndefined(this.zoomViewMode)){
            this.zoomViewMode = 'FLOW';
        }
        // this._getPrepList();
    }


    public openNavigation() : void {
        this.isNaivationOpen = !this.isNaivationOpen;
        if(this.isNaivationOpen) {
            this._getPrepList();
        }else{
            this.searchText = '';
        }
    }


    public changeViewMode(viewMode: string) : void {
        this.viewMode = viewMode;
        this.viewModeChangeEvent.emit(viewMode);

    }

    public dataflowClick(dfId: string ): void {
        this.isNaivationOpen = false;
        this.router.navigate(['/management/prepbot/dataflow', dfId]);
    }
    public datasetClick(dsId: string) : void {
        this.isNaivationOpen = false;
        this.router.navigate(['/management/prepbot/datasetdetail', dsId]).then();
    }
    public datasnapshotsClick(ssId: string): void {
        this.isNaivationOpen = false;
        this.router.navigate(['/management/prepbot/dataresultdetail', ssId]).then();

    }
    /**
     * Search dataflow
     * @param event
     */
    public searchDataflows(event) {
        if (13 === event.keyCode || 27 === event.keyCode) {
            if (event.keyCode === 27) {
                this.searchText = '';
            }
            this._getPrepList();
        }
    }




    private _getPrepList() {
        this.loadingShow();
        const promise = [];
        promise.push(this._getDataflows());
        promise.push(this._getDatasets());
        promise.push(this._getDataresults());


        Promise.all(promise).then((result) => {
            //console.info('promise finish -->', result);
            // this._searchParams = this._getPrepParams();

            // this.list = [];
            this.dataflows = [];
            this.datasets = [];
            this.datasnapshots = [];

            let dataflowList = [];
            let datasetList = [];
            let dataresultList = [];
            let dataconnectionList = [];

            dataflowList = result[0];
            datasetList = result[1];
            dataresultList = result[2];


            this.loadingHide();

            this.dataflows = dataflowList['_embedded']? this.dataflows.concat(dataflowList['_embedded']['preparationdataflows']) : [];
            this.datasets = datasetList['_embedded'] ? this.datasets.concat(datasetList['_embedded']['preparationdatasets']) : [];
            this.datasnapshots = dataresultList['_embedded'] ? this.datasnapshots.concat(dataresultList['_embedded']['preparationsnapshots']) : [];


            // console.info('this.dataflows', this.dataflows);
            // console.info('this.datasets', this.datasets);
            // console.info('this.datasnapshots', this.datasnapshots);

        }).catch((err) => {
            console.log(err);
            // 로딩 종료
            this.loadingHide();
        });
    }


    /**
     * Fetch dataflow list
     */
    private _getDataflows() {
        const params = this._getDfParams();
        return new Promise<any>((resolve, reject) => {
            this._dataflowService.getDataflowList(params).then(result => {
                resolve(result);
            }).catch((err) => reject(err));
        });
    }

    /**
     * Fetch dataset list
     */
    private _getDatasets() {
        const params = this._getDsParams();
        return new Promise<any>((resolve, reject) => {
            this._datasetService.getDatasets(params).then(result => {
                resolve(result);
            }).catch((err) => reject(err));
        });
    }

    /**
     * Fetch datasesult list
     */
    private _getDataresults() {
        const params = this._getSsParams();
        return new Promise<any>((resolve, reject) => {
            this._dataSnapshotService.getSnapshots(params).then(result => {
                resolve(result);
            }).catch((err) => reject(err));
        });
    }

    private _getDfParams(): any {
        const params = {
            page: this.page.page,
            size: 100,
            projection: 'forListView',
            pseudoParam : (new Date()).getTime()
        };

        if (!isNullOrUndefined(this.searchText) || StringUtil.isNotEmpty(this.searchText)) {
            params['dfName'] = this.searchText;
        }

        this.selectedContentSort.sort !== 'default' && (params['sort'] = this.selectedContentSort.key + ',' + this.selectedContentSort.sort);

        return params;
    }

    private _getDsParams(): any{

        const params = {
            page: this.page.page,
            size: 100,
            pseudoParam : (new Date()).getTime()
        };

        if (!isNullOrUndefined(this.searchText) || StringUtil.isNotEmpty(this.searchText)) {
            params['dsName'] = this.searchText;
        }

        params['dsType'] = '';

        this.selectedContentSort.sort !== 'default' && (params['sort'] = this.selectedContentSort.key + ',' + this.selectedContentSort.sort);

        return params;
    }

    private _getSsParams(): any {
        const params = {
            page: this.page.page,
            size: 100,
            status : 'all',
            //type: this.ssType,
            projection:'listing',
            ssName: this.searchText,
            pseudoParam : (new Date()).getTime()
        };

        this.selectedContentSort.sort !== 'default' && (params['sort'] = this.selectedContentSort.key + ',' + this.selectedContentSort.sort);

        return params;
    }

}

class Order {
    key: string = 'modifiedTime';
    sort: string = 'default';
}
