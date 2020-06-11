import {Component, EventEmitter, Output, Input} from '@angular/core';
import {Connection} from '../domains/connection';
import {ConnectionService} from '../services/connection.service';

@Component({
  selector: 'create-connection-info',
  templateUrl: './create-connection-info.component.html'
})
export class CreateConnectionInfoComponent {
  @Output()
  public readonly onClose = new EventEmitter();
  @Output()
  public readonly onNext = new EventEmitter();
  @Input()
  public connectionInfo: Connection.Entity;

  public isUsedUrl: boolean;

  // input error
  public isUrlError: boolean;
  public isHostnameError: boolean;
  public isPortError: boolean;
  public isDatabaseError: boolean;
  public isSidError: boolean;
  public isCatalogError: boolean;
  public isUsernameError: boolean;
  public isPasswordError: boolean;

  public hostname: string;
  public port: number;
  public url: string;
  public database: string;
  public sid: string;
  public catalog: string;
  public username: string;
  public password: string;

  public connectionValidation: Connection.ConnectionValid;


  constructor(private  connectionService: ConnectionService) {
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
  public checkConnection(): void {
    // init connection validation
    this.connectionValidation = undefined;
    // check valid connection input
    if (this.isValidConnectionInput()) {
      this.connectionService.checkConnection(this.getConnectionParams()).subscribe();
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
    connectionParam.sid = null;
    connectionParam.database = null;
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
  private connectionValidInitialize(): void {
    this.connectionValidation = undefined;
  }

  /**
   * Initail connection input
   * @private
   */
  private _connectionInputInitialize(): void {
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
