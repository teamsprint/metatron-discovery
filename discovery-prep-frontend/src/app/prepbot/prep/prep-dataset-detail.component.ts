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

import {Component, ElementRef, HostListener, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AbstractComponent} from '../../common/component/abstract.component';
import {DataflowService} from '../dataflow/service/dataflow.service';
import {ActivatedRoute} from "@angular/router";
import {EditRuleGridComponent} from "../dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule-grid/edit-rule-grid.component";
import {PreparationAlert} from "../util/preparation-alert.util";
import {PreparationCommonUtil} from "../util/preparation-common.util";
import {isNullOrUndefined, isUndefined} from "util";
import {Alert} from "../../common/util/alert.util";
import {PrDataset} from "../../domain/data-preparation/pr-dataset";
import {Location} from "@angular/common";

@Component({
    selector: 'prep-dataset-detail',
    templateUrl: './prep-dataset-detail.component.html'
})
export class PrepDatasetDetailComponent extends AbstractComponent {

  @ViewChild(EditRuleGridComponent)
  private _editRuleGridComp: EditRuleGridComponent;

  public dsId: string;

  public selectedDataSet: PrDataset;
  // 현재 서버와 맞는 index
  public serverSyncIndex: number;
  public isAggregationIncluded: boolean = false;

  public ruleList: any[] = [];


  // 생성자
  constructor(private _dataflowService: DataflowService,
              private _location: Location,
              private activatedRoute: ActivatedRoute,
              protected elementRef: ElementRef,
              protected injector: Injector) {
      super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public ngOnInit() {
    this.activatedRoute.params.subscribe((params) => {
      this.dsId = params['id'];
    });

    this._getDataset();

    super.ngOnInit();
  }

  // Destory
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  public onClickPrev(): void {
    this._location.back();
  }

  /**
   * Get dataset info (API)
   * @private
   */
  private _getDataset() {
    this._dataflowService.getDataset(this.dsId).then(result => {
      console.log(result)
      this._setEditRuleInfo({op:'INITIAL', ruleIdx: null, count: 100, offset: 0}).then((data)=> {
        console.log(data)
      })
    }).catch((err) => console.error(err));
  }

  /**
   * Set rule list
   */
  private setRuleList(rules: any) {
    this.ruleList = rules;
  }

  private _setEditRuleInfo( params : any ): Promise<any> {
    this.loadingShow();

    this.safelyDetectChanges();

    return this._editRuleGridComp.init(this.dsId, params)
      .then((data: { apiData: any, gridData: any }) => {

        if (isNullOrUndefined(data.apiData)) {

          // remove ` from field name when error
          this.selectedDataSet.gridData.fields.filter((item) => {
            return item.name =  item.name.replace(/`/g, '');
          });

          return {
            error : data['error']
          }
        }
        const apiData = data.apiData;
        this.serverSyncIndex = data.apiData.ruleCurIdx;

        if (apiData.errorMsg) {
          this.loadingHide();
          Alert.warning(this.translateService.instant('msg.dp.alert.ds.retrieve.fail'));
        } else {

          this.selectedDataSet = apiData;
          this.selectedDataSet.gridData = data.gridData;
          this.selectedDataSet.dsId = this.dsId;
          //this.selectedDataSet.dsName = this.dsName;

          // Set rule list
          this.setRuleList(apiData['transformRules']);
          this.isAggregationIncluded = this._hasAggregation();

          this.loadingHide();
        }

        return data;
      })
  } // function - _setEditRuleInfo

  /**
   * Check if rule list contains aggregate rule
   * returns true is rule list contains aggregate rule
   * @returns {boolean}
   */
  private _hasAggregation() {

    // clone ruleList
    let rules = [...this.ruleList];

    // Only use up to serverSyncIndex
    rules = rules.splice(0,this.serverSyncIndex+1);

    const idx: number = rules.findIndex((item) => {
      return item.valid && item.command === 'aggregate';
    });
    return !(idx === -1);
  }


}