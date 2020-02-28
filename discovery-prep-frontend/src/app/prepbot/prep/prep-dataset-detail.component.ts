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
import {DataflowService} from './service/dataflow.service';
import {ActivatedRoute} from "@angular/router";
import {EditRuleGridComponent} from "../dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule-grid/edit-rule-grid.component";
import {PreparationAlert} from "../util/preparation-alert.util";
import {PreparationCommonUtil} from "../util/preparation-common.util";
import {isNullOrUndefined, isUndefined} from "util";
import {Alert} from "../../common/util/alert.util";
import {PrDataset, Rule} from "../../domain/data-preparation/pr-dataset";
import {Location} from "@angular/common";
import {PrDataflow} from "../../domain/data-preparation/pr-dataflow";
import {EditRuleComponent} from "../dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule.component";
import {RuleListComponent} from "../dataflow/dataflow-detail/component/edit-dataflow-rule/rule-list.component";
import {PrepRnbRuleComponent} from "./component/prep-rnb-rule.component";
import {PrepRnbRuleListComponent} from "./component/prep-rnb-rule-list.component";
import {PrepRnbRecommendComponent} from "./component/prep-rnb-recommend.component";

@Component({
    selector: 'prep-dataset-detail',
    templateUrl: './prep-dataset-detail.component.html'
})
export class PrepDatasetDetailComponent extends AbstractComponent {

  @ViewChild(EditRuleGridComponent)
  private _editRuleGridComp: EditRuleGridComponent;

  @ViewChild('editRule')
  private _editRuleComp: EditRuleComponent;

  @ViewChild(RuleListComponent)
  private _ruleListComponent : RuleListComponent;

  @ViewChild(PrepRnbRuleComponent)
  private _prepRnbRuleComponent : PrepRnbRuleComponent;

  @ViewChild(PrepRnbRuleListComponent)
  private _prepRnbRuleListComponent : PrepRnbRuleListComponent;

  @ViewChild(PrepRnbRecommendComponent)
  private _prepRnbRecommendComponent : PrepRnbRecommendComponent;

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
  public editColumnList = [];                 // 수정 할 컬럼 리스트
  public selectedColumns: string[] = [];     // 그리드에서 선택된 컬럼 리스트
  public selectedRows: any = [];             // 그리드에서 선택된 로우 리스트

  // APPEND (룰 등록) / UPDATE (룰 수정) / JUMP / PREPARE_UPDATE (룰 수정하기 위해 jump) / DELETE
  public opString: string = 'APPEND';

  //Navigation bar open
  public isNaivationOpen: boolean = false;

  private _isExecAddRule:boolean = false;

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

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public onClickPrev(): void {
    this._location.back();
  }

  //navigation open
  public openNavigation(){
      this.isNaivationOpen = !this.isNaivationOpen;
  }

  /**
   * 그리드 헤더 클릭을 통해서 룰 정보 설정
   * @param {{id:string, isSelect:boolean, column: any, field: any}} data
   */
  public setRuleInfoFromGridHeader(data: { id: string, isSelect: boolean, columns: any, fields: any }) {

    this.selectedColumns = data.columns;

  } // function - setRuleInfoFromGridHeader

  /**
   * Context Menu Rule 적용 이벤트
   * @param data
   */
  public onContextMenuInfo(data) {

    if (data.more) {
      this.ruleVO.command = data.more.command;
      this.safelyDetectChanges();

      const selCols = this.selectedDataSet.gridData.fields.filter( item => -1 < data.more.col.indexOf( item.uuid ) );

      if (data.more.command === 'setformat') {
        let colDescs = this.selectedDataSet.gridResponse.colDescs.filter((item) => {
          return item.type === 'TIMESTAMP'
        });
        //this._editRuleComp.setValue('dsId', this.selectedDataSet.dsId);
        //this._editRuleComp.setValue('colTypes', colDescs);
      }

      if (data.more.command === 'move') {
        //this._editRuleComp.init(this.selectedDataSet.gridData.fields, selCols, {jsonRuleString : data.more});
      }

      if (data.more.command === 'set') {

        if (data.more.contextMenu) {
          //this._editRuleComp.init(this.selectedDataSet.gridData.fields, selCols, {jsonRuleString : data.more});
        } else {
          //this._editRuleComp.init(this.selectedDataSet.gridData.fields, selCols);
        }
      }


      if (data.more.command === 'settype') {

        //this._editRuleComp.setValue('colTypes', this.selectedDataSet.gridResponse.colDescs);
        //this._editRuleComp.setValue('dsId', this.selectedDataSet.dsId);
        //this._editRuleComp.setValue('selectedType', data.more.type);
        let idx = this.selectedDataSet.gridResponse.colDescs.findIndex((item) => {
          return item.type === data.more.type.toUpperCase();
        });
        //this._editRuleComp.setValue('defaultIndex', idx);
      }

      const ruleNames : string[] = ['move', 'set'];
      if (-1 === ruleNames.indexOf(data.more.command)) {
        //this._editRuleComp.init(this.selectedDataSet.gridData.fields, selCols);
      }


    } else {

      data['ruleCurIdx'] = this.opString === 'UPDATE' ? this.serverSyncIndex-1 : this.serverSyncIndex;
      data['op'] = this.opString === 'UPDATE' ? 'UPDATE' : 'APPEND';
      this.applyRule(data);

    }

  } // function - applyRuleFromContextMenu

