import {Component, ViewChild, OnInit} from '@angular/core';
import {ConnectionService} from '../services/connection.service';
import {LoadingService} from '../../common/services/loading/loading.service';
import {finalize} from 'rxjs/operators';
import {CommonConstant} from '../../common/constants/common.constant';
import {Page, PageResult} from '../../common/constants/page';
import {Connection} from '../domains/connection';
import {LnbComponent} from '../../lnb/components/lnb.component';
import {LocalStorageService} from '../../common/services/local-storage/local-storage.service';
import {ViewMode} from '../../main/value-objects/view-mode';

@Component({
  templateUrl: './connection-list.component.html',
  styleUrls: ['./connection-list.component.css']
})
export class ConnectionListComponent implements OnInit{

  public readonly VIEW_MODE = ViewMode;

  private readonly page = new Page();
  private pageResult: PageResult = new PageResult();
  public searchText = '';
  public connections: Array<Connection.Entity> = [];

  @ViewChild(LnbComponent)
  public lnbComponent: LnbComponent;

  constructor(private readonly connectionService: ConnectionService,
              private readonly loadingService: LoadingService,
              public readonly localStorageService: LocalStorageService) {
  }
  ngOnInit(): void {
    this.initialize();
    this.getConnections(this.page);
  }
  private initialize() {
    this.page.page = 0;
    this.page.size = 100;
    this.page.sort = CommonConstant.API_CONSTANT.PAGE_SORT_MODIFIED_TIME_DESC;
  }


  /**
   * Search dataflow
   */
  public searchConnections(event) {
    if (13 === event.keyCode) {
      this.lnbOnPageRefresh();
    }
  }


  public lnbOnPageRefresh() {
    this.initialize();
    this.getConnections(this.page);
  }

  private getConnections(page: Page) {
    const search: string = encodeURI(this.searchText);
    this.loadingService.show();
    this.connectionService
      .getConnections(search, page)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe(connections => {
        if (!connections) {
          this.connections = [];
          return;
        }
        this.connections = connections._embedded.connections;
        this.pageResult  = connections.page;
      });
  }

  public createConnection(): void {
    this.lnbComponent.openCreateConnectionPopup();
  }

  public updateConnection(connId: string): void {
    this.lnbComponent.openUpdateConnectionPopup(connId);
  }

  public returnListNumber(num: number): number {
    let rtn = 0;
    if (this.pageResult !== null) {
      rtn = this.pageResult.totalElements - (this.pageResult.number * this.pageResult.size + num);
    }
    return rtn;
  }
}
