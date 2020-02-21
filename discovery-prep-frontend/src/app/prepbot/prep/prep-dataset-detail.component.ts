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
import {PrDataset, Rule} from "../../domain/data-preparation/pr-dataset";
import {Location} from "@angular/common";
import {PrDataflow} from "../../domain/data-preparation/pr-dataflow";

@Component({
    selector: 'prep-dataset-detail',
    templateUrl: './prep-dataset-detail.component.html'
})
export class PrepDatasetDetailComponent extends AbstractComponent {

  @ViewChild(EditRuleGridComponent)
  private _editRuleGridComp: EditRuleGridComponent;

  public dfId: string;
  public dsId: string;

  public dataFlow: PrDataflow
  public dataSet: PrDataset

  public dfName: string;
  public dsName: string;

  public selectedDataSet: PrDataset;
  // 현재 서버와 맞는 index
  public serverSyncIndex: number;
  public isAggregationIncluded: boolean = false;

  // Rules
  public ruleVO: Rule = new Rule();
  public ruleList: any[] = [];
  public isJumped: boolean = false;
  public redoable: boolean = false;
  public undoable: boolean = false;

  // Flag for undo and redo, to stop users from multiple requests
  public isRedoRunning: boolean = false;
  public isUndoRunning: boolean = false;

  // Add rule / editor or builder
  public editorUseFlag: boolean = false;
  public editorUseLabel: string = this.translateService.instant('msg.dp.btn.switch.editor');

  // input cmd line
  public inputRuleCmd: string = ''; // Rule을 직접 입력시

  // input focus 여부
  public isFocus = false;

  // 툴팁 show/hide
  public isTooltipShow = false;

  // Flag for mouse movement and keyboard navigation
  public flag: boolean = false;

  // 룰 수정시 다른 룰로 바꾸면 append 되는것을 막기위한 변수 - 몇번째 룰을 편집하는지 갖고있는다
  public ruleNo: any;

  // Join / Union 편집용 룰문자열
  public editJoinOrUnionRuleStr: string;

