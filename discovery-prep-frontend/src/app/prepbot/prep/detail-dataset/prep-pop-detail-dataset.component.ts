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
import {Location} from "@angular/common";
import {DatasetService} from '../service/dataset.service';
import {DataflowService} from "../service/dataflow.service";
import {DsType, Field, ImportType, PrDataset, RsType} from '../../../domain/data-preparation/pr-dataset';
import {PrDataflow} from "../../../domain/data-preparation/pr-dataflow";
import {isNull, isNullOrUndefined} from "util";
import {PreparationCommonUtil} from "../../util/preparation-common.util";
import { GridComponent } from '../../../common/component/grid/grid.component';
import {header, SlickGridHeader} from '../../../common/component/grid/grid.header';
import {GridOption} from '../../../common/component/grid/grid.option';
import * as pixelWidth from 'string-pixel-width';
import {saveAs} from 'file-saver';


declare let moment: any;


@Component({
    selector: 'prep-pop-detail-dataset',
    templateUrl: './prep-pop-detail-dataset.component.html'
})

export class PrepPopDetailDatasetComponent extends AbstractComponent {


    @ViewChild(GridComponent)
    private gridComponent: GridComponent;

    @Input()
    public dataset: PrDataset;

    @Input()
    public datasetId : string;


    @Output()
    public closeEvent: EventEmitter<void> = new EventEmitter();

    @Output()
    public createNewDataFlowEvent: EventEmitter<string> = new EventEmitter();


    public fields : Field[];

    // dataset option layer show/hide
    public isDatasetOptionShow: boolean = false;

    // 사용된 dataset layer show/hide
    public isDatasetNameEditMode: boolean = false;

    // dataset option layer show/hide
    public isDatasetDescEditMode: boolean = false;

    // delete selected dataset
    public selectedDatasetId: string;

    // container for dataset name & description - edit
    public datasetName: string = '';
    public datasetDesc: string = '';

    public datasetInformationList : DatasetInformation[] ;

    public interval : any;

    public isSelectDataflowOpen: boolean = false;

    public isForLineage: boolean = true;

    // dataflow id str
    public dfStr : string;

    // @ViewChild('dsName')
    // private dsName: ElementRef;
    // @ViewChild('dsDesc')
    // private dsDesc: ElementRef;


    public prepCommonUtil = PreparationCommonUtil;

    public dsType = DsType;

    public ruleList: Command[];
    public commandList: Command[];
    public isRequested: boolean = false;
    public ImportType = ImportType;



    // 생성자
    constructor(protected elementRef: ElementRef,
                private activatedRoute: ActivatedRoute,
                private _location: Location,
                private datasetService:DatasetService,
                private dataflowService :DataflowService,
                protected injector: Injector) {

        super(elementRef, injector);
    }

    public ngOnInit() {


        this.commandList = [
            { command: 'header', alias: 'He'},
            { command: 'keep', alias: 'Ke'},
            { command: 'replace', alias: 'Rp'},
            { command: 'rename', alias: 'Rn'},
            { command: 'set', alias: 'Se'},
            { command: 'settype', alias: 'St'},
            { command: 'countpattern', alias: 'Co'},
            { command: 'split', alias: 'Sp'},
            { command: 'derive', alias: 'Dr'},
            { command: 'delete', alias: 'De'},
            { command: 'drop', alias: 'Dp'},
            { command: 'pivot', alias: 'Pv'},
            { command: 'unpivot', alias: 'Up'},
            { command: 'join', alias: 'Jo'},
            { command: 'extract', alias: 'Ex'},
            { command: 'flatten', alias: 'Fl'},
            { command: 'merge', alias: 'Me'},
            { command: 'nest', alias: 'Ne'},
            { command: 'unnest', alias: 'Un'},
            { command: 'aggregate', alias: 'Ag'},
            { command: 'sort', alias: 'So'},
            { command: 'move', alias: 'Mv'},
            { command: 'union', alias: 'Ui'},
            { command: 'window', alias: 'Wn'},
            { command: 'setformat', alias: 'Sf'}
        ];


        if(this.datasetId == null || this.datasetId == undefined) {
            this.activatedRoute.params.subscribe((params) => {
                this.datasetId = params['dsId'];
                this._getDsDetail(true);
            });
        }else{
            this._getDsDetail(true);
        }
        super.ngOnInit();
        this.init();
    }

