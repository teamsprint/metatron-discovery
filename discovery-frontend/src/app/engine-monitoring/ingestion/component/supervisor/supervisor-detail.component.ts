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

import {AfterViewInit, Component, ElementRef, Injector, OnDestroy, OnInit} from '@angular/core';
import {AbstractComponent} from "../../../../common/component/abstract.component";
import {EngineService} from "../../../service/engine.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-detail-upervisor',
  templateUrl: './supervisor-detail.component.html'
})
export class SupervisorDetailComponent extends AbstractComponent implements OnInit, OnDestroy, AfterViewInit {

  // noinspection JSUnusedLocalSymbols
  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              private activatedRoute: ActivatedRoute,
              private engineService: EngineService) {
    super(elementRef, injector);
  }

  public supervisorId;
  public supervisorPayload: any = {};

  public ngOnInit() {
    this.loadingShow();
    this.activatedRoute.params.subscribe((params) => {
      this.supervisorId = params['supervisorId'];
    });

    this._getSupervisorDetail();

    super.ngOnInit();
    this.loadingHide();

  }

  public ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  // 뒤로가기
  public prevSupervisorList(): void {
    this.router.navigate(['/management/engine-monitoring/ingestion/supervisor']);
  }

  private _getSupervisorDetail(): void {
    this.engineService.getSupervisorStatus(this.supervisorId).then((data) => {
      this.supervisorPayload = data.payload;
    })
  }

}
