import {Component, EventEmitter, HostBinding, Output, Input} from '@angular/core';
import {Connection} from '../domains/connection';
import {ConnectionService} from '../services/connection.service';
import {LoadingService} from '../../common/services/loading/loading.service';
import {finalize} from 'rxjs/operators';

@Component({
  selector: 'div[update-connection]',
  templateUrl: './update-connection.component.html',
  styleUrls: ['./update-connection.component.css']
})

export class UpdateConnectionComponent {

  @HostBinding('class.pb-layout-popup')
  public readonly pbLayoutPopupClass = true;
  @Output()
  public readonly onClose = new EventEmitter();
  @Output()
  public readonly onDone = new EventEmitter();
  @Input()
  public connId: string;

  public connectionInfo: Connection.Entity;
  public connectionValidation: Connection.ConnectionValid;

  public isUsedUrl: boolean;

  // input error
  public isNameError: boolean;
  public isUrlError: boolean;
  public isHostnameError: boolean;
  public isPortError: boolean;
  public isDatabaseError: boolean;
  public isSidError: boolean;
  public isCatalogError: boolean;
  public isUsernameError: boolean;
  public isPasswordError: boolean;

  public name: string;
  public description: string;
  public hostname: string;
  public port: number;
  public url: string;
  public database: string;
  public sid: string;
  public catalog: string;
  public username: string;
  public password: string;


  constructor(private readonly connectionService: ConnectionService,
              private readonly loadingService: LoadingService) {
  }

  public updateConnectionInfo(): void {
    this.connectionInfo = new Connection.Entity();
    this.connectionInfo.connType = Connection.ConnType.DATABASE;
    this.connectionInfo.implementor = 'MYSQL';
    this.connectionInfo.connId = this.connId;

    this._connectionInputInitialize();
    // input error initial
    this.inputErrorInitialize();
    this.connectionValidInitialize();
    // Connection Detail Info
    this.getConnectionInfo();
  }

  private getConnectionInfo(): void {
    this.loadingService.show();
    this.connectionService
      .getConnection(this.connectionInfo.connId)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe(result => {
        if (!result) {
          return;
        }
        if (result.hasOwnProperty('implementor') && result['implementor'] !== null) {
          this.connectionInfo.implementor = result['implementor'];
        }
        if (result.hasOwnProperty('name') && result['name'] !== null) {
          this.name = result['name'];
        }
        if (result.hasOwnProperty('description') && result['description'] !== null) {
          this.description = result['description'];
        }
        if (result.hasOwnProperty('hostname') && result['hostname'] !== null) {
          this.hostname = result['hostname'];
        }
        if (result.hasOwnProperty('port') && result['port'] !== null) {
          this.port = Number(result['port']);
        }
        if (result.hasOwnProperty('url') && result['url'] !== null) {
          this.url = result['url'];
          this.isUsedUrl = true;
        }
        if (result.hasOwnProperty('database') && result['database'] !== null) {
          this.database = result['database'];
        }
        if (result.hasOwnProperty('sid') && result['sid'] !== null) {
          this.sid = result['sid'];
        }
        if (result.hasOwnProperty('catalog') && result['catalog'] !== null) {
          this.catalog = result['catalog'];
        }
        if (result.hasOwnProperty('username') && result['username'] !== null) {
          this.username = result['username'];
        }
        if (result.hasOwnProperty('password') && result['password'] !== null) {
          this.password = result['password'];
        }
      });

  }

  public onChangeConnectionType(implementor: string): void {
    if (this.connectionInfo !== null) {
      this.connectionInfo.implementor = implementor;

      this._connectionInputInitialize();
      // input error initial
      this.inputErrorInitialize();
      this.connectionValidInitialize();
    }
  }

  /**
   * Change use URL
   */
  public onChangeUseUrl(): void {
    this.isUsedUrl = !this.isUsedUrl;
    // input error initial
    this.inputErrorInitialize();
    this.connectionValidInitialize();
  }

  /**
   * Check valid connection
   */
  public checkConnection() {
    this.connectionValidation = undefined;
    if (this.isValidConnectionInput()) {
      this.loadingService.show();
      this.connectionService
        .checkConnection(this.getConnectionParams())
        .pipe(finalize(() => this.loadingService.hide()))
        .subscribe(result => {
          if (!result) {
            return;
          }
          const connected: Connection.ConnectionCheck = new Connection.ConnectionCheck();
          connected.connected = result['connected'];
          this.checkConnectionResult(connected);
        });
    }
  }

  private checkConnectionResult(result: Connection.ConnectionCheck) {
    if (result !== null && result.connected) {
      this.connectionValidation = Connection.ConnectionValid.ENABLE_CONNECTION;
    }else{
      this.connectionValidation = Connection.ConnectionValid.DISABLE_CONNECTION;
    }
  }

  /**
   * Is enable connection
   * @return {boolean}
   */
  public isEnableConnection(): boolean {
    return this.connectionValidation === Connection.ConnectionValid.ENABLE_CONNECTION;
  }

  /**
   * Is disable connection
   * @return {boolean}
   */
  public isDisableConnection(): boolean {
    return this.connectionValidation === Connection.ConnectionValid.DISABLE_CONNECTION;
  }

