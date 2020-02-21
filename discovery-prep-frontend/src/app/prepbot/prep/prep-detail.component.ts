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

import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostListener,
    Injector,
    Input,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import {AbstractComponent} from '../../common/component/abstract.component';
import {DataflowService} from '../dataflow/service/dataflow.service';
import {ActivatedRoute} from "@angular/router";
import * as $ from "jquery";
import {DsType, ImportType, PrDataset, Rule} from "../../domain/data-preparation/pr-dataset";
import {PreparationAlert} from "../util/preparation-alert.util";
import {Alert} from "../../common/util/alert.util";
import {PrDataflow} from "../../domain/data-preparation/pr-dataflow";

import {isUndefined} from "util";
import * as _ from "lodash";
import {StringUtil} from "../../common/util/string.util";
import {DataflowModelService} from "../dataflow/service/dataflow.model.service";
import {SnapshotLoadingComponent} from "../component/snapshot-loading.component";
import { CreateSnapshotPopup } from '../component/create-snapshot-popup.component';
import {Location} from "@angular/common";
import {DatasetInfoPopupComponent} from "../dataflow/dataflow-detail/component/dataset-info-popup/dataset-info-popup.component";
declare let echarts: any;

@Component({
  selector: 'prep-detail',
  templateUrl: './prep-detail.component.html'
})
export class PrepDetailComponent extends AbstractComponent {


    // 생성자
    constructor(
                private dataflowService: DataflowService,
                private dataflowModelService : DataflowModelService,
                private _location: Location,
                private activatedRoute: ActivatedRoute,
                protected elementRef: ElementRef,
                protected injector: Injector) {
        super(elementRef, injector);
    }

    @Input()
    public dataflow: PrDataflow;

    @Input()
    public selectedDataSet: PrDataset;

    @ViewChild('dfName')
    private dfName: ElementRef;

    @ViewChild('dfDesc')
    private dfDesc: ElementRef;

    @ViewChild(SnapshotLoadingComponent)
    public snapshotLoadingComponent : SnapshotLoadingComponent;

    @ViewChild(CreateSnapshotPopup)
    private createSnapshotPopup : CreateSnapshotPopup;

    @ViewChild(DatasetInfoPopupComponent)
    public datasetInfoPopupComponent : DatasetInfoPopupComponent;

    // echart ins
    public chart: any;

    // 차트를 그리기 위한 기반 데이터
    public dataSetList: any[] = [];

    public dataflows: PrDataflow[] = [];

    // 타입별 아이콘 정보
    private symbolInfo: any;

    // 차트 기본 옵션
    private chartOptions: any;

    // 노드 라벨 속성
    private label: any;

    // 루트 데이터셋 개수
    private rootCount: number = 0;

    // depth 개수
    private depthCount: number = 0;

    // 노드 리스트
    private chartNodes: any[] = [];

    // 노드간 링크 리스트
    private chartLinks: any[] = [];

    // Change Detect
    public changeDetect: ChangeDetectorRef;

    // 사용된 dataflow layer show/hide
    public isDataflowsShow: boolean = false;

    // 데이터 플로우 option layer show/hide
    public isDataflowOptionShow: boolean = false;

    // 데이터 플로우 이름 수정 모드
    public isDataflowNameEditMode: boolean = false;

    // 데이터 플로우 설명 수정 모드
    public isDataflowDescEditMode: boolean = false;

    // 데이터셋 이름 수정 모드
    public isDatasetNameEditMode: boolean = false;

    // 데이터셋 설명 수정 모드
    public isDatasetDescEditMode: boolean = false;

    // delete selected dataflow
    public selectedDataflowId: string;


    // 룰 리스트 (룰 미리보기)
    public ruleList: any[];

    // 룰 리스트에서 필요한 변수
    public commandList: any[];
    public ruleVO: Rule = new Rule;

    // container for dataflow name/desc - for edit
    public dataflowName: string;
    public dataflowDesc: string;
    public cloneFlag: boolean = false;
    public step: string;
    public longUpdatePopupType: string = '';
    public isSelectDatasetPopupOpen : boolean = false;    // Swap dataset popup open/close
    public isRadio : boolean = false;                     // If swapping -> true / if Adding -> false
    public swapDatasetId : string;                        // Swapping 대상 imported 면 dataset id wrangled 면 upstreamId
    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     | Override Method
     |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

