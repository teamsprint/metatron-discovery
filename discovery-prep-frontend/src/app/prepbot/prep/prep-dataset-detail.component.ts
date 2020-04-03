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

import {Component, ElementRef, Injector, ViewChild} from '@angular/core';
import {AbstractComponent} from '../../common/component/abstract.component';
import {DataflowService} from './service/dataflow.service';
import {ActivatedRoute} from "@angular/router";
import {EditRuleGridComponent} from "../dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule-grid/edit-rule-grid.component";
import {PreparationAlert} from "../util/preparation-alert.util";
import {PreparationCommonUtil} from "../util/preparation-common.util";
import {isNullOrUndefined, isUndefined} from "util";
import {Alert} from "../../common/util/alert.util";
import {Field, PrDataset, Rule} from "../../domain/data-preparation/pr-dataset";
import {Location} from "@angular/common";
import {PrDataflow} from "../../domain/data-preparation/pr-dataflow";
import {EditRuleComponent} from "../dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule.component";
import {RuleListComponent} from "../dataflow/dataflow-detail/component/edit-dataflow-rule/rule-list.component";
import {PrepRnbRuleComponent} from "./component/prep-rnb-rule.component";
import {PrepRnbRuleListComponent} from "./component/prep-rnb-rule-list.component";
import {PrepRnbRecommendComponent} from "./component/prep-rnb-recommend.component";
import {StringUtil} from "../../common/util/string.util";
import {PrepPopResultCreateComponent} from './create-dataresult/prep-pop-result-create.component';
import {EventBroadcaster} from "../../common/event/event.broadcaster";
import {MultipleRenamePopupComponent} from "../dataflow/dataflow-detail/component/edit-dataflow-rule/multiple-rename-popup.component";

import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
    selector: 'prep-dataset-detail',
    templateUrl: './prep-dataset-detail.component.html'
})
export class PrepDatasetDetailComponent extends AbstractComponent {

  @ViewChild(EditRuleGridComponent)
  private _editRuleGridComp: EditRuleGridComponent;

  @ViewChild('editRule')
  private _editRuleComp: EditRuleComponent;

  @ViewChild(MultipleRenamePopupComponent)
  private multipleRenamePopupComponent: MultipleRenamePopupComponent;

  @ViewChild(RuleListComponent)
  private _ruleListComponent : RuleListComponent;

  @ViewChild(PrepRnbRuleComponent)
  private _prepRnbRuleComponent : PrepRnbRuleComponent;

  @ViewChild(PrepRnbRuleListComponent)
  private _prepRnbRuleListComponent : PrepRnbRuleListComponent;

  @ViewChild(PrepRnbRecommendComponent)
  private _prepRnbRecommendComponent : PrepRnbRecommendComponent;

  @ViewChild(PrepPopResultCreateComponent)
  private createSnapshotPopup : PrepPopResultCreateComponent;

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

  // Layer hide and show
  public isCommandListShow: boolean = false;
  public isRuleJoinModalShow: boolean = false;
  public isRuleUnionModalShow: boolean = false;

  // Rules
  public ruleVO: Rule = new Rule();
  public ruleList: any[] = [];
  public isJumped: boolean = false;
  public redoable: boolean = false;
  public undoable: boolean = false;

  // Flag for undo and redo, to stop users from multiple requests
  public isRedoRunning: boolean = false;
  public isUndoRunning: boolean = false;

  // 검색어
  public commandSearchText: string = '';

  // 조인 편집시 필요한 데이터
  public rightDataset: PrDataset;

  // Add rule / editor or builder
  public showRuleEdit: boolean = false;
  public editorUseFlag: boolean = false;

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

  public isCreateDataresultPopupOpen: boolean = false;     // dataresult create popup

