import {Component, EventEmitter, HostBinding, Output, Input} from '@angular/core';
import {Connection} from '../domains/connection';

@Component({
  selector: 'div[create-connection]',
  templateUrl: './create-connection.component.html',
  styleUrls: ['./create-connection.component.css']
})
export class CreateConnectionComponent {

  @HostBinding('class.pb-layout-popup')
  public readonly pbLayoutPopupClass = true;
  @Output()
  public readonly onClose = new EventEmitter();
  @Output()
  public readonly onDone = new EventEmitter();

  public connectionInfo: Connection.Entity;
  public step = '';

  public createConnectionInfo(): void {
    this.connectionInfo = new Connection.Entity();
    this.connectionInfo.connType = Connection.ConnType.DATABASE;
    this.connectionInfo.implementor = 'MYSQL';
    this.connectionInfo.modifySubYn = 'Y';
    this.step = 'create-connection-info';
  }

  public createInfoNextEmit(): void {
    this.step = 'create-connection-name';
  }

  public createNamePrevEmit(): void {
    this.step = 'create-connection-info';
  }

}