    // Destory
    public ngOnDestroy() {
        super.ngOnDestroy();
    }
    public init() {
        // console.info(this.dsId);
    }


    public onClickPrev(): void {
        this._location.back();
    }


    /**
     * 데이터셋 이름을 실제 db와 같게 set
     */
    public setDatasetName() {
        this.isDatasetNameEditMode = false;
        if (this.datasetName !== this.dataset.dsName) {
            this.datasetName = this.dataset.dsName;
        }

    }

    /**
     * 데이터셋 설명을 실제 db와 같게 set
     */
    public setDatasetDescription() {
        this.isDatasetDescEditMode = false;
        if (this.datasetDesc !== this.dataset.dsDesc) {
            this.datasetDesc = this.dataset.dsDesc;
        }
    }


    /** get total bytes */
    public get getTotalBytes() {
        if( (this.dataset.importType===ImportType.STAGING_DB &&
                this.dataset.rsType!==RsType.TABLE)  || this.dataset.importType===ImportType.DATABASE) {
            return null
        } else {
            let size = -1;
            if(Number.isInteger(this.dataset.totalBytes)) {
                size = this.dataset.totalBytes;
            }
            return this._formatBytes(size,1);
        }
    }


    /** get row count */
    public get getRows() {
        let rows = '0 row(s)';
        if(!isNullOrUndefined(this.dataset.totalLines) && Number.isInteger(this.dataset.totalLines)) {
            if (this.dataset.totalLines === -1) {
                rows = '(counting)';
            } else {
                rows = new Intl.NumberFormat().format(this.dataset.totalLines) + ' row(s)';
            }
        }
        return rows;
    }

    public get getHost() {
        if( this.dataset.importType===ImportType.DATABASE && !isNullOrUndefined(this.dataset.dcHostname)) {
            return this.dataset.dcHostname;
        }
        return null;
    }

    public get getPort() {
        if( this.dataset.importType===ImportType.DATABASE && !isNullOrUndefined(this.dataset.dcPort)) {
            return this.dataset.dcPort;
        }
        return null;
    }

    public get getDatabase() {
        return this.dataset.dbName;
    }

    public get getUrl() {
        return this.dataset.dcUrl;
    }

    public get getTable() {
        return this.dataset.tblName;
    }

    public get getQueryStmt() {
        return this.dataset.queryStmt;
    }

    /**
     * get names of sheet
     */
    public getSheetName() : string {

        let result = "N/A";
        if(this.dataset.sheetName) {
            result = this.dataset.sheetName;
        }
        return result;
    }

    /**
     * WRANGLED rule eidt scene
     */
    public goDetailNavigate(dfId: string ){
        this.router.navigate([`/management/prepbot/dataflow/${dfId}/dataset/${this.dataset.dsId}`]);
    }

