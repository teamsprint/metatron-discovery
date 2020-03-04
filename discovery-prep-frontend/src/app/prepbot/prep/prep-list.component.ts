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

import {Component, ElementRef, HostListener, Injector, OnChanges, ViewChild} from '@angular/core';
import {AbstractComponent} from '../../common/component/abstract.component';
import {DataflowService} from './service/dataflow.service';
import {PrDataflow} from '../../domain/data-preparation/pr-dataflow';
import {isNullOrUndefined} from "util";
import {StringUtil} from "../../common/util/string.util";
import {ActivatedRoute} from "@angular/router";
import * as _ from 'lodash';
import {PrepPopCreateComponent} from "./create-dataset/prep-pop-create.component";
import {PrepPopFlowCreateComponent} from "./create-dataflow/prep-pop-flow-create.component";
import {PrepPopConnectionCreateComponent} from "./create-connection/prep-pop-connection-create.component";
import {DatasetService} from "./service/dataset.service";
import {DsType, PrDataset} from "../../domain/data-preparation/pr-dataset";
import {PrepbotService, SelectType, ViewMode} from "../service/prepbot.service";
import {PreparationCommonUtil} from "../util/preparation-common.util";
import {PrDataSnapshot} from "../../domain/data-preparation/pr-snapshot";
import {SnapshotService} from "./service/snapshot.service";

import Masonry from 'masonry-layout';

@Component({
  selector: 'prep-list',
  templateUrl: './prep-list.component.html',
  host: { '[class.pb-page-intro]': 'true' },
  styles: ['td span {color:#737373}']
})
export class PrepListComponent extends AbstractComponent {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // 검색 파라메터
  private _searchParams: { [key: string]: string };

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public ViewMode = ViewMode;

  // 프로필 기본 이미지 경로
  public defaultProfileImageSrc = '../../assets/images/img_photo.png';

  public prepCommonUtil = PreparationCommonUtil;
  public DsType = DsType;

  public list: any[];

  public dataflows : PrDataflow[];
  public datasets : PrDataset[];
  public datasnapshots: PrDataSnapshot[];

  public SelectType = SelectType;
  public selectType: SelectType = SelectType.ALL;
  public isShowSelectType:boolean = false

  // search text
  public searchText: string;

  // create step
  public mode: string;

  // 정렬
  public selectedContentSort: Order = new Order();

  @ViewChild(PrepPopCreateComponent)
  public prepPopCreateComponent : PrepPopCreateComponent;

  @ViewChild(PrepPopFlowCreateComponent)
  public prepPopFlowCreateComponent : PrepPopFlowCreateComponent;

  @ViewChild(PrepPopConnectionCreateComponent)
  public prepPopConnectionCreateComponent : PrepPopConnectionCreateComponent;