    public ngOnInit() {
        super.ngOnInit();

        // 초기 세팅
        this.initViewPage();

        // 초기화
        this.init();
    }

    // Destory
    public ngOnDestroy() {
        super.ngOnDestroy();
    }


    /**
     * Dataflow 이름 셋 (this.dataflowName은 container이고 this.dataflow.dfName이 실제 이름임
     */
    public setDataflowName() {

        this.isDataflowNameEditMode = false;
        if (this.dataflowName !== this.dataflow.dfName) {
            this.dataflowName = this.dataflow.dfName;
        }
    }
    public snapshotCreateFinish(data) {
        this.snapshotLoadingComponent.init(data);
    }

    public openSnapshotPopup() {
        this.createSnapshotPopup.init({id : this.selectedDataSet.dsId , name : this.selectedDataSet.dsName});
    }

    /**
     * 다른 데이터셋으로 변경했을 떄 ..
     * @Param data 변경된 데이터셋으로 다시 표시
     */
    public onDatasetChange(data) {

        this.initSelectedDataSet();

        this.selectedDataSet = data;

        this.getDataflow();

    }

    public addDatasets() {
        this.openAddDatasetPopup(null);
    }

    /**
     * Open swap dataset popup
     * @param data
     */
    public openAddDatasetPopup(data :any) {

        // console.info('openAddDatasetPopup', data);
        if(data === null) {
            this.swapDatasetId = null;
            this.longUpdatePopupType = 'add';
            // this.datasetPopupTitle = 'Add datasets';
            this.isRadio = false;
        }else{
            this.swapDatasetId = data.dsId;
            if (data.type === 'imported') {
                // this.datasetPopupTitle = 'Replace dataset';
                this.isRadio = true;
                this.longUpdatePopupType = 'imported';
            } else if (data.type === 'wrangled') {
                // this.datasetPopupTitle = 'Change input dataset';
                this.isRadio = true;
                this.longUpdatePopupType = 'wrangled';
            }
        }
        this.isSelectDatasetPopupOpen = true;
    }


    /**
     * 뒤로가기
     * */
    public close() {
        this.router.navigate(['/management/datapreparation/dataflow']);
    }

    // 다른 데이터 플로우로 이동
    public selectDataflow(dfId) {
        // 선택된 데이터 셋 레이어 hide
        this.selectedDataSet.dsId = '';
        this.isDataflowsShow = false;

        // 선택한 데이터 플로우 아이디로 변경
        this.dataflow.dfId = dfId;
        // 데이터 플로우 상세조회
        this.getDataflow();
    }

    // 데이터 플로우 옵션 레이어 toggle
    public showOption(event) {
        this.isDataflowOptionShow = !this.isDataflowOptionShow;
        event.stopImmediatePropagation();
    }

    public hideOption() {
        this.isDataflowOptionShow = false;
    }
    /**
     * Dataflow 섦영 셋 (this.dataflowDesc은 container이고 this.dataflow.dfDesc 실제 설명임
     */
    public setDataflowDesc() {
        this.isDataflowDescEditMode = false;
        if (this.dataflowDesc !== this.dataflow.dfDesc) {
            this.dataflowDesc = this.dataflow.dfDesc;
        }
    }

    /**
     * chart에서 icon에 selected/unselected표시
     * @param dataset currently selected dataset
     * @param init is it from same page or from outside
     */
    public changeChartClickStatus(dataset, init:boolean = false) {

        if (!init) { // 현재 page에서 X 버튼을 눌러서 preview 창을 닫았을때
            let temp = this.chart.getOption();
            if (!isUndefined(temp)) {
                temp = temp.series[0].nodes.filter((node) => {
                    if (_.eq(node.dsId, dataset.dsId)) {
                        if (init) {
                            node.symbol = this.symbolInfo.SELECTED[dataset.dsType];
                            this.chart.setOption(temp);
                        } else {
                            node.detailType = dataset.dsType;
                            node.symbol = _.cloneDeep(node.originSymbol);
                            this.chart.setOption(temp);
                        }

                    }
                });
            }
        } else { // rule편집 화면에서 done버튼을 눌러서 다시 graph화면으로 왔을때 선택된 데이터셋이 동그라미있는 아이콘으로 바뀐다
            const tempChart = this.chart = echarts.init(this.$element.find('#chartCanvas')[0]);
            setTimeout(() => {
                if (!isUndefined(tempChart)) {
                    let temp1 = tempChart.getOption();
                    if (!isUndefined(temp1)) {
                        temp1 = temp1.series[0].nodes.filter((node) => {
                            if (_.eq(node.dsId, dataset.dsId)) {
                                node.symbol = this.symbolInfo.SELECTED[dataset.dsType];
                                tempChart.setOption(temp1);
                            }
                        });
                    }
                }
            }, 500)
        }


        setTimeout( () => {
            this.dataflowChartAreaResize();
        }, 600);
    }