  /**
   * Is require check connection
   * @return {boolean}
   */
  public isRequireCheckConnection(): boolean {
    return this.connectionValidation === Connection.ConnectionValid.REQUIRE_CONNECTION_CHECK;
  }

  /**
   * DONE
   */
  public done() {
    if (this.connectionValidation !== Connection.ConnectionValid.ENABLE_CONNECTION ) {
      this.connectionValidation = Connection.ConnectionValid.REQUIRE_CONNECTION_CHECK;
      return;
    }
    if (this.checkParamEmpty(this.name)) {
      this.isNameError = true;
      return;
    }
    // not use URL
    if (!this.isUsedUrl) {
      // HOST
      this.connectionInfo.hostname = this.hostname;
      this.connectionInfo.port = String(this.port);
      if (!this.isDisableSid()) {
        this.connectionInfo.sid = this.sid;
      } else if (!this.isDisableDatabase()) {
        this.connectionInfo.database = this.database;
      } else if (!this.isDisableCatalog()) {
        this.connectionInfo.catalog = this.catalog;
      }
    } else {  // use URL
      this.connectionInfo.url = this.url;
    }
    this.connectionInfo.username = this.username;
    this.connectionInfo.password = this.password;
    this.connectionInfo.connType = this.connectionInfo.connType;
    // this.onNext.emit();

    this.connectionInfo.name = this.name;
    this.connectionInfo.description = this.description;
    this.loadingService.show();
    this.connectionService.updateConnection(this.connId, this.connectionInfo)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe(result => {
        if (result !== null) {
          this.onDone.emit();
        }
      });
  }

  private getConnectionParams(): Connection.Entity {
    const connectionParam: Connection.Entity = new Connection.Entity();
    connectionParam.implementor = this.connectionInfo.implementor;

    // not use URL
    if (!this.isUsedUrl) {
      // HOST
      connectionParam.hostname = this.hostname;
      connectionParam.port = String(this.port);
      if (!this.isDisableSid()) {
        connectionParam.sid = this.sid;
      } else if (!this.isDisableDatabase()) {
        connectionParam.database = this.database;
      } else if (!this.isDisableCatalog()) {
        connectionParam.catalog = this.catalog;
      }
    } else {  // use URL
      connectionParam.url = this.url;
    }
    connectionParam.username = this.username;
    connectionParam.password = this.password;
    connectionParam.connType = this.connectionInfo.connType;
    return connectionParam;
  }


  /**
   * Is valid connection input
   * @return {boolean}
   */
  private isValidConnectionInput(): boolean {
    let result = true;
    // not use URL
    if (!this.isUsedUrl) {
      // check HOST
      if (this.checkParamEmpty(this.hostname)) {
        this.isHostnameError = true;
        result = false;
      }
      // check PORT
      if (!this.port) {
        this.isPortError = true;
        result = false;
      }
      // check SID
      if (!this.isDisableSid() && this.checkParamEmpty(this.sid)) {
        this.isSidError = true;
        result = false;
      } else if (!this.isDisableDatabase() && this.checkParamEmpty(this.database)) {
        this.isDatabaseError = true;
        result = false;
      } else if (!this.isDisableCatalog() && this.checkParamEmpty(this.catalog)) {
        this.isCatalogError = true;
        result = false;
      }
    } else if (this.checkParamEmpty(this.url)) {  // check URL
      this.isUrlError = true;
      result = false;
    }
    // check enable authentication
    if (this.checkParamEmpty(this.username)) {
      this.isUsernameError = true;
      result = false;
    }
    // check password
    if (this.checkParamEmpty(this.password)) {
      this.isPasswordError = true;
      result = false;
    }
    return result;
  }

  private checkParamEmpty(param: string): boolean {
    if (param === null || param === undefined || param.trim() === '') {
      return true;
    }
    return false;
  }

  public isDisableSid(): boolean {
    if (this.connectionInfo.implementor !== null && this.connectionInfo.implementor.toUpperCase() === 'TIBERO') {
      return false;
    }
    return true;
  }
  public isDisableDatabase(): boolean {
    if (this.connectionInfo.implementor !== null && this.connectionInfo.implementor.toUpperCase() === 'POSTGRESQL') {
      return false;
    }
    return true;
  }
  public isDisableCatalog(): boolean {
    if (this.connectionInfo.implementor !== null && this.connectionInfo.implementor.toUpperCase() === 'PRESTO') {
      return false;
    }
    return true;
  }

  /**
   * Initial input error
   */
  private inputErrorInitialize(): void {
    this.isNameError = undefined;
    this.isUrlError = undefined;
    this.isHostnameError = undefined;
    this.isPortError = undefined;
    this.isDatabaseError = undefined;
    this.isSidError = undefined;
    this.isCatalogError = undefined;
    this.isUsernameError = undefined;
    this.isPasswordError = undefined;
  }

  /**
   * Initial connection valid
   */
  public connectionValidInitialize(): void {
    this.connectionValidation = undefined;
  }

  /**
   * Initail connection input
   * @private
   */
  private _connectionInputInitialize(): void {
    this.name = undefined;
    this.description  = undefined;
    this.hostname = undefined;
    this.port = undefined;
    this.url = undefined;
    this.database = undefined;
    this.sid = undefined;
    this.catalog = undefined;
    this.username = undefined;
    this.password = undefined;
    this.isUsedUrl = undefined;
  }

}