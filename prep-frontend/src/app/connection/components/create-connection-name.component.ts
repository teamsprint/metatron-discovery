import {Component, EventEmitter, Output, Input} from '@angular/core';
import {Connection} from '../domains/connection';
import {ConnectionService} from '../services/connection.service';

@Component({
  selector: 'create-connection-name',
  templateUrl: './create-connection-name.component.html'
})

export class CreateConnectionNameComponent {
  @Output()
  public readonly onClose = new EventEmitter();
  @Output()
  public readonly onPrev = new EventEmitter();
  @Output()
  public readonly onDone = new EventEmitter();
  @Input()
  public connectionInfo: Connection.Entity;
  public isNameError = false;

  public name = '';
  public description = '';

  constructor(private  connectionService: ConnectionService) {
  }

  /** Complete */
  public complete() {
    // console.info('this.connectionInfo', this.connectionInfo);
    this.isNameError = false;
    if (this.name === '' || this.name.length === 0) {
      this.isNameError = true;
    }
    if (this.isNameError) {
      return;
    }
    this.connectionInfo.name = this.name;
    this.connectionInfo.description = this.description;
    this.connectionService.createConnection(this.connectionInfo).subscribe(result => {
      if (result !== null) {
        this.onDone.emit();
      }
    });
  }

}