    /**
     * Fetch dataflow info
     */
    public getDataflow(isOpen: boolean = false) {

        this.loadingShow();

        // Fetch dataflow info
        this.dataflowService.getDataflow(this.dataflow.dfId).then((dataflow) => {

            if (dataflow) {
                // this.dataflow = dataflow 로 대체 가능한지 확인
                this.dataflow = $.extend(this.dataflow, dataflow);

                // canvas height resize
                this.dataflowChartAreaResize();
                // canvas height resize


                if (this.dataflow.datasets) { // if dataflow has datasets
                    this.dataSetList = this.dataflow.datasets;
                } else {
                    if (this.dataflow['_embedded'] && this.dataflow['_embedded'].datasets) {
                        this.dataSetList = this.dataflow['_embedded'].datasets;
                    } else {
                        this.dataSetList = [];
                    }
                }

                this.dataSetList = this.dataSetList.filter(function (ds) {
                    if (ds.dsType && 'FULLWRANGLED' !== ds.dsType.toUpperCase()) {
                        return true;
                    }
                });

                if (this.dataSetList && 1 < this.dataSetList.length) {
                    this.dataSetList.sort(function (left, right) {
                        const leftTime = Date.parse(left.createdTime);
                        const rightTime = Date.parse(right.createdTime);
                        if (NaN == rightTime) {
                            return -1;
                        } else if (NaN == leftTime) {
                            return 1;
                        }
                        return leftTime < rightTime ? -1 : leftTime > rightTime ? 1 : 0;
                    });
                }

                // when there is no datasets left in dataflow
                if (dataflow.importedDsCount === 0 && dataflow.wrangledDsCount === 0) {
                    this.dataSetList = [];
                    this.dataflow = dataflow;
                    this.loadingHide();
                } else {
                    this.dataflowService.getUpstreams(this.dataflow.dfId)
                        .then((upstreams) => {

                            // 선택된 wrangled dataset의 imported dataset id를 몰라서 넘겨야한다 ;
                            this.dataflowModelService.setUpstreamList(upstreams);

                            let dfId = this.dataflow.dfId;
                            let upstreamList = upstreams.filter((upstream) => {
                                if (upstream.dfId === dfId) {
                                    return true;
                                }
                            });
                            for (let ds of this.dataSetList) {
                                ds.upstreamDsIds = [];
                                for (let upstream of upstreamList) {
                                    if (upstream.dsId === ds.dsId) {
                                        ds.upstreamDsIds.push(upstream.upstreamDsId);
                                    }
                                }
                            }


                            this.initChart(); // chart initial

                            // set wrangled dataset as selected (from dataset detail)
                            let wrangeldDsId = '';
                            if (this.cookieService.get('FIND_WRANGLED')) {

                                let dsId = this.cookieService.get('FIND_WRANGLED');
                                this.cookieService.delete('FIND_WRANGLED');
                                upstreams.forEach((item)=> {
                                    if (item['upstreamDsId'] === dsId) {
                                        wrangeldDsId = item['dsId'];
                                    }
                                });
                                if (wrangeldDsId !== '') {
                                    this.selectedDataSet.dsId = wrangeldDsId;
                                    this.selectedDataSet.dsType = DsType.WRANGLED;
                                    isOpen = true;
                                }
                            }

                            if (isOpen) {
                                this.changeChartClickStatus(this.selectedDataSet, true);
                                (this.datasetInfoPopupComponent) && (this.datasetInfoPopupComponent.setDataset(this.selectedDataSet));
                            }
                            this.loadingHide();

                        })
                        .catch((error) => {
                            this.loadingHide();
                            let prep_error = this.dataprepExceptionHandler(error);
                            PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
                        });
                }

                this.setDataflowName();
                this.setDataflowDesc();

            } else {
                Alert.warning(this.translateService.instant('msg.dp.alert.no.flow.info'));
            }

        }).catch((error) => {
            this.loadingHide();
            let prep_error = this.dataprepExceptionHandler(error);
            PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
        });
    } // function - getDataflow


