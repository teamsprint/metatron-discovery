/* tslint:disable */
import {ChangeDetectorRef, Injector, Component, ElementRef, EventEmitter, Output, Input, ViewChild, OnInit, OnDestroy} from '@angular/core';
import {Dataset} from '../domains/dataset';
import {DatasetsService} from '../services/datasets.service';
import {CommonConstant} from '../../common/constants/common.constant';
import {Connection} from '../../connection/domains/connection';
import {ConnectionService} from '../../connection/services/connection.service';
import {LoadingService} from '../../common/services/loading/loading.service';
import {Page, PageResult} from '../../common/constants/page';
import {finalize} from 'rxjs/operators';
import {isNullOrUndefined} from 'util';

@Component({
  selector: 'create-dataset-database',
  templateUrl: './create-dataset-database.component.html'
})


export class CreateDatasetDatabaseComponent implements OnInit{
  @Output()
  public readonly onClose = new EventEmitter();
  @Output()
  public readonly onGotoStep = new EventEmitter();
  private readonly page = new Page();
  private pageResult: PageResult = new PageResult();

  // Connection
  public connectionList: Connection.Entity[] = [];
  public selectedConnection: Connection.Entity  = null;
  public connectionListShow = false;
  public connectionValidation: Connection.ConnectionValid;

  // Database
  public databaseList: string[] = [];
  public isDatabaseListShow = false;
  public selectedDatabase: object = {name: null};

  // Table
  public tableList: string[] = [];
  public isTableListShow = false;
  public selectedTable: object = {name: null};


  constructor(private readonly datasetService: DatasetsService,
              private readonly loadingService: LoadingService,
              public readonly connectionService: ConnectionService) {
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

  public toggleList(target: string) {
    if (target === 'connection') {
      if(this.connectionList == null || this.connectionList.length== 0){
        return;
      }
      this.connectionListShow = !this.connectionListShow;
    } else if (target === 'database') {
      if(this.databaseList == null || this.databaseList.length == 0) {
        this.isDatabaseListShow = false;
        return;
      }
      this.isDatabaseListShow = !this.isDatabaseListShow;
    } else if (target === 'table') {
      if(this.tableList == null || this.tableList.length == 0) {
        this.isTableListShow = false;
        return;
      }
      this.isTableListShow = !this.isTableListShow;
    }
  }


  public changedConnection(temp: Connection.Entity) {
    this.connectionValidation = undefined;
    if (this.selectedConnection.connId !== temp.connId) {
      this.selectedDatabase['name'] = null;
      this.selectedTable['name'] = null;
      this.checkConnection(temp);
    }
    this.connectionListShow = !this.connectionListShow;
  }

  public changedDatabase(database) {
    this.isDatabaseListShow = false;
    this.selectedTable['name'] = null;
    this.selectedDatabase['name'] = database;
    this.getTables(database);
  }


  private getConnections(page: Page) {
    this.loadingService.show();
    this.connectionService
      .getConnections('', page)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe(connections => {
        if (!connections) {
          this.connectionList = [];
          return;
        }
        this.connectionList = connections._embedded.connections;
        this.pageResult  = connections.page;
        if(this.connectionList !== null && this.connectionList.length > 0) {
          const temp: Connection.Entity = this.connectionList[0];
          this.checkConnection(temp);
        }
      });
  }

  private checkConnection(temp: Connection.Entity) {
    this.connectionValidation = undefined;
    this.loadingService.show();
    this.connectionService
      .checkConnection(this.getConnectionParams(temp))
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe(result => {
        if (!result) {
          return;
        }
        const connected: Connection.ConnectionCheck = new Connection.ConnectionCheck();
        connected.connected = result['connected'];
        if (connected.connected) {
          this.connectionValidation = Connection.ConnectionValid.ENABLE_CONNECTION;
          this.selectedConnection = temp;
        }else{
          this.connectionValidation = Connection.ConnectionValid.DISABLE_CONNECTION;
        }
        this.getDatabases();
      });
  }

  private getDatabases() {
    if (this.connectionValidation !== Connection.ConnectionValid.ENABLE_CONNECTION) return;
    const temp: Connection.Entity = this.getConnectionParams(this.selectedConnection);
    this.loadingService.show();
    this.connectionService
      .getDatabases(temp)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe(result => {
        if (!result) {
          return;
        }
        if (result && result.hasOwnProperty('databases')) {
          result['databases'].forEach((item) => {
            this.databaseList.push(item);
          });
        }
      });
  }

  private getTables(database: string) {
    if (this.connectionValidation !== Connection.ConnectionValid.ENABLE_CONNECTION) return;
    if (this.selectedDatabase['name'] === null) return;
    const temp: Connection.Entity = this.getConnectionParams(this.selectedConnection);
    this.loadingService.show();
    this.connectionService
      .getTables(temp, database)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe(result => {
        if (!result) {
          return;
        }
        if (result && result.hasOwnProperty('tables')) {
          result['tables'].forEach((item) => {
            this.tableList.push(item['name']);
          });
        }
      });
  }

  private getConnectionParams(temp: Connection.Entity): Connection.Entity {
    const connectionParam: Connection.Entity = new Connection.Entity();
    connectionParam.implementor = temp.implementor;

    // not use URL
    if (this.checkParamEmpty(temp.url)) {
      // HOST
      connectionParam.hostname = temp.hostname;
      connectionParam.port = String(temp.port);
      if (!this.checkParamEmpty(temp.sid)) {
        connectionParam.sid = temp.sid;
      } else if (!this.checkParamEmpty(temp.database)) {
        connectionParam.database = temp.database;
      } else if (!this.checkParamEmpty(temp.catalog)) {
        connectionParam.catalog = temp.catalog;
      }
    } else {  // use URL
      connectionParam.url = temp.url;
    }
    connectionParam.username = temp.username;
    connectionParam.password = temp.password;
    connectionParam.connType = temp.connType;
    return connectionParam;
  }

  private checkParamEmpty(param: string): boolean {
    if (param === null || param === undefined || param.trim() === '') {
      return true;
    }
    return false;
  }
}
