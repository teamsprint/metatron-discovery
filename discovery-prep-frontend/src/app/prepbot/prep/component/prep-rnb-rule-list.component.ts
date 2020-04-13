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
  Component, ElementRef, Injector, OnInit, OnDestroy, Input, Output, EventEmitter
} from '@angular/core';
import {AbstractComponent} from "../../../common/component/abstract.component";
import {Rule} from '../../../domain/data-preparation/pr-dataset';
import {isNullOrUndefined} from "util";

@Component({
  selector: 'prep-rnb-rule-list',
  templateUrl: './prep-rnb-rule-list.component.html',
})
export class PrepRnbRuleListComponent extends AbstractComponent implements OnInit, OnDestroy{


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Input()
  public ruleList: any[] = [];

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

  public selectedRuleIdx: number;

  public lastShow: boolean = true;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    // Init
    super.ngOnInit();
  }

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public initEditMode() {
    this.ruleList.forEach((rule) =>{
      rule.isInsertStep = false;
    });
    this.lastShow = true;
  }
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
    //this.selectedRuleIdx = undefined;
    this.editEvent.emit(rule);
  }

  /**
   * Delete rule event
   * @param {number} idx
   */
  public deleteRule(idx: number) {
    this.deleteEvent.emit(idx);
  }

  public insertStep(rule : Rule) {
    rule.isInsertStep = true;
    this.lastShow = false;

    //this.selectedRuleIdx = undefined;
    this.addRuleEvent.emit(rule['ruleNo']);
  }

  /**
   * 중간 룰 추가 상태 취소
   * @param {Rule} rule
   * @param {Number} idx
   */
  public cancelInsertMode( rule : Rule, idx : number ) {
    rule.isInsertStep = false;
    this.lastShow = true;

    this.selectedRuleIdx = idx;
    this.jumpRule(idx);
  }

  public isInsertStep(): boolean {
    return !isNullOrUndefined(this.ruleList.find(rule => rule.isInsertStep == true))
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


}