  /**
   * Set colour to rule list when jumped
   * @param idx
   */
  public setRuleListColorWhenJumped(idx : number) {
    this.ruleList.forEach((item, index) => {
      item.isValid = !(index === idx || index < idx);
    });
  }

  /**
   * Jump Action
   * @param idx - from rule list
   */
  public jump(idx: number) {

    // Change edit mode to false
    //this.refreshEditMode();

    // clear all selected columns and rows
    this._editRuleGridComp.unSelectionAll();

    this.loadingShow();

    this.opString = 'JUMP';

    // Get grid of selected index
    this._setEditRuleInfo({op: this.opString, ruleIdx: idx, count: 100 }).then((data) => {

      if (data['error']) {
        let prep_error = this.dataprepExceptionHandler(data['error']);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
        return;
      }

      // set affected columns
      data.apiData.gridResponse.interestedColNames.forEach(col => {

        if ('' !== this._editRuleGridComp.getColumnUUIDByColumnName(col)) {
          this._editRuleGridComp.selectColumn(this._editRuleGridComp.getColumnUUIDByColumnName(col), true);
        }

      });
      this.loadingHide();
      this.serverSyncIndex = data.apiData.ruleCurIdx;

      this.setRuleListColorWhenJumped(this.serverSyncIndex);
      //this.ruleListComponent.selectedRuleIdx = this.serverSyncIndex;

    });
  }

  /**
   * 룰 수정 클릭시
   * @param editInfo
   */
  public setEditData(editInfo) {

    this._editRuleGridComp.unSelectionAll('COL'); // unselect all columns in current grid
    this.ruleVO.command = '';  // remove currently selected rule component (set선택된 상태에서 set을 edit하면 에러나는 문제 해결)

    // set current index (when editing subtract 1 from index)
    let ruleIdx = editInfo.ruleNo-1;

    // 인풋박스 포커스 여부 IE 에서 수정버튼을 누르면 툴팁 박스가 열려서...
    this.isFocus = false;

    this._setEditRuleInfo({op: 'PREPARE_UPDATE', ruleIdx: ruleIdx, count: 100, offset: 0})
      .then((data: { apiData: any, gridData: any }) => {

        if (data['error']) {
          let prep_error = this.dataprepExceptionHandler(data['error']);
          PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
          return;
        }
        this.setEditInfo(editInfo, data.gridData);
        this.opString = 'UPDATE';
        this.serverSyncIndex = ruleIdx+1;
        this.setRuleListColorWhenJumped(this.serverSyncIndex);
        //this.setCancelBtnWhenEditMode(this.serverSyncIndex);
      });
  } // function - setRuleVO

