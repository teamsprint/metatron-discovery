import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Dataflow} from '../../dataflow/domains/dataflow';
import {LoadingService} from '../../common/services/loading/loading.service';
import {CommonConstant} from '../../common/constants/common.constant';
import {DatasetsService} from '../../dataset/services/datasets.service';
import {finalize} from 'rxjs/operators';
import {Page} from '../../common/constants/page';
import {Dataset} from '../../dataset/domains/dataset';
import * as _ from 'lodash';

@Component({
  selector: 'create-dataflow-list',
  templateUrl: './create-dataflow-list.component.html'
})

export class CreateDataflowListComponent implements OnInit {

  @Output()
  public readonly onClose = new EventEmitter();
  @Output()
  public readonly onNext = new EventEmitter();
  @Output()
  public readonly addDataset = new EventEmitter();
  @Input()
  public openType: string; // CREATE, ADD, REPLACE
  @Input()
  public dataflow: Dataflow.ValueObjects.Create;
  @Input()
  public selectedDatasetId: string; // 미리보기를 위해 화면에 선택된 데이터셋
  @Input()
  public selectedDatasetIds: string[]; // 선택된 데이터셋 리스트_ID


  public selectedDatasets: Dataset.SimpleListEntity[] = []; // 선택된 데이터셋 리스트
  public datasets: Dataset.SimpleListEntity[] = []; // 화면에 보여지는 리스트

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
    this.isAllCheckedStatus = false;
    this.page.page = 0;
    this.page.size = 100;
    this.page.sort = CommonConstant.API_CONSTANT.PAGE_SORT_MODIFIED_TIME_DESC;
  }

  /**
   * Search dataflow
   */
  public searchDatasets(event) {
    if (13 === event.keyCode) {
      this.initialize();
      this.getDatasets();
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
    this.datasets = [];
    this.selectedDatasets = [];
    this.loadingService.show();
    this.datasetService
      .getDatasets(search, this.page)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe(datasets => {
        if (!datasets) {
          return;
        }
        this.datasets = datasets._embedded.datasets;
        if (this.selectedDatasetIds !== null && this.selectedDatasetIds !== undefined) {
          this.datasets.forEach(item => {
            item.origin = false;
            this.selectedDatasetIds.forEach(ids => {
              if (ids === item.dsId) {
                item.origin = true;
              }
            });
          });
        }
      });
  }

  /**
   * 전체 체크 박스가 비활성화 인지 확인
   */
  public isCheckAllDisabled(): boolean {
    return this.datasets.length === 0;
  }

  /**
   * 체크박스 전체 선택
   */
  public checkAll(event) {
    event.preventDefault();
    this.isAllCheckedStatus = !this.isAllCheckedStatus;
    if (this.isAllCheckedStatus) {
      this._addAllItems();
    } else {
      this._deleteAllItems();
    }
  }

  /**
   * 모든 아이템 선택
   * @private
   */
  private _addAllItems() {
    this.datasets.forEach((item) => {
      item.selected = true;
      if (-1 === _.findIndex(this.selectedDatasets, { dsId: item.dsId })) {
        if (item.origin !== true) {
          this._addSelectedItem(item);
        }
      }
    });
  }

  /**
   * Add selected item
   */
  private _addSelectedItem(ds: Dataset.SimpleListEntity) {
    if (ds.origin) {
      return;
    }
    this.selectedDatasets.push(ds);

    let originCount = 0;
    if (this.selectedDatasetIds !== null && this.selectedDatasetIds !== undefined) {
      originCount = this.selectedDatasetIds.length;
    }
    if (this.selectedDatasets.length + originCount === this.datasets.length) {
      this.isAllCheckedStatus = true;
    } else {
      this.isAllCheckedStatus = false;
    }
  }

  /**
   * 모든 아이템 선택 해제
   */
  private _deleteAllItems() {
    this.datasets.forEach((item) => {
      item.selected = false;
      this._deleteSelectedItem(item);
    });
  }

  /**
   * Delete selected item
   */
  private _deleteSelectedItem(ds: Dataset.SimpleListEntity) {
    const index = _.findIndex(this.selectedDatasets, { dsId: ds.dsId });
    if (-1 !== index) {
      this.selectedDatasets.splice(index, 1);
      this.isAllCheckedStatus = false;
    }
  }

  /**
   * 체크박스 선택
   */
  public check($event, ds: Dataset.SimpleListEntity) {
    // 중복 체크 방지
    $event.preventDefault();

    // Original dataset cannot be checked
    if (ds.origin) {
      return;
    }

    ds.selected = !ds.selected;
    -1 === _.findIndex(this.selectedDatasets, { dsId: ds.dsId }) ?
      this._addSelectedItem(ds) : this._deleteSelectedItem(ds);
  } // function - check

  public returnSelectedDatasets(): Dataset.SimpleListEntity[] {
    return this.selectedDatasets;
  }

  public nextClick(): void {
    this.onNext.emit();
  }

  public addDoneClick() {
    const addDoneData: string[] = [];
    this.selectedDatasets.forEach(item => {
      let origin = false;
      this.selectedDatasetIds.forEach(ids => {
        if (ids === item.dsId) {
          origin = true;
        }
      });
      if (origin === false) {
        addDoneData.push(item.dsId);
      }
    });
    if (addDoneData.length === 0) {
      return;
    }
    this.addDataset.emit(addDoneData);
  }
}

class Order {
  key = 'seq';
  sort = 'default';
}