  @ViewChild('selectTypeSelectBox')
  private _selectTypeSelectBox: ElementRef

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private _dataflowService: DataflowService,
              private _datasetService: DatasetService,
              private _dataSnapshotService: SnapshotService,
              private _prepbotService: PrepbotService,
              public elementRef: ElementRef,
              public injector: Injector,
              private activatedRoute: ActivatedRoute) {

    super(elementRef, injector);

    // pathVariable
    // this.activatedRoute.params.subscribe((params) => {
    //
    //   // tabId가 tabList에 없는경우
    //   // if (-1 === _.findIndex(this.tabList, { id: params['tabId'] })) {
    //
    //     // members페이지로 redirect
    //     // this.router.navigateByUrl('/admin/workspaces/shared');
    //   // }
    //
    //   // 탭 아이디를 설정
    // });
  }

  @HostListener('document:click', ['$event'])
  public onClick(event: MouseEvent) {
    if (!this._selectTypeSelectBox.nativeElement.contains(event.target)) {
      this.isShowSelectType = false
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public ngOnInit() {
    super.ngOnInit();
    this._initView();

    this.subscriptions.push(
      // Get query param from url
      this.activatedRoute.queryParams.subscribe((params) => {
        if (!_.isEmpty(params)) {
          if (!isNullOrUndefined(params['backFromDetail'])) {
            if( params['backFromDetail']==='true' ) {
              params = this._prepbotService.getParamsForPrepbotList();
            }
          }
          if (!isNullOrUndefined(params['size'])) {
            this.page.size = params['size'];
          }
          if (!isNullOrUndefined(params['page'])) {
            this.page.page = params['page'];
          }

          if (!isNullOrUndefined(params['searchText'])) {
            this.searchText = params['searchText'];
          }
          const sort = params['sort'];
          if (!isNullOrUndefined(sort)) {
            const sortInfo = decodeURIComponent(sort).split(',');
            this.selectedContentSort.key = sortInfo[0];
            this.selectedContentSort.sort = sortInfo[1];
          }
        }
        this._getPrepList();
        this.changeDetect.detectChanges();
      })
    );
  }

  // Destory
  public ngOnDestroy() {
    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * detail로 이동
   * @param event
   */
  public goToDetail() {
    this.router.navigate(['/prepbot/dataflow']).then();
  }

  public toggleViewMode(viewMode){
    this._prepbotService.setMainViewMode(viewMode)
  }

  /**
   * 페이지를 새로 불러온다.
   * @param {boolean} isFirstPage
   */
  public reloadPage(isFirstPage: boolean = true) {
    (isFirstPage) && (this.page.page = 0);
    this._searchParams = this._getPrepParams();
    this.router.navigate(
        [this.router.url.replace(/\?.*/gi, '')],
        {queryParams: this._searchParams, replaceUrl: true}
    ).then();
  } // function - reloadPage


  /**
   * Search dataflow
   * @param event
   */
  public searchDataflows(event) {
    if (13 === event.keyCode || 27 === event.keyCode) {
      if (event.keyCode === 27) {
        this.searchText = '';
      }
      this.reloadPage();
    }
  }


  /**
   * Move to dataflow detail
   * @param dfId
   */
  public goToDfDetail(item) {
    if (this.isDataflow(item)) {
      const params = this._getPrepParams();
      this._prepbotService.setParamsForPrepbotList(params);
      this.router.navigate(
        ['/management/prepbot/dataflow', item.dfId])
        .then();
    }

  }

  /**
   * 모드 변경
   * @param {string} mode
   */
  public changeMode(mode: string) {
    this.useUnloadConfirm = ('prep-pop-create' === mode);
    if ('prep-pop-create' === mode ) {
       if (this.prepPopCreateComponent) {
           this.prepPopCreateComponent.init();
       }
       console.log(this.prepPopCreateComponent);
    } else if ('prep-pop-flow-create' === mode ) {
        if (this.prepPopFlowCreateComponent) {
          this.prepPopFlowCreateComponent.init();
        }
        console.log(this.prepPopFlowCreateComponent);
    } else if ('prep-pop-connection-create' === mode ) {
      if (this.prepPopConnectionCreateComponent) {
        this.prepPopConnectionCreateComponent.init();
      }
      console.log(this.prepPopConnectionCreateComponent);
    }
    this.mode = mode;
  } // function - changeMode

  /**
   * 생성 완료
   */
  public createComplete(): void {
    this.changeMode('');
    // true
    this.reloadPage();
  }

  /**
   * Change order of list
   * @param key
   */
  public changeOrder(key: string) {
    /// 초기화
    this.selectedContentSort.sort = this.selectedContentSort.key !== key ? 'default' : this.selectedContentSort.sort;
    // 정렬 정보 저장
    this.selectedContentSort.key = key;
    if (this.selectedContentSort.key === key) {
      // asc, desc
      switch (this.selectedContentSort.sort) {
        case 'asc':
          this.selectedContentSort.sort = 'desc';
          break;
        case 'desc':
          this.selectedContentSort.sort = 'asc';
          break;
        case 'default':
          this.selectedContentSort.sort = 'desc';
          break;
      }
    }
  }

  public changeSelectType(selectType: SelectType) {
    event.stopPropagation();
    event.preventDefault();

    this.selectType = selectType;
    this._getPrepList();
    this.isShowSelectType = false;
    this.changeDetect.detectChanges();
  }

  public get isCardView() {
    return this._prepbotService.getMainViewMode() === ViewMode.CARD;
  }

  public get isListView() {
    return this._prepbotService.getMainViewMode() === ViewMode.LIST;
  }


  public isDataflow(item: any): boolean {
    return !isNullOrUndefined(item.dfId) && isNullOrUndefined(item.ssId)
  }

  public isDataset(item: any): boolean {
    return !isNullOrUndefined(item.dsId) && isNullOrUndefined(item.ssId)
  }

  public isDataresult(item: any): boolean {
    return !isNullOrUndefined(item.ssId)
  }

  /**
   * Get elapsed day
   * @param item
   */
  public getElapsedDay(item) {
    if (isNullOrUndefined(item) || isNullOrUndefined(item.elapsedTime) ) {
      return 0;
    }
    return item.elapsedTime.days;
  }

  public getDataresultDestination(item) {
    if (item.storedUri) {
      const fileType : string = this.prepCommonUtil.getExtensionForSnapshot(item.storedUri);
      return `${this.prepCommonUtil.getSnapshotType(item.ssType)} (${fileType.toUpperCase()})`;
    } else {
      return `${this.prepCommonUtil.getSnapshotType(item.ssType)} / ${item.dbName} / ${item.tblName}`;
    }


  }


  /**
   * Returns formatted elapsed time
   * hour:minute:second.millisecond
   * @param item
   */
  public getElapsedTime(item: PrDataSnapshot) {

    if (isNullOrUndefined(item) ||
      isNullOrUndefined(item.elapsedTime) ||
      isNullOrUndefined(item.elapsedTime.hours) ||
      isNullOrUndefined(item.elapsedTime.minutes) ||
      isNullOrUndefined(item.elapsedTime.seconds) ||
      isNullOrUndefined(item.elapsedTime.milliseconds)
    ) {
      return '--:--:--';
    }
    return `${this.prepCommonUtil.padLeft(item.elapsedTime.hours)}:${this.prepCommonUtil.padLeft(item.elapsedTime.minutes)}:${this.prepCommonUtil.padLeft(item.elapsedTime.seconds)}.${this.prepCommonUtil.padLeft(item.elapsedTime.milliseconds)}`;
  }

  //
  // /**
  //  * Create new dataflow
  //  */
  // public createDataflow() {
  //     //TODO
  //     // this.prepPopCreateComponent.init();
  // }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private _getPrepList() {
    this.loadingShow();
    const promise = [];
    if (this.selectType === SelectType.ALL || this.selectType === SelectType.DATAFLOW) {
      promise.push(this._getDataflows());
    }
    if (this.selectType === SelectType.ALL || this.selectType === SelectType.DATASETS) {
      promise.push(this._getDatasets());
    }
    if (this.selectType === SelectType.ALL || this.selectType === SelectType.DATARESULTS) {
      promise.push(this._getDataresults())
    }


    Promise.all(promise).then((result) => {
      console.info('promise finish -->', result);
      this._searchParams = this._getPrepParams();

      this.list = [];
      this.dataflows = [];
      this.datasets = [];
      this.datasnapshots = [];

      let dataflowList = [];
      let datasetList = [];
      let dataresultList = [];
      let dataconnectionList = [];

      if (this.selectType === SelectType.ALL) {
        dataflowList = result[0];
        datasetList = result[1];
        dataresultList = result[2];
        //dataconnectionList = result[3];
      } else if (this.selectType === SelectType.DATAFLOW) {
        dataflowList = result[0];
      } else if (this.selectType === SelectType.DATASETS) {
        datasetList = result[0];
      } else if (this.selectType === SelectType.DATARESULTS) {
        dataresultList = result[0];
      } else if (this.selectType === SelectType.DATACONNECTION) {
        //dataconnectionList = result[0];
      }
      this.loadingHide();

      this.dataflows = dataflowList['_embedded']? this.dataflows.concat(dataflowList['_embedded']['preparationdataflows']) : [];
      this.datasets = datasetList['_embedded'] ? this.datasets.concat(datasetList['_embedded']['preparationdatasets']) : [];
      this.datasnapshots = dataresultList['_embedded'] ? this.datasnapshots.concat(dataresultList['_embedded']['preparationsnapshots']) : [];

      this.list = this.list.concat(this.dataflows).concat(this.datasets).concat(this.datasnapshots);
      this.list = this.list.sort(function (left, right) {
        const leftTime = Date.parse(left.modifiedTime);
        const rightTime = Date.parse(right.modifiedTime);
        if (NaN == rightTime) {
          return 1;
        } else if (NaN == leftTime) {
          return -1;
        }
        return leftTime < rightTime ? 1 : leftTime > rightTime ? -1 : 0;
      });

      setTimeout(()=> {
        new Masonry( '.pb-wrap-main', {
          itemSelector: '.pb-box-main',
          horizontalOrder: true
        })
      })

    }).catch((err) => {
      console.log(err)
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

  private _getPrepParams(): any {
    const params = {
      page: this.page.page,
      size: 100,
      pseudoParam : (new Date()).getTime()
    };

    if (!isNullOrUndefined(this.searchText) || StringUtil.isNotEmpty(this.searchText)) {
      params['searchText'] = this.searchText;
    }

    this.selectedContentSort.sort !== 'default' && (params['sort'] = this.selectedContentSort.key + ',' + this.selectedContentSort.sort);

    return params;
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


  /**
   * Initialise values
   * @private
   */
  private _initView() {
    this.searchText = '';
    this.selectedContentSort.sort = 'desc';
    this.selectedContentSort.key = 'modifiedTime';
  }

}

class Order {
  key: string = 'createdTime';
  sort: string = 'default';
}