    // 팝업끼리 관리하는 모델들 초기화
    public init() {
        this.dataflow = new PrDataflow();
        this.selectedDataSet = new PrDataset();

        // Get param from url
        this.activatedRoute.params.subscribe((params) => {
            if (params['id']) {
                this.dataflow.dfId = params['id'];
            }
            if (this.cookieService.get('SELECTED_DATASET_ID')) { // From dataset detail

                this.selectedDataSet.dsId = this.cookieService.get('SELECTED_DATASET_ID');
                let type;
                switch (this.cookieService.get('SELECTED_DATASET_TYPE')) {
                    case 'WRANGLED' :
                        type = DsType.WRANGLED;
                        break;
                    case 'IMPORTED' :
                        type = DsType.IMPORTED;
                        break;
                }
                this.selectedDataSet.dsType = type;
                this.cookieService.delete('SELECTED_DATASET_ID');
                this.cookieService.delete('SELECTED_DATASET_TYPE');
                this.closeEditRule();
            } else {
                this.getDataflow();
                if (sessionStorage.getItem('DATASET_ID')) { // From dataflow detail
                    //this.addDatasets();
                }

            }
        });
    }

    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     | Protected Method
     |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     | Private Method
     |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


    /** 데이터셋을 지우고 난 후에 init */
    public initEventAfterDelete() {
        // 데이터 형식은 유지한 상태에서 내부 내용을 지우기 위해서 각 키별 삭제 처리를 함
        for (const key in this.selectedDataSet) {
            delete this.selectedDataSet[key];
        }
        //$.extend(this.selectedDataSet, new Dataset());
        $.extend(this.selectedDataSet, new PrDataset());

        // 밖에 누르면 edit을 할 수 없다
        this.isDatasetNameEditMode = false;
        this.isDatasetDescEditMode = false;
        this.getDataflow();
    }

    /** imported dataset일 경우, wrangled dataset을 생성하는 createWrangledDataset을 호출, wrangled dataset일 경우 룰 편집 화면으로 이동
     * @param {string} data step 정보
     * */
    public datasetEventHandler(data?: string) {
        if (data) {
            this.step = data;
        } else {
            this.createWrangledDataset();
        }
    }

    /**
     * create wrangled dataset
     */
    public createWrangledDataset() {
        this.loadingShow();
        this.dataflowService.createWrangledDataset(this.selectedDataSet.dsId, this.dataflow.dfId)
            .then((result) => {
                this.loadingHide();
                if (isUndefined(result)) {
                    Alert.warning(this.translateService.instant('msg.dp.alert.rule.create.fail'));
                } else {
                    Alert.success(this.translateService.instant('msg.dp.alert.rule.create.success'));
                    // 새로운 데이터 셋 정보로 초기화 및 차트 초기화
                    this.getDataflow();

                    // wrangled dataset 생성시 열려있던 창을 닫는다
                    this.changeChartClickStatus(this.selectedDataSet, false);
                    this.selectedDataSet.dsId = '';
                }
            })
            .catch((error) => {
                this.loadingHide();
                let prep_error = this.dataprepExceptionHandler(error);
                PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
            });
    }

    public onClickPrev(): void {
        this._location.back();
    }

    /**
     * Clone dataset
     * @param event
     */
    public datasetClone(event) {
        this.loadingShow();
        if (!this.cloneFlag) {
            this.dataflowService.cloneWrangledDataset(event.dsId).then(() => {
                this.cloneFlag = true;
                this.selectedDataSet.dsId = '';
                this.getDataflow();
            }).catch(() => {
                this.loadingHide();
                Alert.warning('msg.dp.alert.clone.failed');
            })
        }
    }