    /**
     * 데이터셋 information을 타입별로 정리
     * @param dataset
     */
    public getDatasetInformationList(dataset) {
        this.datasetInformationList = [];

        // WRANGLED
        if (dataset.dsType === DsType.WRANGLED) {
            this.datasetInformationList = [{ name : this.translateService.instant('msg.comm.th.type') , value : dataset.dsType },
                {name : this.translateService.instant('msg.dp.th.summary'), value : this.getRows },
                {name : '', value : this.dataset.gridResponse.colCnt + ' column(s)' }
            ]
            // FILE
        }  else if (dataset.importType === ImportType.UPLOAD || dataset.importType === ImportType.URI) {
            let filepath : string = dataset.filenameBeforeUpload;

            this.datasetInformationList = [
                { name : this.translateService.instant('msg.comm.th.type') ,
                    value : PreparationCommonUtil.getDatasetType(dataset)
                },
                {name : this.translateService.instant('msg.dp.th.file'),
                    value : `${filepath}`
                },
            ];

            // EXCEL
            if (this._getFileType(dataset.importType, filepath) === 'EXCEL') {
                this.datasetInformationList.push({name : this.translateService.instant('msg.dp.th.sheet'), value : this.getSheetName() })
            }

            this.datasetInformationList.push(
                {name : 'URI', value : this.dataset.storedUri},
                {name : this.translateService.instant('msg.comm.detail.size'), value : this.getTotalBytes },
                {name : this.translateService.instant('msg.dp.th.summary'), value : this.getRows },
                {name : '', value : this.dataset.gridResponse.colCnt + ' column(s)' })


            // STAGING OR DB
        } else if (dataset.importType === 'STAGING_DB' || dataset.importType === 'DATABASE') {

            this.datasetInformationList = [
                { name : this.translateService.instant('msg.comm.th.type') ,
                    value : PreparationCommonUtil.getDatasetType(dataset) }];

            if (!isNullOrUndefined(this.getDatabase)) {
                this.datasetInformationList.push({ name : `${this.translateService.instant('msg.dp.th.database')}`, value : `${this.getDatabase}` });
            }

            if (dataset.rsType === 'TABLE') {
                this.datasetInformationList.push({ name : `${this.translateService.instant('msg.lineage.ui.list.search.table')}`, value : `${this.getTable}` })
            } else {
                this.datasetInformationList.push({ name : `${this.translateService.instant('msg.lineage.ui.list.search.sql')}`, value : `${this.getQueryStmt}` })
            }

            if (dataset.importType === 'STAGING_DB') {
                if (!isNullOrUndefined(this.getTotalBytes)) {
                    this.datasetInformationList.push({name : this.translateService.instant('msg.comm.detail.size'), value : this.getTotalBytes });
                }
            } else {
                if (this.getPort && this.getHost) {
                    this.datasetInformationList.push({ name : `${this.translateService.instant('Host')}`, value : `${this.getHost}` },
                        { name : `${this.translateService.instant('Port')}`, value : `${this.getPort}` })
                } else {
                    this.datasetInformationList.push({ name : `${this.translateService.instant('Url')}`, value : `${this.getUrl}` });
                }
            }

            this.datasetInformationList.push(
                {name : this.translateService.instant('msg.dp.th.summary'), value : this.getRows },
                {name : '', value : this.dataset.gridResponse.colCnt + ' column(s)' })

        }
    }



    /**
     * Returns grid style
     * @returns {{top: string}}
     */
    public getGridStyle() {
        let elem, stayle;
        elem = document.querySelector('.pb-layout-contents');
        stayle = getComputedStyle(elem);
        let gridWidth: number = Number(String(stayle.width).replace("px","")) - 670;
        if(gridWidth<805) {
            gridWidth = 805;
        }
        return {'width':gridWidth+'px', 'height':'350px'};
    }
    public downloadDataset() {
        if ((this.dataset.dsType === DsType.IMPORTED && this.dataset.importType === ImportType.UPLOAD) ||
            (this.dataset.dsType === DsType.IMPORTED && this.dataset.importType === ImportType.URI)
        ) {
            this.downloadDatasetForFile();

        }else{
            this.downloadDatasetNotFile();
        }
    }

