/* tslint:disable */
import {Component, EventEmitter, Output, OnInit, OnDestroy} from '@angular/core';
import {Dataset} from '../domains/dataset';
import {CommonConstant} from '../../common/constants/common.constant';
import {Connection} from '../../connection/domains/connection';
import {ConnectionService} from '../../connection/services/connection.service';
import {LoadingService} from '../../common/services/loading/loading.service';
import {Page, PageResult} from '../../common/constants/page';
import {AngularGridInstance, Column, FieldType, GridOption, SelectedRange} from 'angular-slickgrid';
import {finalize} from 'rxjs/operators';

@Component({
  selector: 'create-dataset-database',
  templateUrl: './create-dataset-database.component.html'
})

export class CreateDatasetDatabaseComponent implements OnInit, OnDestroy{
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

  // Preview Data
  public enableNextStep = false;

  columnDefinitions: Column[] = [];

  gridOptions: GridOption = {
    autoResize: {
      containerId: 'connction-table-container',
      sidePadding: 10
    },
    rowSelectionOptions: {
      selectActiveRow: false
    },
    rowHeight: 26,
    enableAutoResize: true,
    enableCellNavigation: true,
    showCustomFooter: true,
    enableExcelCopyBuffer: true,
    excelCopyBufferOptions: {
      onCopyCells: (e, args: { ranges: SelectedRange[] }) => console.log('onCopyCells', args.ranges),
      onPasteCells: (e, args: { ranges: SelectedRange[] }) => console.log('onPasteCells', args.ranges),
      onCopyCancelled: (e, args: { ranges: SelectedRange[] }) => console.log('onCopyCancelled', args.ranges),
    }
  };

  dataset: Array<object> = [];
  gridInstance: AngularGridInstance;
  private gridUseRowId: string = 'connectin_grid_id';

  constructor(private readonly loadingService: LoadingService,
              public readonly connectionService: ConnectionService) {
  }

  ngOnInit(): void {
    this.initialize();
    this.getConnections(this.page);
  }

  ngOnDestroy() : void {
    if (this.gridInstance !== null) {
      this.gridInstance  = null;
    }
  }


  private initialize() {
    this.page.page = 0;
    this.page.size = 100;
    this.page.sort = CommonConstant.API_CONSTANT.PAGE_SORT_MODIFIED_TIME_DESC;
  }

  private initializeGrid() {
    this.columnDefinitions = [];
    this.dataset = [];
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
    this.enableNextStep = false;
    if (this.selectedConnection.connId !== temp.connId) {
      this.selectedDatabase['name'] = null;
      this.selectedTable['name'] = null;
      this.databaseList = [];
      this.tableList = [];
      this.checkConnection(temp);
    }
    this.connectionListShow = !this.connectionListShow;
    this.initializeGrid();
  }

  public changedDatabase(database) {
    this.enableNextStep = false;
    if (this.selectedDatabase['name'] !== database) {
      this.selectedDatabase['name'] = database;
      this.selectedTable['name'] = null;
      this.tableList = [];
      this.getTables(database);
    }
    this.isDatabaseListShow = false;
    this.initializeGrid();
  }

  public changedTable(table) {
    this.enableNextStep = false;
    if (this.selectedTable['name'] !== table) {
      this.selectedTable['name'] = table;
      this.getPreviewData(this.selectedDatabase['name'], table);
    }
    this.isTableListShow = false;
    this.initializeGrid();
  }

  public returnDbTypeDataset() {
    const dataset: Dataset.DatasetDatabase = new Dataset.DatasetDatabase;
    dataset.connectionName = this.selectedConnection.name;
    dataset.implementor = this.selectedConnection.implementor;
    dataset.importType = Dataset.IMPORT_TYPE.DATABASE;
    dataset.connId = this.selectedConnection.connId;
    dataset.tblName = this.selectedTable['name'];
    dataset.dbName = this.selectedDatabase['name'];
    dataset.rsType = Dataset.RS_TYPE.TABLE;
    dataset.queryStmt = 'select * from ' + this.selectedDatabase['name'] + '.' + this.selectedTable['name'];
    return dataset;
  }

  public next() {
    if (this.connectionValidation !== Connection.ConnectionValid.ENABLE_CONNECTION) return;
    if (this.selectedDatabase['name'] === null) return;
    if (this.selectedTable['name'] === null) return;
    if (!this.enableNextStep) return;
    this.onGotoStep.emit('create-dataset-name');
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

  private getTables(databaseName: string) {
    if (this.connectionValidation !== Connection.ConnectionValid.ENABLE_CONNECTION) return;
    if (this.selectedDatabase['name'] === null) return;
    const temp: Connection.Entity = this.getConnectionParams(this.selectedConnection);
    this.loadingService.show();
    this.connectionService
      .getTables(temp, databaseName)
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

  private getPreviewData(databaseName: string, tableName: string) {
    if (this.connectionValidation !== Connection.ConnectionValid.ENABLE_CONNECTION) return;
    if (this.selectedDatabase['name'] === null) return;
    if (this.selectedTable['name'] === null) return;
    const temp: Connection.Entity = this.getConnectionParams(this.selectedConnection);
    this.loadingService.show();
    this.connectionService
      .getPreviewData(temp, databaseName, tableName)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe(result => {
        if (!result) {
          return;
        }
        this.initializeGrid();
        if (result && result.hasOwnProperty('fields')) {
          result['fields'].forEach((item) => {
            const columnValue = {};
            columnValue['id']= item['name'];
            columnValue['name']= item['name'];
            columnValue['field']= item['name'];
            columnValue['sortable'] = false;
            if(columnValue['type'] === 'STRING') {
              columnValue['type'] = FieldType.string;
            } else if (columnValue['type'] === 'TIMESTAMP') {
              columnValue['type'] = FieldType.dateTime;
            } else {
              columnValue['type'] = FieldType.number;
            }
            columnValue['minWidth'] = 100;
            this.columnDefinitions.push(columnValue as Column);
          });
        }

        if (result && result.hasOwnProperty('data')) {
          let idnum = 0;
          result['data'].forEach((item) => {
            item['connectin_grid_id'] = this.gridUseRowId + '_' + idnum;
            idnum++;
            this.dataset.push(item);
          });
        }

        this.enableNextStep = true;
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

  angularGridReady(gridInstance: AngularGridInstance) {
    this.gridInstance = gridInstance;
    this.gridInstance.dataView.setItems(this.dataset, this.gridUseRowId);
  }
}