    private initViewPage() {

        this.symbolInfo = {
            IMPORTED: {
                UPLOAD: {
                    DEFAULT: 'image://' + window.location.origin + '/assets/images/datapreparation/icon_db.png',
                },
                DATABASE: {
                    DEFAULT: 'image://' + window.location.origin + '/assets/images/datapreparation/icon_db.png',
                },
                STAGING_DB: {
                    DEFAULT: 'image://' + window.location.origin + '/assets/images/datapreparation/icon_db.png'
                }
            },
            WRANGLED: {
                DEFAULT: 'image://' + window.location.origin + '/assets/images/datapreparation/icon_wrangled.png',
            },
            SELECTED: {
                IMPORTED: 'image://' + window.location.origin + '/assets/images/datapreparation/icon_db_focus.png',
                WRANGLED: 'image://' + window.location.origin + '/assets/images/datapreparation/icon_dataset_focus.png'
            }
        };

        this.label = {
            normal: {
                show: true,
                position: 'bottom',
                textStyle: { color: '#000000', fontWeight: 'bold' },
                formatter(params) {
                    if (params.data.dsName.length > 20) {
                        return params.data.dsName.slice(0,20) + ' ...'
                    } else {
                        return params.data.dsName;
                    }
                }
            },
            emphasis: {
                show: true,
                position: 'bottom',
                textStyle: { color: '#000000', fontWeight: 'bold' },
                formatter(params) {
                    if (params.data.dsName.length > 20) {
                        return params.data.dsName.slice(0,20) + ' ...'
                    } else {
                        return params.data.dsName;
                    }
                }
            }
        };

        this.chartOptions = {
            backgroundColor: '#ffffff',
            tooltip: { show: false },
            xAxis: {
                type: 'value',
                max: null,
                interval: 1,
                splitLine: { show: false },
                axisLabel: { show: false },
                axisLine: { show: false },
                axisTick: { show: false }
            },
            yAxis: {
                type: 'value',
                max: null,
                interval: 1,
                inverse: true,
                splitLine: { show: false },
                axisLabel: { show: false },
                axisLine: { show: false },
                axisTick: { show: false }
            },
            series: [
                {
                    type: 'graph',
                    legendHoverLink: false,
                    layout: 'none',
                    coordinateSystem: 'cartesian2d',
                    focusNodeAdjacency: false,
                    symbolSize: 40,
                    hoverAnimation: true,
                    roam: false,
                    edgeSymbol: ['none', 'arrow'],
                    draggable: true,
                    itemStyle: { normal: { color: '#ccc', borderColor: '#1af' } },
                    nodes: null,
                    links: null,
                    lineStyle: { normal: { opacity: 1, width: 0.5 } }
                }
            ], animation: false
        };

        this.commandList = [
            { command: 'create', alias: 'Cr' },
            { command: 'header', alias: 'He' },
            { command: 'keep', alias: 'Ke' },
            { command: 'replace', alias: 'Rp' },
            { command: 'rename', alias: 'Rm' },
            { command: 'set', alias: 'Se' },
            { command: 'settype', alias: 'St' },
            { command: 'countpattern', alias: 'Co' },
            { command: 'split', alias: 'Sp' },
            { command: 'derive', alias: 'Dr' },
            { command: 'delete', alias: 'De' },
            { command: 'drop', alias: 'Dp' },
            { command: 'pivot', alias: 'Pv' },
            { command: 'unpivot', alias: 'Up' },
            { command: 'join', alias: 'Jo' },
            { command: 'extract', alias: 'Ex' },
            { command: 'flatten', alias: 'Fl' },
            { command: 'merge', alias: 'Me' },
            { command: 'nest', alias: 'Ne' },
            { command: 'unnest', alias: 'Un' },
            { command: 'aggregate', alias: 'Ag' },
            { command: 'sort', alias: 'So' },
            { command: 'move', alias: 'Mv' },
            { command: 'union', alias: 'Ui' }
        ];


    }

    /**
     * 데이터셋 초기화
     */
    private initSelectedDataSet() {
        // 데이터 형식은 유지한 상태에서 내부 내용을 지우기 위해서 각 키별 삭제 처리를 함
        for (const key in this.selectedDataSet) {
            delete this.selectedDataSet[key];
        }
        //$.extend(this.selectedDataSet, new Dataset());
        $.extend(this.selectedDataSet, new PrDataset());

        // 밖에 누르면 edit을 할 수 없다
        this.isDatasetNameEditMode = false;
        this.isDatasetDescEditMode = false;
    } // function - initSelectedDataSet

