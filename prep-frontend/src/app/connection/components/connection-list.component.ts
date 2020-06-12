import {Component} from '@angular/core';
import {ConnectionService} from '../services/connection.service';
import {LoadingService} from '../../common/services/loading/loading.service';
import {finalize} from 'rxjs/operators';
import {CommonConstant} from '../../common/constants/common.constant';
import {Page} from '../../common/constants/page';
import {Connection} from '../domains/connection';

@Component({
  templateUrl: './connection-list.component.html',
  styleUrls: ['./connection-list.component.css']
})
export class ConnectionListComponent {

  private readonly page = new Page();
  public searchText = '';
  public connections: Array<Connection.Entity> = [];

  constructor(private readonly connectionService: ConnectionService,
              private readonly loadingService: LoadingService) {
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

  private getConnections(page: Page) {
    this.loadingService.show();

    this.connectionService
      .getConnections(this.searchText, page)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe(connections => {
        if (!connections) {
          this.connections = [];
          return;
        }
        if (connections.hasOwnProperty('_embedded')) {
          if (connections['_embedded'].hasOwnProperty('connections')) {
            this.connections = connections['_embedded']['connections'];
          }
        }else{
          this.connections = [];
        }
      });
  }
}
