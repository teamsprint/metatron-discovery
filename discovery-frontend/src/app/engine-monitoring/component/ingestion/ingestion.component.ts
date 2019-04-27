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
import {AbstractComponent} from '../../../common/component/abstract.component';
import {StateService} from '../../service/state.service';
import {EngineService} from '../../service/engine.service';
import {Engine} from '../../../domain/engine-monitoring/engine';

@Component({
  selector: '[ingestion]',
  templateUrl: './ingestion.component.html',
  host: { '[class.ddp-wrap-contents-det]': 'true' }
})
export class IngestionComponent extends AbstractComponent implements OnInit, OnDestroy, AfterViewInit {

  // noinspection JSUnusedLocalSymbols
  constructor(
    protected elementRef: ElementRef,
    protected injector: Injector,
    private stateService: StateService,
    private engineService: EngineService) {
    super(elementRef, injector);
  }

  public ngOnInit() {
    super.ngOnInit();
    this.loadingHide();

    this.subscriptions.push(
      this.stateService.changeTab$.subscribe(({ current, next }) => {
        if (current.isIngestion()) {
          this._changeTab(next);
        }
      })
    );
  }

  public ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  private _changeTab(contentType: Engine.ContentType) {
    this.router.navigate([ `${Engine.Constant.ROUTE_PREFIX}${contentType}` ]);
  }
}
