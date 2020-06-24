/* tslint:disable */
import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {LocalStorageService} from '../../common/services/local-storage/local-storage.service';
import {Dataset} from '../domains/dataset';
import {Dataflow} from '../../dataflow/domains/dataflow';
import {DatasetsService} from '../services/datasets.service';
import {LoadingService} from '../../common/services/loading/loading.service';
import {RouterUrls} from '../../common/constants/router.constant';
import {finalize} from 'rxjs/operators';
import {LnbComponent} from '../../lnb/components/lnb.component';
import {AngularGridInstance, Column, FieldType, GridOption, SelectedRange} from 'angular-slickgrid';

@Component({
  templateUrl: './dataset-detail.component.html',
  styleUrls: ['./dataset-detail.component.css']
})


export class DatasetDetailComponent implements OnInit, OnDestroy{

  @ViewChild(LnbComponent)
  public lnbComponent: LnbComponent;
  public readonly ROUTER_URLS = RouterUrls;
  public datasetId: string;
  public dataset: Dataset.Select;
  public dataflowList: Dataflow.ValueObjects.Select[]=[];
  public gridEnable = false;
  gridDataset: Array<object> = [];

  columnDefinitions: Column[] = [];
  gridOptions: GridOption = {
    autoResize: {
      containerId: 'dataset-detail-container',
      sidePadding: 10
    },
    rowSelectionOptions: {
      selectActiveRow: false
    },
    rowHeight: 26,
    enableAutoResize: true,
    enableCellNavigation: true,
    showCustomFooter: true,
    enableExcelCopyBuffer: true,
    excelCopyBufferOptions: {
      onCopyCells: (e, args: { ranges: SelectedRange[] }) => console.log('onCopyCells', args.ranges),
      onPasteCells: (e, args: { ranges: SelectedRange[] }) => console.log('onPasteCells', args.ranges),
      onCopyCancelled: (e, args: { ranges: SelectedRange[] }) => console.log('onCopyCancelled', args.ranges),
    }
  };
  gridInstance: AngularGridInstance;
  private gridUseRowId: string = 'dataset_grid_id';

  constructor(private activatedRoute: ActivatedRoute,
              private readonly datasetService: DatasetsService,
              private readonly loadingService: LoadingService,
              public readonly localStorageService: LocalStorageService) {
  }


  ngOnInit(): void {
    this.activatedRoute
      .paramMap
      .subscribe((params) => {
        const dsId = params.get(RouterUrls.Managements.getSetDetailPathVariableKey());
        if (dsId) {
          this.datasetId = dsId;
        }
      });
    // 초기 세팅
    this.initViewPage();
    if (this.datasetId !== null || this.datasetId !== undefined) {
      this.getDataset();
    }
  }

  private initViewPage() {

  }
  private getDataset() {
    this.loadingService.show();
    this.datasetService
      .getDataset(this.datasetId)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe(dataset => {
        if (!dataset) {return;}
        this.dataset = dataset as Dataset.Select;
        if (dataset['dataflows']) {this.dataflowList = dataset['dataflows'];}
        if (this.dataflowList !== null && this.dataflowList.length === 0) {this.dataflowList = null;}
        if (dataset['gridResponse']) {
          this.makeDatagrid(dataset['gridResponse']);
        }
      });
  }

  private makeDatagrid(gridData: any) {
    this.gridEnable = false;
    this.columnDefinitions = [];
    this.gridDataset = [];

    const filedArr: string[] = [];

    if (gridData !== null) {
      if (gridData['colNames'] !== null) {
        gridData['colNames'].forEach((item) => {
          const columnValue = {};
          columnValue['id'] = item;
          columnValue['name'] = item;
          columnValue['field'] = item;
          columnValue['sortable'] = false;
          columnValue['type'] = FieldType.string;
          columnValue['minWidth'] = 100;
          this.columnDefinitions.push(columnValue as Column);
          filedArr.push(item);
        });
      }

      if (gridData['rows']) {
        let idnum = 0;
        gridData['rows'].forEach((rowsitem) => {
          const ritemArr = {};
          ritemArr['dataset_grid_id'] = this.gridUseRowId + '_' + idnum;
          rowsitem['objCols'].forEach((ritem, idx) => {
            ritemArr[filedArr[idx]] = ritem;
          });
          idnum++;
          this.gridDataset.push(ritemArr);
        });
      }

      if(this.columnDefinitions.length > 0 && this.gridDataset.length > 0) {
        this.gridEnable = true;
      }

      // console.info('this.gridDataset', this.gridDataset);

    }
  }

  ngOnDestroy(): void {
    // this.LAYER_POPUP.unset();
  }
  public lnbOnPageRefresh() {
  }
  public openCreateDatasetPopup() {
    this.lnbComponent.openCreateDatasetPopup();
  }
  angularGridReady(gridInstance: AngularGridInstance) {
    this.gridInstance = gridInstance;
    this.gridInstance.dataView.setItems(this.gridDataset, this.gridUseRowId);
  }
}
