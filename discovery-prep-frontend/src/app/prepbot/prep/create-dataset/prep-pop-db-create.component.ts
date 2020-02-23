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

import {Component, ElementRef, HostListener, Injector, OnDestroy, OnInit, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {AbstractComponent} from '../../../common/component/abstract.component';
import {DataflowService} from '../../dataflow/service/dataflow.service';
import {ActivatedRoute} from "@angular/router";
import {PopupService} from '../../../common/service/popup.service';

import { PrConnectionService } from '../service/connection.service';

@Component({
  selector: 'prep-pop-db-create',
  templateUrl: './prep-pop-db-create.component.html'
})
export class PrepPopDBCreateComponent extends AbstractComponent {

    @Input()
        public step: string = '';
        @Output()
        public stepChange : EventEmitter<string> = new EventEmitter();

     @Output()
        public createClose : EventEmitter<void> = new EventEmitter();


    public connections : any = [];
    public isShow = false;

    // 생성자
    constructor(protected elementRef: ElementRef,
                private popupService: PopupService,
                public connectionService: PrConnectionService,
                protected injector: Injector,
                private activatedRoute: ActivatedRoute) {

        super(elementRef, injector);
    }

    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     | Override Method
     |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

    public ngOnInit() {
        super.ngOnInit();
        this.init();
    }

    public ngAfterViewInit() {
            this._getConnections();
    }

    // Destory
    public ngOnDestroy() {
        super.ngOnDestroy();
    }

    public init() {
        this.isShow = true;
    }
  public goto(step) {
            this.step = step;
        this.stepChange.emit( step );
    }

    public next() {
         this.goto('create-dataset-name');

    }
    public close() {
        this.createClose.emit();
    }

    public goPre(){
       this.goto('complete-create-dataset');
    }

    public _getConnections() {
        this.connectionService.getConnections().then((result) => {
            this.connections = [];
            result.map((connection) => {
                this.connections.push(connection);
            });
        }).catch((error) => {
        console.log(error);
        });
    }

    // should be changed with ngIf
    public listShow :boolean = false;
    public toggleList() {
        this.listShow = !this.listShow;
    }
}