    public closeEditRule() {
        this.step = '';
        this.getDataflow(true);

    }



    /**
     * 데이터플로우 차트 Height Resize
     */
    private dataflowChartAreaResize(resizeCall?:boolean): void {
        if(resizeCall == undefined) resizeCall = false;
        // const itemMinSize: number = 64;
        const itemMinSize: number = 100;
        const hScrollbarWith: number = 30;
        const topMargin: number = 50;
        let minHeightSize: number = 600;
        if($('.ddp-wrap-flow2')!=null && $('.ddp-wrap-flow2')!=undefined){
            minHeightSize = $('.ddp-wrap-flow2').height()- topMargin;
        }
        let fixHeight: number = minHeightSize;
        if(this.dataflow!=null && this.dataflow.hasOwnProperty('wrangledDsCount') && this.dataflow.hasOwnProperty('importedDsCount')){
            let imported: number = this.dataflow.importedDsCount;
            let wrangled: number = this.dataflow.wrangledDsCount;
            if(imported == undefined) imported = 0;
            if(wrangled == undefined) wrangled = 0;
            const lImported: number = (imported * itemMinSize) + Math.floor(wrangled * itemMinSize/2);
            const lWrangled: number = (wrangled * itemMinSize) + Math.floor(imported * itemMinSize/2);
            if(lImported > minHeightSize || lWrangled > minHeightSize) {if(lImported>lWrangled) {fixHeight = lImported;}else{fixHeight = lWrangled;}}
        }
        let isRight: boolean = false;
        if($('.sys-dataflow-right-panel').width() !== null) {isRight = true;}
        const minWidthSize: number = $('.ddp-wrap-flow2').width()- hScrollbarWith;
        if(isRight) {
            $('.ddp-box-chart').css('overflow-x', 'auto');
        }else{
            $('.ddp-box-chart').css('overflow-x', 'hidden');
        }
        $('#chartCanvas').css('height', fixHeight+'px').css('width', minWidthSize+'px').css('overflow', 'hidden');
        if($('#chartCanvas').children()!=null && $('#chartCanvas').children()!=undefined){
            $('#chartCanvas').children().css('height', fixHeight+'px').css('width', minWidthSize+'px');}
        if($('#chartCanvas').children().children()!=null && $('#chartCanvas').children().children()!=undefined) {
            $('#chartCanvas').children().children().css('height', fixHeight+'px').css('width', minWidthSize+'px');}

        if (resizeCall == true && this.chart != null) {this.chart.resize();}
    }

    /**
     * 차트 초기화
     */
    private initChart() {

        this.chart = echarts.init(this.$element.find('#chartCanvas')[0]);
        this.chart.clear();
        // this.chart.setVi

        this.chartNodes = [];
        this.chartLinks = [];
        this.depthCount = 0;
        this.rootCount = 0;

        // 최상위 노드 탐색
        this.dataSetList.forEach(item => {
            const rootDataset = this.findRootDataset(item, this.dataSetList);
            if (rootDataset.dsId !== item.dsId) {
                item.rootDataset = rootDataset;
            }
        });

        this.createNodeTree(this.dataSetList);

        // 중복 제거 - 원래 생성되는 배열을 보존하기 위해서 createNodeTree()는 원형대로 놓아둠
        this.chartNodes = this.chartNodes.filter(function (elem, index, self) {
            for (let dsIdx in self) {
                if (self[dsIdx].dsId === elem.dsId) {
                    if (dsIdx === index.toString()) {
                        return true;
                    }
                    break;
                }
            }
            return false;
        });

        this.chartSpacing(this.chartNodes, this.chartLinks);

        // 하위 노드 위치 조정 ( 최상위 노드에 맞춰 정렬되도록 변경 )
        this.chartNodes.forEach(item1 => {
            if (item1.rootValue) {
                const rootDsNode = this.chartNodes.filter(item2 => item2.dsId === item1.rootDataset.dsId)[0];
                if (item1.value[1] < rootDsNode.value[1]) {
                    const itemIdx = this.chartNodes
                        .filter(item2 => item2.rootDataset && item2.rootDataset.dsId === item1.rootDataset.dsId)
                        .findIndex(item2 => item2.dsId === item1.dsId);
                    item1.value[1] = rootDsNode.value[1] + itemIdx;
                }
            }
        });

        this.chartOptions.xAxis.max = this.depthCount > 5 ? 5 + (this.depthCount - 5) : 5;
        this.chartOptions.yAxis.max = this.rootCount > 5 ? 5 + (this.rootCount - 5) : 5;
        this.chartOptions.series[0].nodes = this.chartNodes;
        this.chartOptions.series[0].links = this.chartLinks;
        this.chart.setOption(this.chartOptions);
        this.chartClickEventListener(this.chart);
        this.cloneFlag = false;
        this.chart.resize();

        let $chart = this;

        $(window).off('resize');
        $(window).on('resize', function (event) {
            $chart.dataflowChartAreaResize(true);
        });
    } // function - initChart



