import {Component, EventEmitter, HostBinding, Output} from '@angular/core';
import {Dataflow} from '../../dataflow/domains/dataflow';

@Component({
  selector: 'div[create-dataflow]',
  templateUrl: './create-dataflow.component.html',
  styleUrls: ['./create-dataflow.component.css']
})

export class CreateDataflowComponent {

  @HostBinding('class.pb-layout-popup')
  public readonly pbLayoutPopupClass = true;
  @Output()
  public readonly onClose = new EventEmitter();
  @Output()
  public readonly onDone = new EventEmitter();

  public step = '';
  public dataflow: Dataflow.ValueObjects.Create;

  public createDataflowInfo(): void {
    this.dataflow = new Dataflow.ValueObjects.Create();
    this.dataflow.dataset = [];
    this.step = 'create-dataflow-info';
  }

}
