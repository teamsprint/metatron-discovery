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
// import { Component, ElementRef, Injector } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import * as _ from 'lodash';
// import { AbstractComponent } from '../../common/component/abstract.component';
// import {DataflowService} from '../dataflow/service/dataflow.service';
// import {isNullOrUndefined} from "util";
// import {Alert} from "../../common/util/alert.util";
// import {PrDataflow} from "../../domain/data-preparation/pr-dataflow";
// import {StringUtil} from "../../common/util/string.util";

import {Component, ElementRef, HostListener, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AbstractComponent} from '../../common/component/abstract.component';
import {DataflowService} from '../dataflow/service/dataflow.service';
import {PrDataflow} from '../../domain/data-preparation/pr-dataflow';
import {Modal} from '../../common/domain/modal';
import {Alert} from '../../common/util/alert.util';
import {MomentDatePipe} from '../../common/pipe/moment.date.pipe';
import {isNullOrUndefined} from "util";
import {StringUtil} from "../../common/util/string.util";
import {ActivatedRoute} from "@angular/router";
import * as _ from 'lodash';
import {PrepPopCreateComponent} from "./prep-pop-create.component";


const DEFAULT_VIEW_TYPE = 'CARD';

@Component({
  selector: 'prep-list',
  templateUrl: './prep-list.component.html'
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

  // 프로필 기본 이미지 경로
  public defaultProfileImageSrc = '../../assets/images/img_photo.png';

  public dataflows : PrDataflow[];

  // search text
  public searchText: string;

  // 뷰타입 LIST, CARD
  public viewMode = DEFAULT_VIEW_TYPE;

  // 정렬
  public selectedContentSort: Order = new Order();

  @ViewChild(PrepPopCreateComponent)
  public prepPopCreateComponent : PrepPopCreateComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
    constructor(private dataflowService: DataflowService,
              protected elementRef: ElementRef,
              protected injector: Injector,
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
                            params = this.dataflowService.getParamsForDataflowList();
                        }
                    }

                    if (!isNullOrUndefined(params['size'])) {
                        this.page.size = params['size'];
                    }

                    if (!isNullOrUndefined(params['page'])) {
                        this.page.page = params['page'];
                    }


                    if (!isNullOrUndefined(params['dfName'])) {
                        this.searchText = params['dfName'];
                    }

                    const sort = params['sort'];
                    if (!isNullOrUndefined(sort)) {
                        const sortInfo = decodeURIComponent(sort).split(',');
                        this.selectedContentSort.key = sortInfo[0];
                        this.selectedContentSort.sort = sortInfo[1];
                    }
                }

                this.getDataflows();
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
      this.router.navigate(
          ['/prepbot/dataflow'])
          .then();
  }

  public toggleViewMode(viewMode){
      this.viewMode = viewMode;
      if ('grid' === this.viewMode) {
          // this.updateGrid(this.rightDataset.gridData, this.rightGrid).then(() => {
          //     this.rightSelCols.forEach(colName => this.rightGrid.columnSelection(colName));
          // });
      }
  }

    /**
     * 페이지를 새로 불러온다.
     * @param {boolean} isFirstPage
     */
    public reloadPage(isFirstPage: boolean = true) {
        (isFirstPage) && (this.page.page = 0);
        this._searchParams = this._getDfParams();
        this.router.navigate(
            [this.router.url.replace(/\?.*/gi, '')],
            {queryParams: this._searchParams, replaceUrl: true}
        ).then();
    } // function - reloadPage



    /**
   * Fetch dataflow list
   */
  public getDataflows() {

      this.loadingShow();

      this.dataflows = [];

      const params = this._getDfParams();

      this.dataflowService.getDataflowList(params).then((data) => {

          // 현재 페이지에 아이템이 없다면 전 페이지를 불러온다
          let nullOrUndefined = isNullOrUndefined(data['_embedded']);
          let preparationdatasets = data['_embedded'].preparationdatasets;

          if (this.page.page > 0 &&
              (nullOrUndefined || (!nullOrUndefined && preparationdatasets && preparationdatasets.length === 0)))
          {
              this.page.page = data['page'].number - 1;
              this.getDataflows();
          }

          this._searchParams = params;

          this.pageResult = data['page'];

          this.dataflows = data['_embedded']? this.dataflows.concat(data['_embedded']['preparationdataflows']) : [];

          this.loadingHide();

      }).catch((error) => {

          this.loadingHide();

          if(error.status && error.status===500) {
              Alert.error(error.message);
          } else {
              Alert.warning(error.message);
          }

      });
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
            this.reloadPage();
        }
    }


    /**
     * Move to dataflow detail
     * @param dfId
     */
    public goToDfDetail(dfId) {
        const params = this._getDfParams();
        this.dataflowService.setParamsForDataflowList(params);
        this.router.navigate(
            ['/management/prepbot/dataflow',dfId])
            .then();
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

    /**
     * Create new dataflow
     */
    public createDataflow() {
        this.prepPopCreateComponent.init();
    }

    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     | Protected Method
     |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


    /**
     * Returns parameter for dataflow list
     * @private
     */
    private _getDfParams(): any {
        const params = {
            page: this.page.page,
            size: this.page.size,
            projection: 'forListView',
            pseudoParam : (new Date()).getTime()
        };

        if (!isNullOrUndefined(this.searchText) || StringUtil.isNotEmpty(this.searchText)) {
            params['dfName'] = this.searchText;
        }

        this.selectedContentSort.sort !== 'default' && (params['sort'] = this.selectedContentSort.key + ',' + this.selectedContentSort.sort);

        return params;
    }

    /**
     * Initialise values
     * @private
     */
    private _initView() {
        this.dataflows = [];
        this.searchText = '';
        this.selectedContentSort.sort = 'desc';
        this.selectedContentSort.key = 'createdTime';
    }

}

class Order {
    key: string = 'createdTime';
    sort: string = 'default';
}
