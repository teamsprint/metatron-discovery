import {Component, EventEmitter, HostBinding, Output, ViewChild} from '@angular/core';
import {Dataflow} from '../../dataflow/domains/dataflow';
import {Dataset} from '../../dataset/domains/dataset';
import {CreateDataflowListComponent} from './create-dataflow-list.component';

@Component({
  selector: 'div[create-dataflow]',
  templateUrl: './create-dataflow.component.html',
  styleUrls: ['./create-dataflow.component.css']
})

export class CreateDataflowComponent {
  @HostBinding('class.pb-layout-popup')
  public readonly pbLayoutPopupClass = true;
  @ViewChild(CreateDataflowListComponent)
  public createDataflowList: CreateDataflowListComponent;
  @Output()
  public readonly onClose = new EventEmitter();
  @Output()
  public readonly onDone = new EventEmitter();
  public step = '';
  public dataflow: Dataflow.ValueObjects.Create;
  public selectedDatasets: Dataset.SimpleListEntity[] = [];

  public createDataflowInfo(): void {
    this.dataflow = new Dataflow.ValueObjects.Create();
    this.dataflow.dataset = [];
    this.selectedDatasets = [];
    this.step = 'create-dataflow-list';
  }

  public createDataflowName(): void {
    this.dataflow = new Dataflow.ValueObjects.Create();
    this.dataflow.dataset = [];
    this.selectedDatasets = [];
    const data = this.createDataflowList.returnSelectedDatasets();
    for (const dataset of data) {
      this.selectedDatasets.push(dataset);
    }
    if (this.selectedDatasets !== null && this.selectedDatasets.length > 0) {
      this.selectedDatasets.forEach((item) => {
        this.dataflow.dataset.push(item.dsId);
      });
    }
    this.step = 'create-dataflow-name';
  }
}
