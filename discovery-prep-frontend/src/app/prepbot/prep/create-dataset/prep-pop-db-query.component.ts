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
import {DataflowService} from '../service/dataflow.service';
import {DsType, ImportType, PrDatasetJdbc, QueryInfo, TableInfo,} from '../../../domain/data-preparation/pr-dataset';
import {Dataconnection} from "../../../domain/dataconnection/dataconnection";
import {ActivatedRoute} from "@angular/router";
import {PopupService} from '../../../common/service/popup.service';
import {PageResult} from "../../../domain/common/page";
import { PrConnectionService } from '../service/connection.service';
import {ConnectionComponent, ConnectionValid} from "../../../data-storage/component/connection/connection.component";
import {isNullOrUndefined} from 'util';

@Component({
    selector: 'prep-pop-db-query',
    templateUrl: './prep-pop-db-query.component.html'
})
export class PrepPopDBQueryComponent extends AbstractComponent {

    @Output()
    public stepChange : EventEmitter<string> = new EventEmitter();

    @Output()
    public createClose : EventEmitter<void> = new EventEmitter();



    // 생성자
    constructor(protected elementRef: ElementRef,
                private popupService: PopupService,
                public connectionService: PrConnectionService,
                protected injector: Injector,
                private activatedRoute: ActivatedRoute) {

        super(elementRef, injector);
    }

    public ngOnInit() {
        super.ngOnInit();

    }
    public ngAfterViewInit() {

    }

    // Destory
    public ngOnDestroy() {
        super.ngOnDestroy();
    }

    public init() {
        // this.isShow = true;
    }


    public close() {
        this.createClose.emit();
    }

    public goPre(){
        this.stepChange.emit( 'DB' );
    }

    public complete() {

    }



}