    private downloadDatasetNotFile() {
        if(this.dataset.gridResponse == null) return;
        const exceldata: any = [];
        const headerdata: string[] = [];
        for (let i = 0; i < this.dataset.gridResponse.colNames.length; i = i + 1) {
            headerdata.push(this.dataset.gridResponse.colNames[i]);
        }

        let jsonHeader: string = JSON.stringify(headerdata);
        jsonHeader = jsonHeader.substr(1, jsonHeader.length - 2);
        exceldata.push(jsonHeader);


        for (let i = 0; i < this.dataset.gridResponse.rows.length; i = i + 1) {
            const rowdata: string[] = [];
            for (let j = 0; j < this.dataset.gridResponse.rows[i].objCols.length; j = j + 1) {
                const rowdatastring:string = this.dataset.gridResponse.rows[i].objCols[j];
                if (rowdatastring === null) {
                    rowdata.push('');
                }else {
                    const type: string = this.dataset.gridResponse.colDescs[j].type;
                    if(type=='STRING' || type=='TIMESTAMP') {
                        rowdata.push('"' + rowdatastring + '"');
                    }else{
                        rowdata.push(rowdatastring);
                    }

                }
            }
            exceldata.push(rowdata);
        }

        let label: string = this.deleteSpeCharacter(this.dataset.dsName);
        let total_count: number = 0;
        if(this.dataset.totalLines != null) {
            total_count = this.dataset.totalLines;
        }
        label += "_" + total_count
        saveAs(new Blob(['\ufeff' + exceldata.join('\n')], { type: 'application/csv;charset=utf-8' }), label + '.csv');

    }
    private deleteSpeCharacter(name: string): string {
        if (name === null || name === undefined) return name;
        let label: string = name;
        const regExp:any = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
        label = label.replace(/ /g,'');
        label = label.replace(regExp,'');
        return label;
    }




    /**
     * Download Imported Dataset (only Upload Uri type)
     */
    public downloadDatasetForFile() {
        let fileFormat: string;
        let downloadFileName: string;

        if ((this.dataset.dsType === DsType.IMPORTED && this.dataset.importType === ImportType.UPLOAD) ||
            (this.dataset.dsType === DsType.IMPORTED && this.dataset.importType === ImportType.URI)
        ) {

            let ext = this.prepCommonUtil.getFileFormatWithExtension( this.dataset.filenameBeforeUpload );
            if (ext.toString().toLowerCase() === 'xls' || ext.toString().toLowerCase() === 'xlsx' || ext.toString().toLowerCase() === 'csv') {
                fileFormat = 'csv';
                downloadFileName = this.dataset.dsName + '.csv';
            } else {
                fileFormat = ext.toString().toLowerCase();
                downloadFileName = this.dataset.filenameBeforeUpload;
            }

            this.datasetService.downloadDataset(this.dataset.dsId, fileFormat).subscribe((datasetFile) => {
                saveAs(datasetFile, downloadFileName);
            });
        }
    }




    public close() {
        this.closeEvent.emit();

    }


    /**
     * Create new dataflow and add this dataset into that flow
     */
    public createNewFlow() {
        let today = moment();
        let param = new PrDataflow();
        param.datasets = [];
        param.dfName = `${this.dataset.dsName}_${today.format('MM')}${today.format('DD')}_${today.format('HH')}${today.format('mm')}`  ;
        this.loadingShow();
        this.dataflowService.createDataflow(param).then((result) => {
            this.loadingHide();
            if (result.dfId) {
                // this.router.navigate(['/management/prepbot/dataflow', result.dfId]);
                this.cookieService.set('FIND_WRANGLED',this.datasetId);
                // Alert.success(this.translateService.instant('msg.dp.alert.create-df.success',{value:result.dfName}));
                this.updateDatasets(result.dfId);
            }
        }).catch((error)=>{
            this.loadingHide();
            let prep_error = this.dataprepExceptionHandler(error);
            // PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
        })
    }






    private updateDatasets(dfId: string) {
        const dsIds: any = {};
        dsIds.dsIds = [];
        dsIds.dsIds.push(this.dataset.dsId);
        this.loadingShow();

        this.dataflowService.updateDataSets(dfId, dsIds).then((result) => {
            this.loadingHide();
            if (result) {
                // console.info('result', result)
                // this.router.navigate(['/management/prepbot/dataflow', dfId]);
                this.createNewDataFlowEvent.emit(dfId);
            }

        }).catch(() => {
            this.loadingHide();
            // this.close();
        });
    }