  public commandList: any[];


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
      this.dsId = params['dsId'];
      this.dfId = params['dfId'];
    });

    this._initialiseValues();
    this._getDataflowAndDataset();

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
   * Get dataflow info (API)
   * @private
   */
  private _getDataflow() {
    return new Promise<any>((resolve, reject) => {
      this._dataflowService.getDataflow(this.dfId).then(result => {
        resolve(result);
      }).catch((err) => reject(err));
    });
  }


  /**
   * Get dataset info (API)
   * @private
   */
  private _getDataset() {
    return new Promise<any>((resolve, reject) => {
      this._dataflowService.getDataset(this.dsId).then(result => {
        resolve(result);
      }).catch((err) => reject(err));
    });
  }


  /**
   * Get dataflow and dataset info from server (promise)
   * @private
   */
  private _getDataflowAndDataset() {
    const promise = [];
    promise.push(this._getDataflow());
    promise.push(this._getDataset());

    Promise.all(promise).then((result) => {
      console.info('promise finish -->', result);
      this.dataFlow = result[0];
      this.dataSet = result[1];

      this.dfName = result[0].dfName;
      this.dsName = result[1].dsName;

      // set rule
      if (this.selectedDataSet && this.selectedDataSet.rules && this.selectedDataSet.rules.length > 0) {
        this.setRuleList(this.selectedDataSet.rules);
        this.isAggregationIncluded = this._hasAggregation();
      }

      // init ruleVO
      this.ruleVO.command = '';

      this._setEditRuleInfo({op: 'INITIAL', ruleIdx: null, count: 100, offset: 0}).then((data) => {

        if (data['error']) {
          let prep_error = this.dataprepExceptionHandler(data['error']);
          PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
          return;
        }

        this.serverSyncIndex = data.apiData.ruleCurIdx;
      });

    }).catch(() => {
      // 로딩 종료
      this.loadingHide();
    });
  }

  /**
   * Set rule list
   */
  private setRuleList(rules: any) {
    this.ruleList = [];

    const commandNames = [];
    this.commandList.forEach((command) => {
      commandNames.push(command.command);
    });

    // ruleStringInfos
    rules.forEach((rule) => {
      rule['ruleVO'] = JSON.parse(rule['jsonRuleString']);
      rule['ruleVO']['command'] = rule['ruleVO']['name'];
      rule['ruleVO']['ruleNo'] = rule['ruleNo'];

      const idx = commandNames.indexOf(rule['ruleVO'].command);
      if (idx > -1) {
        rule['command'] = this.commandList[idx].command;
        rule['alias'] = this.commandList[idx].alias;
        rule['desc'] = this.commandList[idx].desc;

        if (rule.shortRuleString) {
          rule['simplifiedRule'] = rule.shortRuleString
        } else {
          const ruleStr = PreparationCommonUtil.simplifyRule(rule['ruleVO'], this.selectedDataSet.gridResponse.slaveDsNameMap, rule.ruleString)
          if (!isUndefined(ruleStr)) {
            rule['simplifiedRule'] = ruleStr;
          } else {
            rule['simplifiedRule'] = rule.ruleString;
          }
        }
      } else {
        rule['simplifiedRule'] = rule.shortRuleString ? rule.shortRuleString : rule.ruleString;
        rule['command'] = 'Create';
        rule['alias'] = 'Cr';
        rule['desc'] = '';
      }
      this.ruleList.push(rule);
    });
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

  private _initialiseValues() {
    this.commandList = [
      {
        command: 'header',
        alias: 'He',
        desc: this.translateService.instant('msg.dp.li.he.description'),
        isHover: false,
        command_h: ['ㅗㄷㅁㅇㄷㄱ']
      },
      { command: 'keep',
        alias: 'Ke',
        desc: this.translateService.instant('msg.dp.li.ke.description'),
        isHover: false,
        command_h: ['ㅏㄸ','ㅏ떼','ㅏㄷ','ㅏㄷ데']
      },
      {
        command: 'replace',
        alias: 'Rp',
        desc: this.translateService.instant('msg.dp.li.rp.description'),
        isHover: false,
        command_h: ['ㄱㄷ','ㄱ데ㅣㅁㅊㄷ']
      },
      {
        command: 'rename',
        alias: 'Rn',
        desc: this.translateService.instant('msg.dp.li.rn.description'),
        isHover: false,
        command_h: ['ㄱㄷ','ㄱ둠','ㄱ두므','ㄱ두믇']
      },
      { command: 'set',
        alias: 'Se',
        desc: this.translateService.instant('msg.dp.li.se.description'),
        isHover: false,
        command_h: ['ㄴㄷㅅ']
      },
      {
        command: 'settype',
        alias: 'St',
        desc: this.translateService.instant('msg.dp.li.st.description'),
        isHover: false,
        command_h: ['ㄴㄷㅆ','ㄴㄷ쑈ㅔㄷ','ㄴㄷㅅ','ㄴㄷㅅ쇼ㅔㄷ']
      },
      {
        command: 'countpattern',
        alias: 'Co',
        desc: this.translateService.instant('msg.dp.li.co.description'),
        isHover: false,
        command_h: ['ㅊ','채ㅕㅜㅅ','채ㅕㅜ세','채ㅕㅜ셈ㅆㄷㄱ','채ㅕㅜ셈ㅆㄷ구','채ㅕㅜ셈ㅅㅅㄷ','채ㅕㅜ셈ㅅㅅㄷ구']
      },
      {
        command: 'split',
        alias: 'Sp',
        desc: this.translateService.instant('msg.dp.li.sp.description'),
        isHover: false,
        command_h: ['ㄴ','네ㅣㅑㅅ']
      },
      {
        command: 'derive',
        alias: 'Dr',
        desc: this.translateService.instant('msg.dp.li.dr.description'),
        isHover: false,
        command_h: ['ㅇㄷ갸','ㅇㄷ걒ㄷ']
      },
      {
        command: 'delete',
        alias: 'De',
        desc: this.translateService.instant('msg.dp.li.de.description'),
        isHover: false,
        command_h: ['ㅇㄷ','ㅇ디','ㅇ딛ㅅㄷ']
      },
      { command: 'drop',
        alias: 'Dp',
        desc: this.translateService.instant('msg.dp.li.dp.description'),
        isHover: false,
        command_h: ['ㅇㄱ','ㅇ개ㅔ']
      },
      {
        command: 'pivot',
        alias: 'Pv',
        desc: this.translateService.instant('msg.dp.li.pv.description'),
        isHover: false,
        command_h: ['ㅔㅑㅍ','ㅔㅑ패','ㅔㅑ팻']
      },
      {
        command: 'unpivot',
        alias: 'Up',
        desc: this.translateService.instant('msg.dp.li.up.description'),
        isHover: false,
        command_h: ['ㅕㅜ','ㅕㅞㅑ','ㅕㅞㅑㅍ','ㅕㅞㅑ패','ㅕㅞㅑ팻']
      },
      { command: 'join',
        alias: 'Jo',
        desc: this.translateService.instant('msg.dp.li.jo.description'),
        isHover: false,
        command_h: ['ㅓㅐㅑㅜ']
      },
      {
        command: 'extract',
        alias: 'Ex',
        desc: this.translateService.instant('msg.dp.li.ex.description'),
        isHover: false,
        command_h: ['ㄷㅌㅅㄱㅁㅊㅅ']
      },
      {
        command: 'flatten',
        alias: 'Fl',
        desc: this.translateService.instant('msg.dp.li.fl.description'),
        isHover: false,
        command_h: ['ㄹ','리','림ㅆㄷ','림ㅆ두','림ㅅㅅㄷ','림ㅅㅅ두']
      },
      {
        command: 'merge',
        alias: 'Me',
        desc: this.translateService.instant('msg.dp.li.me.description'),
        isHover: false,
        command_h: ['ㅡㄷㄱㅎㄷ']
      },
      { command: 'nest',
        alias: 'Ne',
        desc: this.translateService.instant('msg.dp.li.ne.description'),
        isHover: false,
        command_h: ['ㅜㄷㄴㅅ']
      },
      {
        command: 'unnest',
        alias: 'Un',
        desc: this.translateService.instant('msg.dp.li.un.description'),
        isHover: false,
        command_h: ['ㅕㅜㅜㄷㄴㅅ']
      },
      {
        command: 'aggregate',
        alias: 'Ag',
        desc: this.translateService.instant('msg.dp.li.ag.description'),
        isHover: false,
        command_h: ['ㅁㅎㅎㄱㄷㅎㅁㅅㄷ']
      },
      {
        command: 'sort',
        alias: 'So',
        desc: this.translateService.instant('msg.dp.li.so.description'),
        isHover: false,
        command_h: ['ㄴ','내','낵','낷']
      },
      {
        command: 'move',
        alias: 'Mv',
        desc: this.translateService.instant('msg.dp.li.mv.description'),
        isHover: false,
        command_h: ['ㅡㅐㅍㄷ']
      },
      {
        command: 'union',
        alias: 'Ui',
        desc: this.translateService.instant('msg.dp.li.ui.description'),
        isHover: false,
        command_h: ['ㅕㅜㅑㅐㅜ']
      },
      {
        command: 'setformat',
        alias: 'Sf',
        desc: this.translateService.instant('msg.dp.li.sf.description'),
        isHover: false,
        command_h: ['ㄴㄷㅅ랙','ㄴㄷㅅ래그','ㄴㄷㅅ래금ㅅ']
      },
      {
        command: 'window',
        alias: 'Wn',
        desc: this.translateService.instant('msg.dp.li.wd.description'),
        isHover: false,
        command_h: ['ㅈ','쟈ㅜㅇ','쟈ㅜ애','쟈ㅜ앶']
      }
    ];

    // set rule
    if (this.selectedDataSet && this.selectedDataSet.rules && this.selectedDataSet.rules.length > 0) {
      this.setRuleList(this.selectedDataSet.rules);
      this.isAggregationIncluded = this._hasAggregation();
    }

    // init ruleVO
    this.ruleVO.command = '';

  }

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