    /**
     * 특정 데이터셋의 최상위 데이터셋 정보를 탐색한다
     * @param {Dataset} node
     * @param {Dataset[]} nodeList
     * @returns {Dataset}
     */
    //private findRootDataset(node: Dataset, nodeList: Dataset[]) {
    private findRootDataset(node: PrDataset, nodeList: PrDataset[]) {
        if (0 === node.upstreamDsIds.length && node.dsType === DsType.IMPORTED) {
            return node;
        } else {
            const result = nodeList
                .filter(item => -1 !== node.upstreamDsIds.indexOf(item.dsId))
                .map(item => this.findRootDataset(item, nodeList));
            return (result && 0 < result.length) ? result[0] : node;
        }
    } // function - findRootDataset

    /**
     * 차트 전체 노드 구조 생성
     * @param nodeList
     */
    private createNodeTree(nodeList) {

        // root노드
        const rootNodeList = nodeList.filter(node => (node.upstreamDsIds.length === 0));

        const wrangledRootNodeList = nodeList.filter((node) => {
            return _.eq(node.dsType, 'WRANGLED') && !_.eq(node.creatorDfId, this.dataflow.dfId);
        });

        // 각 root로 부터 파생되는 노드를 순차적으로 생성
        _.concat(rootNodeList, wrangledRootNodeList).map((node) => {
            const rootNode = this.createNode(node, 0, this.rootCount);
            this.rootCount += 1;
            this.setChildNode(nodeList, rootNode, rootNode);
        });

    } // function - createNodeTree

    /**
     * 차트 노드 생성
     * @param dataset
     * @param depth
     * @param position
     * @param {Dataset} rootNode
     * @returns {{dsId: (string | any); dsName: (string | any); name: (string | any); dsType; importType: any; detailType: any; flowName: any; upstream: any; children: Array; value: any[]; symbol: any; originSymbol: any; label: any}}
     */
    //private createNode(dataset: Dataset, depth: number, position: number, rootNode?: any) {
    private createNode(dataset: PrDataset, depth: number, position: number, rootNode?: any) {
        let importType: ImportType = null;
        let detailType = null;
        let flowName = null;

        // if (DsType.IMPORTED === dataset.dsType) {
        //   importType = dataset.importType;
        //   detailType = isUndefined(dataset.custom) ? 'DEFAULT' : JSON.parse(dataset.custom);
        //   if (ImportType.DB === importType || ImportType.HIVE === importType) {
        //     detailType = detailType.connType || 'DEFAULT';
        //   } else if (ImportType.FILE === importType) {
        //     detailType = detailType.fileType || 'DEFAULT';
        //   }
        // } else {
        //   detailType = _.eq(dataset.creatorDfId, this.dataflow.dfId) ? 'CURR' : 'DIFF';
        //   flowName = dataset.creatorDfId;
        // }

        flowName = dataset.creatorDfId;
        importType = dataset.importType;
        detailType = 'DEFAULT';

        const nodeSymbol = DsType.IMPORTED === dataset.dsType ? this.symbolInfo[dataset.dsType][importType][detailType] : this.symbolInfo[dataset.dsType][detailType];

        const node = {
            dsId: dataset.dsId,
            dsName: dataset.dsName,
            name: dataset.dsId,
            dsType: dataset.dsType,
            importType: importType != null ? importType : undefined,
            detailType: detailType != null ? detailType : undefined,
            flowName: flowName != null ? flowName : undefined,
            upstream: dataset.upstreamDsIds,
            children: [],
            value: [depth, position],
            symbol: nodeSymbol,
            originSymbol: _.cloneDeep(nodeSymbol),
            label: this.label
        };
        if (rootNode) {
            node['rootDataset'] = dataset['rootDataset'];
            node['rootValue'] = rootNode['value'];
        }

        // 차트 정보에 들어갈 노드 추가
        this.chartNodes.push(node);

        return node;
    } // function - createNode

