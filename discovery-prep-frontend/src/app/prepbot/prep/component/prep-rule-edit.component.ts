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
    Component, ElementRef, Injector, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, AfterViewInit
} from '@angular/core';

import {isNullOrUndefined, isUndefined} from 'util';
import * as _ from 'lodash';
import {AbstractComponent} from "../../../common/component/abstract.component";
import {DsType, Field, PrDataset, Rule} from '../../../domain/data-preparation/pr-dataset';
import * as $ from "jquery";
import {PreparationAlert} from "../../util/preparation-alert.util";
import {Alert} from "../../../common/util/alert.util";
import {AbstractPopupComponent} from "../../../common/component/abstract-popup.component";
import {DataflowService} from "../service/dataflow.service";
import {StringUtil} from "../../../common/util/string.util";
import {PrepDatasetDetailComponent} from "../prep-dataset-detail.component";
import {EventBroadcaster} from '../../../common/event/event.broadcaster';
import {DataflowModelService} from "../service/dataflow.model.service";
import {EditRuleComponent} from "../../dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule.component";
import {PreparationCommonUtil} from "../../util/preparation-common.util";
import {Subscription} from "rxjs";
import {PrDataflow} from "../../../domain/data-preparation/pr-dataflow";


@Component({
  selector: 'prep-rule-edit',
  templateUrl: './prep-rule-edit.component.html'
})
export class PrepRuleEditComponent extends AbstractPopupComponent implements OnInit, OnDestroy, AfterViewInit {


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(PrepDatasetDetailComponent)
  private _datasetDetailComp: PrepDatasetDetailComponent;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Input()
  public ruleList: any[] = [];

    @Input()
    public selectedDataSet: PrDataset;


    @Input()
    public dataflow: PrDataflow;


    @Output()
    public jumpEvent = new EventEmitter();

    @Output()
    public redoUndoEvent = new EventEmitter();

    @Output()
    public addRuleEvent = new EventEmitter();

    @Output()
    public editEvent = new EventEmitter();

    @Output()
    public deleteEvent = new EventEmitter();

    @ViewChild('editRule')
    private _editRuleComp: EditRuleComponent;

    public dfId: string;
    public dsId: string;
    public dsName: string;
    public dsList: PrDataset[];
    public selectedRuleIdx: number;
    public isInitDataLoaded: boolean = false;
  // Rules
  public ruleVO: Rule = new Rule();


  // 검색어
  public commandSearchText: string = '';

  // Layer show/hide
  public isMultiColumnListShow: boolean = false;
  public isRuleJoinModalShow: boolean = false;
  public isRuleUnionModalShow: boolean = false;
  public isCommandListShow: boolean = false;

  // Flag for mouse movement and keyboard navigation
  public flag: boolean = false;

  public commandList: any[];
  public editColumnList = [];                 // 수정 할 컬럼 리스트
  public selectedColumns: string[] = [];     // 그리드에서 선택된 컬럼 리스트
  public selectedRows: any = [];             // 그리드에서 선택된 로우 리스트


    // 현재 서버와 맞는 index
    public serverSyncIndex: number;

    // APPEND (룰 등록) / UPDATE (룰 수정) / JUMP / PREPARE_UPDATE (룰 수정하기 위해 jump) / DELETE
    public opString: string = 'APPEND';

    public isAggregationIncluded: boolean = false;


    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    | Constructor
    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private dataflowService: DataflowService,
              private dataflowModelService: DataflowModelService,
              private broadCaster: EventBroadcaster,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  // public ngOnInit() {
  //   // Init
  //   super.ngOnInit();
  // }

