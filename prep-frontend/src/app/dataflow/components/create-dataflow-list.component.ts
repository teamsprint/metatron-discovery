import {Component, OnInit, EventEmitter, Output, Input} from '@angular/core';
import {Dataflow} from '../../dataflow/domains/dataflow';
import {LoadingService} from '../../common/services/loading/loading.service';
import {CommonConstant} from '../../common/constants/common.constant';
import {DatasetsService} from '../../dataset/services/datasets.service';
import {finalize} from 'rxjs/operators';
import {Page} from '../../common/constants/page';
import {Dataset} from '../../dataset/domains/dataset';

@Component({
  selector: 'create-dataflow-list',
  templateUrl: './create-dataflow-list.component.html'
})

export class CreateDataflowListComponent implements OnInit{

  @Output()
  public readonly onClose = new EventEmitter();
  @Output()
  public readonly onNext = new EventEmitter();
  @Input()

  public dataflow: Dataflow.ValueObjects.Create;
  @Input()
  public selectedDatasetId: string; // 미리보기를 위해 화면에 선택된 데이터셋


  public datasets: Dataset.SimpleEntity[] = []; // 화면에 보여지는 리스트

  public searchText = '';
  public isAllCheckedStatus = false;
  public selectedContentSort: Order = new Order();

  private page = new Page();

  constructor(private readonly datasetService: DatasetsService,
              private readonly loadingService: LoadingService) {
  }

  ngOnInit(): void {
    this.initialize();
    this.getDatasets();
  }

  private initialize() {
    this.page.page = 0;
    this.page.size = 100;
    this.page.sort = CommonConstant.API_CONSTANT.PAGE_SORT_MODIFIED_TIME_DESC;
  }

  /**
   * Search dataflow
   */
  public searchDatasets(event) {
    if (13 === event.keyCode) {
      // this.lnbOnPageRefresh();
    }
  }

  /**
   * 정렬 정보 변경
   */
  public changeOrder(column: string) {

    // 상세화면 초기화(close)
    this.selectedDatasetId = '';

    // page sort 초기화
    this.selectedContentSort.sort = this.selectedContentSort.key !== column ? 'default' : this.selectedContentSort.sort;
    // 정렬 정보 저장
    this.selectedContentSort.key = column;

    if (this.selectedContentSort.key === column) {
      // asc, desc, default
      switch (this.selectedContentSort.sort) {
        case 'asc':
          this.selectedContentSort.sort = 'desc';
          break;
        case 'desc':
          this.selectedContentSort.sort = 'asc';
          break;
        case 'default':
          this.selectedContentSort.sort = 'desc';
          break;
      }
    }

    // 페이지 초기화
    this.page.page = 0;

    this.page.sort = column + ',' + this.selectedContentSort.sort;

    this.page.size = 100;

    this.getDatasets();

  } // function - changeOrder


  private getDatasets(): void {
    const search: string = encodeURI(this.searchText);
    this.loadingService.show();
    this.datasetService
      .getDatasets(search, this.page)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe(datasets => {
        if (!datasets) {
          this.datasets = [];
          return;
        }

        this.datasets = datasets._embedded.datasets;
      });
  }

  /**
   * 전체 체크 박스가 비활성화 인지 확인
   */
  public isCheckAllDisabled(): boolean {
    return this.datasets.length === 0;
  }

  public nextClick(): void {
  }
}

class Order {
  key = 'seq';
  sort  = 'default';
}
