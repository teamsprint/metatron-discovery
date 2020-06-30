import {Component, EventEmitter, HostBinding, Output, Input, OnInit} from '@angular/core';
@Component({
  selector: 'div[dataflow-dataset-pop]',
  templateUrl: './dataflow-dataset-pop.component.html',
  styleUrls: ['./dataflow-dataset-pop.component.css']
})

export class DataflowDatasetPopComponent implements OnInit{
  @HostBinding('class.pb-layout-popup')
  public readonly pbLayoutPopupClass = true;
  @Output()
  public readonly onClose = new EventEmitter();
  @Input()
  public openType;
  @Input()
  public selectedDatasetIds: string[]; // 선택된 데이터셋 리스트_ID

  public pageReady = false;

  ngOnInit(): void {
    this.pageReady = true;
  }
}