    /**
     * 하위 노드 설정
     * @param nodeList
     * @param parent
     * @param rootNode
     */
    private setChildNode(nodeList, parent, rootNode) {
        const childNodeList = nodeList.filter((node) => {
            return node.upstreamDsIds.indexOf(parent.dsId) > -1 && _.eq(node.creatorDfId, this.dataflow.dfId);
        });
        childNodeList.map((child, idx) => {
            const depth = parent.value[0] + 1;
            const position = parent.value[1] + idx;
            this.rootCount = this.rootCount <= position ? position + 1 : this.rootCount;

            // 차트 정보에 들어갈 노드 추가
            const childData = this.createNode(child, depth, position, rootNode);

            // 차트 정보에 들어갈 링크 추가
            const link = {
                source: parent.dsId,
                target: childData.dsId
            };
            if (parent.value[1] !== position) {
                link['lineStyle'] = {
                    normal: {
                        curveness: -0.2
                    }
                };
            }
            this.chartLinks.push(link);
            this.setChildNode(nodeList, childData, rootNode);
        });
    } // function - setChildNode

    /**
     * 차트 공백 설정
     * @param chartNodes
     * @param chartLinks
     */
    private chartSpacing(chartNodes, chartLinks) {
        for (let idx in chartNodes) {
            let node = chartNodes[idx];

            let upstreams = chartLinks.filter(function (l) {
                if (l.target === node.dsId) {
                    return true;
                }
            });

            if (0 < upstreams.length) {
                let maxDepth = 0;
                upstreams.forEach(function (l) {
                    let n = chartNodes.find(function (n) {
                        if (n.dsId === l.source) {
                            return true;
                        }
                    });
                    if (maxDepth < n.value[0]) {
                        maxDepth = n.value[0];
                    }
                });
                let diffDepth = maxDepth - node.value[0] + 1;
                if (0 < diffDepth) {
                    let depth = node.value[0];
                    let position = node.value[1];
                    chartNodes.forEach(function (n) {
                        if (position == n.value[1] && depth <= n.value[0]) {
                            n.value[0] += diffDepth;
                        }
                    });
                }
            }
        }
    } // function - chartSpacing

    /**
     * 차트 노드 클릭 이벤트 리스너
     * @param chart
     */
    private chartClickEventListener(chart) {
        const symbolInfo = this.symbolInfo;


        chart.off('click');
        chart.on('click', (params) => {

            this.initSelectedDataSet();
            if (params && params.dataType && params.dataType === 'node') {
                this.selectedDataSet.dsId = params.data.dsId;
            } else {
                this.isDataflowsShow = false;
            }

            const clearSelectedNodeEffect = (() => {
                option.series[0].nodes.map((node) => {
                    node.symbol = _.cloneDeep(node.originSymbol);
                });
            });

            const option = chart.getOption();
            if (params === null) {
                clearSelectedNodeEffect();
            } else {
                option.series[params.seriesIndex].nodes.map((node, idx) => {
                    if (_.eq(idx, params.dataIndex) && params.data.detailType) {
                        node.symbol = symbolInfo.SELECTED[params.data.dsType];
                    } else {
                        node.symbol = _.cloneDeep(node.originSymbol);
                    }
                });
            }
            chart.setOption(option);

            if (!StringUtil.isEmpty(this.selectedDataSet.dsId) && this.datasetInfoPopupComponent) {
                 // 컴포넌트가 열려있는 상태에서 데이터를 설정해주기 위함
                 this.datasetInfoPopupComponent.setDataset(this.selectedDataSet);
            }

            setTimeout( () => {
                this.dataflowChartAreaResize();
            }, 600);

        });
    } // function - chartClickEventListener


}

class SwapParam {
    oldDsId : string;
    newDsId : string;
    dfId : string;
    wrangledDsId? : string;
    dsList? : string[];
}