    /**
     * Returns file type (csv, json, excel etc)
     * @param {ImportType} type
     * @param {string} fileName
     * @returns {string}
     */
    private _getFileType(type: ImportType, fileName : string) : string {

        let result = 'CSV';
        if (type === ImportType.UPLOAD) {
            let extension = new RegExp(/^.*\.(csv|xls|txt|xlsx|json)$/).exec(fileName)[1];
            if(extension.toUpperCase() === 'XLSX' || extension.toUpperCase() === 'XLS') {
                result =  'EXCEL'
            }  else if (extension.toUpperCase() === 'JSON') {
                result =  'JSON'
            }
        }
        return result;
    }


    /**
     * Format bytes
     * @param a 크기
     * @param b 소숫점 자릿
     * @private
     */
    private _formatBytes(a,b) {
        if (-1 === a)  {
            return "0 Bytes";
        }

        let c=1024,d=b||2,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(a)/Math.log(c));
        return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]
    }



    /**
     * Change grid data to grid response
     * @param gridResponse 매트릭스 정보
     * @returns 그리드 데이터
     */
    private _getGridDataFromGridResponse(gridResponse: any) {
        let colCnt = gridResponse.colCnt;
        let colNames = gridResponse.colNames;
        let colTypes = gridResponse.colDescs;

        const gridData = {
            data: [],
            fields: []
        };

        for ( let idx = 0; idx < colCnt; idx++ ) {
            gridData.fields.push({
                name: colNames[idx],
                type: colTypes[idx].type,
                seq: idx
            });
        }

        gridResponse.rows.forEach((row) => {
            const obj = {};
            for ( let idx = 0;idx < colCnt; idx++ ) {
                obj[ colNames[idx] ] = row.objCols[idx];
            }
            gridData.data.push(obj);
        });

        return gridData;
    } // function - getGridDataFromGridResponse


    /**
     * 그리드 갱신
     * @param {any} data 데이터셋
     */
    private _updateGrid(data: any) {
        const maxDataLen: any = {};
        const fields: Field[] = data.fields;

        let rows: any[] = data.data;

        if( 0 === fields.length ) {
            return;
        }

        const maxLength = 500;
        if (rows.length > 0) {
            rows.forEach((row: any, idx: number) => {
                // 컬럼 길이 측정
                fields.forEach((field: Field) => {
                    let colWidth: number = 0;
                    if (typeof row[field.name] === 'string') {
                        colWidth = Math.floor((row[field.name]).length * 12);
                    }
                    if (!maxDataLen[field.name] || (maxDataLen[field.name] < colWidth)) {
                        if (colWidth > 500) {
                            maxDataLen[field.name] = maxLength;
                        } else {
                            maxDataLen[field.name] = colWidth;
                        }
                    }
                });
                // row id 설정
                (row.hasOwnProperty('id')) || (row.id = idx);

            });
        }

        // 헤더정보 생성
        const headers: header[] = fields.map((field: Field) => {

            /* 72 는 CSS 상의 padding 수치의 합산임 */
            const headerWidth: number = Math.floor(pixelWidth(field.name, { size: 12 })) + 72;

            return new SlickGridHeader()
                .Id(field.name)
                .Name('<span style="padding-left:20px;"><em class="' + this.getFieldTypeIconClass(field.type) + '"></em>' + field.name + '</span>')
                .Field(field.name)
                .Behavior('select')
                .Selectable(false)
                .CssClass('cell-selection')
                .Width(headerWidth > maxDataLen[field.name] ? headerWidth : maxDataLen[field.name])
                .MinWidth(100)
                .CannotTriggerInsert(true)
                .Resizable(true)
                .Unselectable(true)
                .Sortable(false)
                .ColumnType(field.type)
                .Formatter(( row, cell, value, columnDef ) => {
                    const colDescs = (this.dataset.gridResponse && this.dataset.gridResponse.colDescs) ? this.dataset.gridResponse.colDescs[cell] : {};
                    value = PreparationCommonUtil.setFieldFormatter(value, columnDef.columnType, colDescs);

                    if (field.type === 'STRING') {
                        value = (value) ? value.toString().replace(/</gi, '&lt;') : value;
                        value = (value) ? value.toString().replace(/>/gi, '&gt;') : value;
                        value = (value) ? value.toString().replace(/\n/gi, '&crarr;') : value;
                        let tag = '<span style="color:#ff00ff; font-size: 9pt; letter-spacing: 0px">&middot;</span>';
                        value = (value) ? value.toString().replace(/\s/gi, tag) : value;
                    }
                    if (isNull(value)) {
                        return '<div style=\'position:absolute; top:0; left:0; right:0; bottom:0; line-height:30px; padding:0 10px; font-style: italic ; color:#b8bac2;\'>' + '(null)' + '</div>';
                    } else {
                        return value;
                    }
                }).build();
        });

        setTimeout(() => {
            if (!isNullOrUndefined(this.gridComponent)) {
                this.gridComponent.create(headers, rows, new GridOption()
                    .SyncColumnCellResize(true)
                    .EnableColumnReorder(false)
                    .RowHeight(32)
                    .NullCellStyleActivate(true)
                    .build()
                )
            }
        },400);
    } // function - updateGrid


    /**
     * Set rule list
     * @param rules
     * @private
     */
    private _setRuleList(rules: any) {
        this.ruleList = [];
        const commandNames = this.commandList.map((command) => {
            return command.command;
        });

        // ruleStringInfos
        rules.forEach((rule) => {

            let ruleInfo: Command = new Command();
            let ruleVO = JSON.parse(rule['jsonRuleString']);
            ruleInfo.command = ruleVO['name'];

            const idx = commandNames.indexOf(ruleInfo.command);

            if (idx > -1) {
                ruleInfo.alias = this.commandList[idx].alias;
                ruleInfo.shortRuleString = rule.shortRuleString || rule.ruleString
                ruleInfo.ruleString = rule.ruleString;

            } else {
                ruleInfo.shortRuleString = rule.shortRuleString ? rule.shortRuleString : rule.ruleString;
                ruleInfo.command = 'Create';
                ruleInfo.alias = 'Cr';
            }

            this.ruleList.push(ruleInfo);

        });
    }

    /**
     * Returns dataset detail information including grid
     */
    private _getDsDetail(isInitial?: boolean) {


        if (isInitial) {
            this.isRequested = false;
            this.loadingShow();
        }

        if (!this.isRequested) {
            this.isRequested  = true;
            this.datasetService.getDatasetDetail(this.datasetId).then((result) => {
                this.isRequested = false;
                this.dataset = result;
                this.setDatasetName();
                this.setDatasetDescription();

                // Set dataflow information for `used in`
                if (this.dataset['dataflows']) {
                    this.dataset.dataflows = this.dataset['dataflows'];
                } else {
                    this.dataset.dataflows = [];
                }

                // set grid information
                this.dataset.gridResponse = result.gridResponse;
                this.fields = this._getGridDataFromGridResponse(result.gridResponse).fields;
                this._updateGrid(this._getGridDataFromGridResponse(result.gridResponse));

                // set information
                this.getDatasetInformationList(this.dataset);

                // set rule list only when dataset is wrangled
                if (this.dataset.dsType === DsType.WRANGLED) {
                    this._setRuleList(this.dataset.transformRules);
                }

                this.loadingHide();

                clearInterval(this.interval);
                this.interval = undefined;

                if (!isNullOrUndefined(this.dataset.totalLines) && this.dataset.totalLines === -1) {
                    this.interval = setInterval(()=> {this._getDsDetail();},3000);
                }

                // console.info('this.dataset', this.dataset.dsType);

            }).catch((error) => {
                this.loadingHide();
                clearInterval(this.interval);
                this.interval = undefined;
                let prep_error = this.dataprepExceptionHandler(error);
                // PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
            });
        }



    }


    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     | Protected Method
     |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
}

class DatasetInformation {
    name: string;
    value: any;
}

class Command {
    command : string;
    alias : string;
    shortRuleString?: string;
    ruleString?: string;
}
