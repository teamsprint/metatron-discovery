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
import {saveAs} from 'file-saver';
import * as _ from 'lodash';

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
  public informatationList: object[] = [];
  gridInstance: AngularGridInstance;
  private gridUseRowId: string = 'dataset_grid_id';

  constructor(private activatedRoute: ActivatedRoute,
              private readonly router: Router,
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
        this.makeInformation();
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
    }
  }

  private makeInformation() {
    this.informatationList = [];
    const info1 = {};
    info1['name'] = 'Import Type';
    info1['value'] = this.dataset.importType;
    this.informatationList.push(info1);

    if(this.dataset.importType === Dataset.IMPORT_TYPE.UPLOAD) {

      if (this.dataset.filenameBeforeUpload !== null && this.dataset.filenameBeforeUpload !== undefined) {
        const fileup1 = {};
        fileup1['name'] = 'File Name';
        fileup1['value'] = this.dataset.filenameBeforeUpload;
        this.informatationList.push(fileup1);
      }

      if (this.dataset.sheetName !== null && this.dataset.sheetName !== undefined && this.dataset.sheetName !== '') {
        const fileup2 = {};
        fileup2['name'] = 'Sheet Name';
        fileup2['value'] = this.dataset.sheetName;
        this.informatationList.push(fileup2);
      }

      if (this.dataset.totalLines !== null && this.dataset.totalLines !== undefined) {
        const fileup3 = {};
        fileup3['name'] = 'Total Line';
        fileup3['value'] = this.dataset.totalLines;
        this.informatationList.push(fileup3);
      }

      if (this.dataset.totalBytes !== null && this.dataset.totalBytes !== undefined) {
        const fileup4 = {};
        fileup4['name'] = 'Total Bytes';
        fileup4['value'] = this.dataset.totalBytes;
        this.informatationList.push(fileup4);
      }

      if (this.dataset.storedUri !== null && this.dataset.storedUri !== undefined) {
        const fileup5 = {};
        fileup5['name'] = 'Stored Uri';
        fileup5['value'] = this.dataset.storedUri;
        this.informatationList.push(fileup5);
      }
    }

    if(this.dataset.importType === Dataset.IMPORT_TYPE.DATABASE) {
      const conn1 = {};
      conn1['name'] = 'Connection';
      conn1['value'] = this.dataset.connName;
      this.informatationList.push(conn1);

      const conn2 = {};
      conn2['name'] = 'Implementor';
      conn2['value'] = this.dataset.implementor;
      this.informatationList.push(conn2);

      if (this.dataset.hostname !== null && this.dataset.hostname !== undefined) {
        const conn3 = {};
        conn3['name'] = 'Host';
        conn3['value'] = this.dataset.hostname;
        this.informatationList.push(conn3);

        const conn4 = {};
        conn4['name'] = 'Port';
        conn4['value'] = this.dataset.port;
        this.informatationList.push(conn4);
      }
      if (this.dataset.url !== null && this.dataset.url !== undefined) {
        const conn5 = {};
        conn5['name'] = 'Url';
        conn5['value'] = this.dataset.url;
        this.informatationList.push(conn5);
      }

      const conn6 = {};
      conn6['name'] = 'Type';
      conn6['value'] = this.dataset.rsType;
      this.informatationList.push(conn6);

      const conn7 = {};
      conn7['name'] = 'Database';
      conn7['value'] = this.dataset.dbName;
      this.informatationList.push(conn7);
      const conn8 = {};
      conn8['name'] = 'Table';
      conn8['value'] = this.dataset.tblName;
      this.informatationList.push(conn8);
    }
  }

  public downloadDataset() {
    if (this.dataset.importType === Dataset.IMPORT_TYPE.UPLOAD) {
      this.downloadDatasetForFile();
    }else{
      this.downloadDatasetNotFile();
    }
  }

  private downloadDatasetForFile() {
    let fileFormat: string;
    let downloadFileName: string;

    let ext = this.getFileFormatWithExtension( this.dataset.filenameBeforeUpload );
    if (ext.toString().toLowerCase() === 'xls' || ext.toString().toLowerCase() === 'xlsx' || ext.toString().toLowerCase() === 'csv') {
      fileFormat = 'csv';
      downloadFileName = this.dataset.name + '.csv';
    } else {
      fileFormat = ext.toString().toLowerCase();
      downloadFileName = this.dataset.filenameBeforeUpload;
    }

    this.datasetService.downloadDataset(this.dataset.dsId, fileFormat).subscribe((datasetFile) => {
      saveAs(datasetFile, downloadFileName);
    });
  }

  private getFileFormatWithExtension(fileExtension: string) {
    let fileType: string = fileExtension.toUpperCase();

    const formats = [
      {extension: 'CSV', fileFormat: Dataset.FILE_FORMAT.CSV},
      {extension: 'TXT', fileFormat: Dataset.FILE_FORMAT.TXT},
      {extension: 'JSON', fileFormat: Dataset.FILE_FORMAT.JSON},
      {extension: 'XLSX', fileFormat: "XLSX"},
      {extension: 'XLS', fileFormat: "XLS"},
    ];

    const idx = _.findIndex(formats, {extension: fileType});

    if (idx !== -1) {
      return formats[idx].fileFormat
    } else {
      return formats[0].fileFormat
    }
  }

  private downloadDatasetNotFile() {
    console.info('this.dataset ', this.dataset );
    if(this.dataset.gridResponse == null) return;
    const exceldata: any = [];
    const headerdata: string[] = [];
    for (let i = 0; i < this.dataset.gridResponse.colNames.length; i = i + 1) {
      headerdata.push(this.dataset.gridResponse.colNames[i]);
    }

    let jsonHeader: string = JSON.stringify(headerdata);
    jsonHeader = jsonHeader.substr(1, jsonHeader.length - 2);
    exceldata.push(jsonHeader);


    for (let i = 0; i < this.dataset.gridResponse.rows.length; i = i + 1) {
      const rowdata: string[] = [];
      for (let j = 0; j < this.dataset.gridResponse.rows[i].objCols.length; j = j + 1) {
        const rowdatastring:string = this.dataset.gridResponse.rows[i].objCols[j];
        if (rowdatastring === null) {
          rowdata.push('');
        }else {
          const type: string = this.dataset.gridResponse.colDescs[j].type;
          if(type=='STRING' || type=='TIMESTAMP') {
            rowdata.push('"' + rowdatastring + '"');
          }else{
            rowdata.push(rowdatastring);
          }

        }
      }
      exceldata.push(rowdata);
    }

    let label: string = this.deleteSpeCharacter(this.dataset.name);
    let total_count: number = 0;
    if(this.dataset.totalLines != null) {
      total_count = this.dataset.totalLines;
    }
    label += "_" + total_count
    saveAs(new Blob(['\ufeff' + exceldata.join('\n')], { type: 'application/csv;charset=utf-8' }), label + '.csv');
  }

  private deleteSpeCharacter(name: string): string {
    if (name === null || name === undefined) return name;
    let label: string = name;
    const regExp:any = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
    label = label.replace(/ /g,'');
    label = label.replace(regExp,'');
    return label;
  }


  ngOnDestroy(): void {
    if(this.gridInstance) {
      this.gridInstance = null;
    }
  }
  public lnbOnPageRefresh() {
  }
  public openCreateDatasetPopup() {
    this.lnbComponent.openCreateDatasetPopup();
  }

  public goDataflow(id: string) {
    this.router.navigate([RouterUrls.Managements.getFlowDetailUrl(id)]).then();
  }


  angularGridReady(gridInstance: AngularGridInstance) {
    this.gridInstance = gridInstance;
    this.gridInstance.dataView.setItems(this.gridDataset, this.gridUseRowId);
  }
}