    // Init
    public ngOnInit() {

        // Init
        super.ngOnInit();



        // 필드 펼침/숨김에 대한 이벤트
        this.subscriptions.push(
            this.broadCaster.on<any>('EDIT_RULE_SHOW_HIDE_LAYER').subscribe((data: { id : string, isShow : boolean }) => {

                if (data.id === 'toggleList') {
                    this.isMultiColumnListShow = data.isShow;
                }  else {
                    this.isMultiColumnListShow = data.isShow;
                    this.isCommandListShow = false;
                }

            })
        );

        this._initialiseValues();
        this._getDataflowAndDataset();

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
            console.info('promise finishe -->', result);
            this.dataflow = result[0];
            this.dsName = result[1].dsName;
            this.dsList = result[0].datasets;

            // set rule
            if (this.selectedDataSet && this.selectedDataSet.rules && this.selectedDataSet.rules.length > 0) {
                this.setRuleList(this.selectedDataSet.rules);
                this.isAggregationIncluded = this.hasAggregation();
            }

            // init ruleVO
            this.ruleVO.command = '';

            // this._setEditRuleInfo({op:'INITIAL', ruleIdx: null, count: 100, offset: 0}).then((data)=> {
            //
            //     if (data['error']) {
            //         let prep_error = this.dataprepExceptionHandler(data['error']);
            //         PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
            //         return;
            //     }
            //
            //     this.serverSyncIndex = data.apiData.ruleCurIdx;
            //     //this.ruleListComponent.selectedRuleIdx = this.serverSyncIndex; // 처음 들어갔을 때 전에 jump 한 곳으로 나와야 하기 떄문에
            //     this.setRuleListColorWhenJumped(this.serverSyncIndex);
            // });

        }).catch(() => {
            // 로딩 종료
            this.loadingHide();
        });
    }

    /**
     * Get dataflow info (API)
     * @private
     */
    private _getDataflow() {
        return new Promise<any>((resolve, reject) => {
            this.dataflowService.getDataflow(this.dfId).then(result => {
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
            this.dataflowService.getDataset(this.dsId).then(result => {
                resolve(result);
            }).catch((err) => reject(err));
        });
    }


// Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Jump action
   * @param {Number} idx
   */
  public jumpRule(idx : number ) {
    this.ruleList.forEach((rule) =>{
      rule.isEditMode = false;
    });
    this.selectedRuleIdx = idx;
    this.jumpEvent.emit(idx)
  }

  /**
   * When edit button is clicked
   * @param {Rule} rule
   */
  public editRule(rule : Rule) {
    this.selectedRuleIdx = undefined;
    this.editEvent.emit(rule);
  }

  /**
   * Delete rule event
   * @param {number} idx
   */
  public deleteRule(idx: number) {
    this.deleteEvent.emit(idx);
  }


  // command list show
  public showCommandList() {

      // Close all opened select box from rule
      this.broadCaster.broadcast('EDIT_RULE_SHOW_HIDE_LAYER', { id : 'toggleList', isShow : false } );

      // 포커스 이동
      setTimeout(() => $('#commandSearch').trigger('focus'));

      this.commandSearchText = '';
      this.isCommandListShow = true;
      this.initSelectedCommand(this.filteredCommandList);

      this.safelyDetectChanges();

  }

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
      // when Arrow up is pressed
      if (event.keyCode === 38) {

          // 선택된게 없다
          if (idx === -1) {

              // 리스트에 마지막 인덱스를 selected 로 바꾼다
              currentList[lastIndex].isHover = true;

              // 스크롤을 마지막으로 보낸다
              $('.ddp-list-command').scrollTop(lastIndex * height);

              // 리스트에서 가장 첫번쨰가 선택되어 있는데 arrow up 을 누르면 리스트에 마지막으로 보낸다
          } else if (idx === 0) {

              currentList[0].isHover = false;
              currentList[lastIndex].isHover = true;


              // 스크롤을 마지막으로 보낸다
              $('.ddp-list-command').scrollTop(lastIndex * height);

          } else {
              currentList[idx].isHover = false;
              currentList[idx - 1].isHover = true;
              $('.ddp-list-command').scrollTop((idx - 1) * height);
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
              $('.ddp-list-command').scrollTop(0);

          } else {
              currentList[idx].isHover = false;
              currentList[idx + 1].isHover = true;
              $('.ddp-list-command').scrollTop((idx + 1) * height);

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
          // 스크롤, command select 초기화
          this.initSelectedCommand(currentList);
      }
  }


    // noinspection JSMethodCanBeStatic
    /**
     * change commandList selected -> false (초기화)
     */
    public initSelectedCommand(list) {
        list.forEach((item) => {
            return item.isHover = false;
        })
    } // function - initSelectedCommand



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
            this.isAggregationIncluded = this.hasAggregation();
        }

        // init ruleVO
        this.ruleVO.command = '';

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



    /**
     * Check if rule list contains aggregate rule
     * returns true is rule list contains aggregate rule
     * @returns {boolean}
     */
    private hasAggregation() {

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
     * Set colour to rule list when jumped
     * @param idx
     */
    public setRuleListColorWhenJumped(idx : number) {
        this.ruleList.forEach((item, index) => {
            item.isValid = !(index === idx || index < idx);
        });
    }

    /**
     * When command is selected from commandList
     * @param event
     * @param command
     * */
    public selectCommand(event, command) {
        event.stopImmediatePropagation();

        // TODO : Added getting selected columns from grid because didn't show selected columns when command is changed on edit
        this.selectedColumns = this._datasetDetailComp.selectedColumns;



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
        }

        if (command.command !== 'join' && command.command !== 'union') {
            this._editRuleComp.init( this.selectedDataSet.gridData.fields, selectedFields);
        }

        this.initSelectedCommand(this.filteredCommandList);
    }

    /**
     * Command list 에서 Mouseover 일때 Selected = true, mouseleave 일때 selected = false
     * @param event 이벤트
     * @param index
     */
    public commandListHover(event, index) {

        if (!this.flag) {
            if (event.type === 'mouseover') {
                this.filteredCommandList[index].isHover = true;

            } else if (event.type === 'mouseout') {
                this.initSelectedCommand(this.filteredCommandList);
            }
        }
    } // function - commandListHover

    /**
     * 룰 편집 정보 설정
     * @param {any} params
     * @returns {Promise<any>}
     * @private
     */



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

    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    | Protected Method
    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


}