  // 생성자
  constructor(private _dataflowService: DataflowService,
              private broadCaster: EventBroadcaster,
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
    event.stopImmediatePropagation();

    if (data.more) {
      this.ruleVO.command = data.more.command;
      this.safelyDetectChanges();

      const selCols = this.selectedDataSet.gridData.fields.filter( item => -1 < data.more.col.indexOf( item.uuid ) );

      if (data.more.command === 'setformat') {
        let colDescs = this.selectedDataSet.gridResponse.colDescs.filter((item) => {
          return item.type === 'TIMESTAMP'
        });
        this._editRuleComp.setValue('dsId', this.selectedDataSet.dsId);
        this._editRuleComp.setValue('colTypes', colDescs);
      }

      if (data.more.command === 'move') {
        this._editRuleComp.init(this.selectedDataSet.gridData.fields, selCols, {jsonRuleString : data.more});
      }

      if (data.more.command === 'set') {

        if (data.more.contextMenu) {
          this._editRuleComp.init(this.selectedDataSet.gridData.fields, selCols, {jsonRuleString : data.more});
        } else {
          this._editRuleComp.init(this.selectedDataSet.gridData.fields, selCols);
        }
      }


      if (data.more.command === 'settype') {

        this._editRuleComp.setValue('colTypes', this.selectedDataSet.gridResponse.colDescs);
        this._editRuleComp.setValue('dsId', this.selectedDataSet.dsId);
        this._editRuleComp.setValue('selectedType', data.more.type);
        let idx = this.selectedDataSet.gridResponse.colDescs.findIndex((item) => {
          return item.type === data.more.type.toUpperCase();
        });
        this._editRuleComp.setValue('defaultIndex', idx);
      }

      const ruleNames : string[] = ['move', 'set'];
      if (-1 === ruleNames.indexOf(data.more.command)) {
        this._editRuleComp.init(this.selectedDataSet.gridData.fields, selCols);
      }

      this.showRuleEdit = true;


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
    this.refreshEditMode();

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

      this.showRuleEdit = false;
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

        this.showRuleEdit = true;
      });
  } // function - setRuleVO

  /**
   * Apply rule. (When Add button is clicked)
   */
  public addRule() {

    if( this._isExecAddRule ) {
      this.editorUseFlag = false;
      return;
    }

    this._isExecAddRule = true;

    let rule: any = {};
    if (this.editorUseFlag === false) {

      if (isUndefined(this.ruleVO['command']) || '' === this.ruleVO['command']) {
        Alert.warning(this.translateService.instant('msg.dp.alert.no.data'));
        this._isExecAddRule = false;
        return;
      }

      // get rule string from individual components
      rule = this._editRuleComp.getRuleData();
      if (isUndefined(rule)) {
        this._isExecAddRule = false;
        return;
      }

      // set param
      rule['op'] = this.opString;
      rule['ruleIdx'] = this.serverSyncIndex;

    } else {  // Using editor
      if (this.inputRuleCmd === '') {
        Alert.warning(this.translateService.instant('msg.dp.alert.editor.warn'));
        this._isExecAddRule = false;
        return;
      }
      rule = {
        op: this.opString,
        ruleIdx: this.serverSyncIndex,
        ruleString: this.inputRuleCmd,
        uiRuleString: {isBuilder: false}
      };
    }
    if (!isUndefined(rule)) {

      let isErrorCommand : boolean = true;
      for(let ind in this.commandList) {
        if ( rule.ruleString.indexOf(this.commandList[ind].command) > -1 ) isErrorCommand = false;
      }
      if (isErrorCommand){
        this._isExecAddRule = false;
        Alert.error(this.translateService.instant('msg.dp.alert.command.error'));
        return;
      }

      this.applyRule(rule);
    }
  } // function - addRule

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
        this._editRuleComp.setValue('dsId', this.dsId);
        this._editRuleComp.setValue('colTypes', this.selectedDataSet.gridResponse.colDescs);
      }

      if (jsonRuleString.name === 'setformat') {
        let colDescs = this.selectedDataSet.gridResponse.colDescs.filter((item) => {
          return item.type === 'TIMESTAMP'
        });
        this._editRuleComp.setValue('dsId', this.dsId);
        this._editRuleComp.setValue('colTypes', colDescs);
      }

      if (jsonRuleString.name === 'rename') {
        if (jsonRuleString.col.length !== 1) {
          this.multipleRenamePopupComponent.init({
            gridData: _.cloneDeep(gridData),
            dsName: this.dsName,
            typeDesc: this.selectedDataSet.gridResponse.colDescs,
            editInfo: {ruleCurIdx: this.ruleVO['ruleNo'],
              cols: jsonRuleString.col,
              to: jsonRuleString.to}
          });
        }
      }

      if (jsonRuleString.name === 'join') {
        if (this.selectedDataSet.gridData.data.length > 0) {
          this.editJoinOrUnionRuleStr = rule['jsonRuleString'];
          this.setJoinEditInfo(rule);
        } else {
          Alert.warning('No rows to join');
        }
      }

      if (jsonRuleString.name === 'union') {
        if (this.selectedDataSet.gridData.data.length > 0) {
          this.editJoinOrUnionRuleStr = rule['jsonRuleString'];
          //this.isUpdate = true;
          this.isRuleUnionModalShow = true;
        } else {
          Alert.warning('No rows to union');
        }
      }

      const ruleNames : string[] = ['union', 'join'];

      if (-1 === ruleNames.indexOf(jsonRuleString.name)) {
        this._editRuleComp.init(gridData.fields, [], {jsonRuleString : jsonRuleString});
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
   * When insert step button is clicked from rule list, jump to selected index
   * @param {number} ruleNo
   */
  public insertStep(ruleNo: number) {
    this.opString = 'INITIAL';
    this.jumpToInsertStep(ruleNo);
  }

  /**
   * Jump but op is GET
   * @param idx - from rule list
   */
  public jumpToInsertStep(idx: number) {

    // clear all selected columns and rows
    this._editRuleGridComp.unSelectionAll();
    let tempOpString = this.opString;

    if (this.ruleList.length > idx +1) {
      this.loadingShow();

      // Get grid of selected index
      this._setEditRuleInfo({op: tempOpString, ruleIdx: idx, count: 100, offset: 0 }).then((data) => {

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

        // set rule list color (-1 as 1 was added to match server list index before sending API)
        this.setRuleListColorWhenJumped(this.serverSyncIndex);
        this.opString = 'APPEND';
        this.setInsertStep(this.serverSyncIndex);

        this.showRuleEdit = true;
      });
    } else {
      this.serverSyncIndex = idx;
      this.setRuleListColorWhenJumped(this.serverSyncIndex);
      this.opString = 'APPEND';
      this.setInsertStep(this.serverSyncIndex);

      this.showRuleEdit = true;
    }

  }

  /**
   * Add cancel button to insert step index
   * @param {number} idx
   */
  public setInsertStep(idx : number ) {
    this.ruleList[idx]['isInsertStep'] = true;
  }

  /**
   * When cancel button is clicked. Cancels edit mode and jump to current index
   */
  public jumpToCurrentIndex() {

    if (this.inputRuleCmd !== '') {
      this.inputRuleCmd = ''; // Empty builder rule string
    } else {
      if (!this.editorUseFlag) {
        // If no command is selected nothing happens
        if (this.ruleVO.command === '' || isNullOrUndefined(this.ruleVO.command)) {
          return;
        }
      }
    }

    // Change button
    this.opString = 'APPEND';

    // Unselect all columns
    this._editRuleGridComp.unSelectionAll();

    // Jumps to current index
    this.jump(this.serverSyncIndex);

    // TODO : check if necessary
    this.ruleVO.command = '';
    this.selectedColumns = [];
    this.editColumnList = [];
  }

  /**
   * Init edit mode
   */
  public refreshEditMode() {
    this.opString = 'APPEND';
    this.inputRuleCmd = '';
    this.editorUseFlag = false;
  }

  public hideRuleEdit() {
    this._prepRnbRuleListComponent.initEditMode();
    this.refreshEditMode();
    this.ruleVO.command = '';
    this.showRuleEdit = false;
  }

  /**
   * Rule cancel or 초기 세팅
   * @param data
   */
  public initRule(data?) {

    // default 는 append
    this.refreshEditMode();

    // 룰 리스트에서 선택된 룰이 없게 this.ruleNo 초기화
    this.ruleNo = null;

    this.ruleVO = new Rule();
    // this.inputRuleCmd = '';

    // redo, undo를 초기화 한다.
    if (data) this.initRedoUndo(data);

  } // function - initRule

  /**
   * Initialise redo and undo buttons
   * @param data
   */
  public initRedoUndo(data) {

    switch (data.redoable) {
      case 'true':
        this.redoable = true;
        break;
      case 'false' :
        this.redoable = false;
        break;
    }

    switch (data.undoable) {
      case 'true':
        this.undoable = true;
        break;
      case 'false' :
        this.undoable = false;
        break;
    }
  } // function - initRedoUndo

  /**
   * Redo or undo
   * @param {string} action
   */
  public transformAction(action : string) {
    this.refreshEditMode();
    const rule = { op: action };
    if (action === 'UNDO') {
      if (!this.undoable) {
        return;
      }
      if (this.isUndoRunning === false) {
        this.isUndoRunning = true;
      }
    } else if (action === 'REDO') {
      if (!this.redoable) {
        return;
      }
      if (this.isRedoRunning === false) {
        this.isRedoRunning = true;
      }

    }
    this.applyRule(rule, action === 'UNDO')
  }

  /**
   * When command is selected from commandList
   * @param event
   * @param command
   * */
  public selectCommand(event, command) {
    event.stopImmediatePropagation();

    // TODO : Added getting selected columns from grid because didn't show selected columns when command is changed on edit
    this.selectedColumns = this._editRuleGridComp.getSelectedColumns();
    this.ruleVO.cols = this.selectedColumns;

    if (isNullOrUndefined(command)) {
      return;
    }

    this.ruleVO.command = command.command;
    this.ruleVO.alias = command.alias;
    this.ruleVO.desc = command.desc;

    // 검색어 초기화 및 레이어 닫기
    this.commandSearchText = '';
    this.isCommandListShow = false;
    this.safelyDetectChanges();

    let selectedFields:Field[] = [];
    if( this.selectedColumns ) {
      selectedFields = this.selectedColumns.map( col => this.selectedDataSet.gridData.fields.find( field => field.uuid === col ) );
    }

    switch (this.ruleVO.command) {
      case 'setformat':
        let colDescs = this.selectedDataSet.gridResponse.colDescs.filter((item) => {
          return item.type === 'TIMESTAMP'
        });
        this._editRuleComp.setValue('dsId', this.dsId);
        this._editRuleComp.setValue('colTypes', colDescs);
        break;
      case 'settype':
        this._editRuleComp.setValue('dsId', this.dsId);
        this._editRuleComp.setValue('colTypes', this.selectedDataSet.gridResponse.colDescs);
        break;
      case 'join':
        this.rightDataset = new PrDataset();
        this.rightDataset.dsId = '';
        this.isRuleJoinModalShow = true;
        break;
      case 'union':
        this.editJoinOrUnionRuleStr = '';
        this.isRuleUnionModalShow = true;
        break;
    }

    if (command.command !== 'join' && command.command !== 'union') {
      this._editRuleComp.init(this.selectedDataSet.gridData.fields, selectedFields);
    }

  }

  // command list show
  public showCommandList() {

    // Close all opened select box from rule
    this.broadCaster.broadcast('EDIT_RULE_SHOW_HIDE_LAYER', { id : 'toggleList', isShow : false } );

    // 포커스 이동
    setTimeout(() => $('#commandSearch').trigger('focus'));

    this.commandSearchText = '';
    this.isCommandListShow = true;

    this.safelyDetectChanges();

  }

  /**
   * Join 설정 완료 이벤트
   * @param $event Join 설정 정보
   */
  public ruleJoinComplete($event) {
    if ($event.ruleInfo) { // Join complete
      this.applyRule($event.ruleInfo);
    } else { // cancel join
      this.jump(this.serverSyncIndex);
    }
    this.isRuleJoinModalShow = false;
  }


  /**
   * union 설정 완료 이벤트
   * @param $event Union 설정 정보
   */
  public ruleUnionComplete($event) {
    if ($event.ruleInfo) { // Union complete
      this.applyRule($event.ruleInfo);
    } else { // Cancel union
      this.jump(this.serverSyncIndex);
    }
    this.isRuleUnionModalShow = false;
    //this.isUpdate = false;
  } // function - ruleUnionComplete

  /**
   * Select box for commands - navigate with keyboard
   * @param event 이벤트
   * @param currentList 현재 사용하는 리스트
   * @param clickHandler
   */
  public navigateWithKeyboardShortList(event, currentList, clickHandler) {

    // open select box when arrow up/ arrow down is pressed
    if (event.keyCode === 38 || event.keyCode === 40) {
      switch (clickHandler) {
        case 'command':
          if (!this.isCommandListShow) {
            this.isCommandListShow = true;
            setTimeout(() => $('#commandSearch').trigger('focus')); // 포커스
          }
          break;
      }
    }

    // when there is no element in the list
    if (currentList.length === 0) {
      return;
    }

    // set scroll height
    let height = 25;
    if (clickHandler == 'command') {
      height = 50;
    }

    // this.commandList 에 마지막 인덱스
    let lastIndex = currentList.length - 1;

    // command List 에서 selected 된 index 를 찾는다
    const idx = currentList.findIndex((command) => {
      if (command.isHover) {
        return command;
      }
    });

    const commandListEle = $('.pb-list-command');
    // when Arrow up is pressed
    if (event.keyCode === 38) {

      // 선택된게 없다
      if (idx === -1) {

        // 리스트에 마지막 인덱스를 selected 로 바꾼다
        currentList[lastIndex].isHover = true;

        // 스크롤을 마지막으로 보낸다
        commandListEle.scrollTop(lastIndex * height);

        // 리스트에서 가장 첫번쨰가 선택되어 있는데 arrow up 을 누르면 리스트에 마지막으로 보낸다
      } else if (idx === 0) {

        currentList[0].isHover = false;
        currentList[lastIndex].isHover = true;


        // 스크롤을 마지막으로 보낸다
        commandListEle.scrollTop(lastIndex * height);

      } else {
        currentList[idx].isHover = false;
        currentList[idx - 1].isHover = true;
        commandListEle.scrollTop((idx - 1) * height);
      }

      // when Arrow down is pressed
    } else if (event.keyCode === 40) {

      // 리스트에 첫번째 인텍스를 selected 로 바꾼다
      if (idx === -1) {
        currentList[0].isHover = true;

        // 리스트에서 가장 마지막이 선택되어 있는데 arrow down 을 누르면 다시 리스트 0번째로 이동한다
      } else if (idx === lastIndex) {

        currentList[0].isHover = true;
        currentList[lastIndex].isHover = false;
        commandListEle.scrollTop(0);

      } else {
        currentList[idx].isHover = false;
        currentList[idx + 1].isHover = true;
        commandListEle.scrollTop((idx + 1) * height);

      }

    }

    // enter
    if (event.keyCode === 13) {

      // selected 된 index 를 찾는다
      const idx = currentList.findIndex((command) => {
        if (command.isHover) {
          return command;
        }
      });
      this.selectCommand(event, currentList[idx]);
      $('[tabindex=1]').trigger('focus');
    }
  }

  /**
   * Multicolumn rename popup open
   */
  public onMultiColumnRenameClick() {

    if ('UPDATE' === this.opString) {
      this.multipleRenamePopupComponent.init({gridData: _.cloneDeep(this.selectedDataSet.gridData),
        dsName: this.dsName,
        typeDesc: this.selectedDataSet.gridResponse.colDescs,
        editInfo: {ruleCurIdx: this.ruleVO['ruleNo'],
          cols: this.ruleVO.cols,
          to: [this.ruleVO.to]}
      });
    } else {
      this.multipleRenamePopupComponent.init({gridData: _.cloneDeep(this.selectedDataSet.gridData),
        dsName: this.dsName, typeDesc: this.selectedDataSet.gridResponse.colDescs});
    }
  }

  /**
   * Apply multi column rename
   * @param data
   */
  public onRenameMultiColumns(data) {
    if (isNullOrUndefined(data) ) { // Cancel rename if nothing is changed
      this.jumpToCurrentIndex()
    } else {
      this.applyRule(data);
    }
  }

  get existButtonCommand() {
    const command = ['rename'];
    return command.indexOf(this.ruleVO.command) > -1
  }

  // command List (search)
  get filteredCommandList() {

    let commandList = this.commandList;

    const isSearchTextEmpty = StringUtil.isNotEmpty(this.commandSearchText);

    let enCheckReg = /^[A-Za-z]+$/;

    // Check Search Text
    if (isSearchTextEmpty) {
      commandList = commandList.filter((item) => {
        // language(en or ko) check
        if(enCheckReg.test(this.commandSearchText)) {
          return item.command.toLowerCase().indexOf(this.commandSearchText.toLowerCase()) > -1;
        } else {
          return item.command_h.some(v=> v.indexOf(this.commandSearchText) > -1 );
        }
      });
    }
    return commandList;

  }

    public snapshotCreateFinish(data) {
        this.isCreateDataresultPopupOpen = false;
        // this.snapshotLoadingComponent.init(data);
    }

    public openSnapshotPopup() {
        this.isCreateDataresultPopupOpen = true;
        this.createSnapshotPopup.init({id : this.selectedDataSet.dsId , name : this.selectedDataSet.dsName});
    }
    public closeSnapshotPopup() {
        this.isCreateDataresultPopupOpen = false;
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
          this.selectedDataSet.dsName = this.dsName;

          // Set rule list
          this.setRuleList(apiData['transformRules']);
          this.isAggregationIncluded = this._hasAggregation();

          // init ruleVO
          this.initRule(apiData);

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
      this._prepRnbRuleListComponent.selectedRuleIdx = this.serverSyncIndex;

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
      this.showRuleEdit = false;

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

  /**
   * Set join info when editing
   * @param rule
   */
  private setJoinEditInfo(rule) {

    const jsonRuleString = JSON.parse(rule['jsonRuleString']);

    //this.rightDataset = new Dataset();
    this.rightDataset = new PrDataset();

    // is it append or update ?
    this.rightDataset.joinButtonText = 'Edit Join';

    // 수정시 필요한 룰넘버
    this.rightDataset.ruleNo = rule['ruleNo'];

    // dataset id
    this.rightDataset.dsId = jsonRuleString.dataset2;
    this.rightDataset.selectedJoinType = jsonRuleString.joinType;
    this.rightDataset.rightSelectCol = jsonRuleString.rightCol;
    this.rightDataset.leftSelectCol = jsonRuleString.leftCol;

    this.rightDataset.joinRuleList = [];

    jsonRuleString.leftJoinKey.forEach((item,index) => {
      const info = new JoinInfo();
      info.leftJoinKey = item;
      info.rightJoinKey = jsonRuleString.rightJoinKey[index];
      this.rightDataset.joinRuleList.push(info);
    });
    this.isRuleJoinModalShow = true;
    this.changeDetect.detectChanges();
  }

}

class JoinInfo {
  public leftJoinKey: string;
  public rightJoinKey: string;
}