  /**
   * 편집시 기존의 수식이 각 위치에 들어간다
   * @param rule : rule 수정할 rule 정보
   * @param gridData
   */
  public setEditInfo(rule, gridData:any) {

    try {

      const jsonRuleString = JSON.parse(rule.jsonRuleString);

      // Set ruleString for editor
      this.inputRuleCmd = rule.ruleString;

      // If editor
      if (!jsonRuleString.isBuilder) {
        this.editorUseFlag = true;
        return;
      }

      // TODO : eventually remove ruleVO
      // this.initRule(); --> Check if this is necessary here

      this.ruleVO = rule['ruleVO'];
      ('' === this.ruleVO.command) && (this.ruleVO.command = this.ruleVO['name']);

      this.safelyDetectChanges();

      if (jsonRuleString.name === 'settype') {
        //this._editRuleComp.setValue('dsId', this.dsId);
        //this._editRuleComp.setValue('colTypes', this.selectedDataSet.gridResponse.colDescs);
      }

      if (jsonRuleString.name === 'setformat') {
        let colDescs = this.selectedDataSet.gridResponse.colDescs.filter((item) => {
          return item.type === 'TIMESTAMP'
        });
        //this._editRuleComp.setValue('dsId', this.dsId);
        //this._editRuleComp.setValue('colTypes', colDescs);
      }

      if (jsonRuleString.name === 'rename') {
        if (jsonRuleString.col.length !== 1) {
          /*this.multipleRenamePopupComponent.init({
            gridData: _.cloneDeep(gridData),
            dsName: this.dsName,
            typeDesc: this.selectedDataSet.gridResponse.colDescs,
            editInfo: {ruleCurIdx: this.ruleVO['ruleNo'],
              cols: jsonRuleString.col,
              to: jsonRuleString.to}
          });*/
        }
      }

      if (jsonRuleString.name === 'join') {
        if (this.selectedDataSet.gridData.data.length > 0) {
          this.editJoinOrUnionRuleStr = rule['jsonRuleString'];
          //this.setJoinEditInfo(rule);
        } else {
          Alert.warning('No rows to join');
        }
      }

      if (jsonRuleString.name === 'union') {
        if (this.selectedDataSet.gridData.data.length > 0) {
          this.editJoinOrUnionRuleStr = rule['jsonRuleString'];
          //this.isUpdate = true;
          //this.isRuleUnionModalShow = true;
        } else {
          Alert.warning('No rows to union');
        }
      }

      const ruleNames : string[] = ['union', 'join'];

      if (-1 === ruleNames.indexOf(jsonRuleString.name)) {
        //this._editRuleComp.init(gridData.fields, [], {jsonRuleString : jsonRuleString});
      }

    } catch (e) {
      Alert.error(this.translateService.instant('msg.dp.alert.rule.edit.fail'));
    }
  }

  /**
   * Delete rule
   * @param {number} ruleNo
   */
  public deleteRule(ruleNo : number) {
    this.serverSyncIndex = ruleNo;
    this.refreshEditMode();
    this.applyRule({ op: 'DELETE', ruleIdx: this.serverSyncIndex, count:100 });
  }

  /**
   * Init edit mode
   */
  public refreshEditMode() {
    this.opString = 'APPEND';
    this.inputRuleCmd = '';
    this.editorUseFlag = false;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
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

  /**
   * apply rule
   * @rule Rule
   * @msg translate key
   * @isUndo
   */
  private applyRule(rule: object, isUndo?: boolean) {

    let command = rule['command'];

    // Save current scroll position
    this._editRuleGridComp.savePosition();

    this.loadingShow();

    this.changeDetect.detectChanges();

    this.isJumped = false;

    this.opString = rule['op'];

    const param = {
      op: this.opString,
      ruleIdx : rule['ruleIdx'] ? rule['ruleIdx'] : this.serverSyncIndex,
      count: 100,
      ruleString : rule['ruleString'],
      uiRuleString : JSON.stringify(rule['uiRuleString'])
    };

    this._setEditRuleInfo(param).then((data: { apiData: any, gridData: any }) => {

      this._isExecAddRule = false;

      if (data['error']) {
        let prep_error = this.dataprepExceptionHandler(data['error']);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
        return;
      }

      // TODO : need to refresh selected column after applying rule
      this._editRuleGridComp.unSelectionAll();

      this.serverSyncIndex = data.apiData.ruleCurIdx;
      //if (data.apiData.ruleStringInfos.length > 0) {
      if (data.apiData.transformRules.length > 0) {
        this._editRuleGridComp.setAffectedColumns(
          data.apiData.gridResponse['interestedColNames'],
          //data.apiData.ruleStringInfos[data.apiData.ruleStringInfos.length - 1].command);
          data.apiData.transformRules[data.apiData.transformRules.length - 1].command);
      }

      // 룰 리스트는 index 보다 하나 적게
      this.setRuleListColorWhenJumped(this.serverSyncIndex);
      //this._ruleListComponent.selectedRuleIdx = this.serverSyncIndex;

      if (command !== 'join' && command !== 'derive' && command !== 'aggregate' && command !== 'move') {
        // 저장된 위치로 이동
        // this._editRuleGridComp.moveToSavedPosition();
      }
      // 계속 클릭하는거 방지
      if (isUndo && this.isUndoRunning) {
        this.isUndoRunning = false;
      } else if (!isUndo && this.isRedoRunning) {
        this.isRedoRunning = false;
      }

      this.inputRuleCmd = '';

    });

  }

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