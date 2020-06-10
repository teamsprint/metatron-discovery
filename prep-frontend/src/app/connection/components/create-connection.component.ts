import {Component, EventEmitter, HostBinding, Output} from '@angular/core';

@Component({
  selector: 'div[create]',
  templateUrl: './create-connection.component.html',
  styleUrls: ['./create-connection.component.css']
})
export class CreateConnectionComponent {

  @HostBinding('class.pb-layout-popup')
  public readonly pbLayoutPopupClass = true;

  @Output()
  public readonly onClose = new EventEmitter();
}
