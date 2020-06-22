/* tslint:disable */
import {Component, ChangeDetectorRef, EventEmitter, Output, Input, OnInit, OnDestroy} from '@angular/core';
import {Dataset} from '../domains/dataset';
import {DatasetsService} from '../services/datasets.service';
import {LoadingService} from '../../common/services/loading/loading.service';
import {finalize} from 'rxjs/operators';
import {CommonUtil} from '../../common/utils/common-util';

@Component({
  selector: 'create-dataset-file-select',
  templateUrl: './create-dataset-file-select.component.html'
})

export class CreateDatasetFileSelectComponent implements OnInit{
  @Output()
  public readonly onClose = new EventEmitter();
  @Output()
  public readonly onGotoStep = new EventEmitter();
  @Input()
  public datasetFiles: Dataset.DatasetFile[] = [];
  // Change Detect
  public changeDetect: ChangeDetectorRef;

  public isCSV: boolean = false;
  public isEXCEL: boolean = false;
  public isJSON: boolean = false;

  // grid hide
  public clearGrid : boolean = false;

  public isNext: boolean = false;
  private _isInit: boolean = true;

  public isDelimiterRequired : boolean = false;
  public isColumnCountRequired : boolean = false;

  public currDelimiter : string = '';
  public currQuote: string = '';
  public currSheetIndex : number = 0;
  public currDSIndex: number = 0;
  public currDetail : {fileFormat: Dataset.FILE_FORMAT, detailName: string, columns: number, fileExtension: string, uploadLocation: string} ;
  public currColumnCount: number;
  public prevColumnCount: number;

  public previewErrorMsg : string = '';

  public fileFormat = Dataset.FILE_FORMAT;


  constructor(private readonly datasetService: DatasetsService,
              private readonly loadingService: LoadingService) {
  }


  ngOnInit(): void {
    this.currDetail = {fileFormat: null, detailName: null, columns: null, fileExtension: null, uploadLocation: null};

    // Check init by selected count
    this._checkNextBtn();
    this._isInit = !this.isNext;

    // isCSV, isJSON, isJSON 여부 체크
    this._setFileFormat(this.datasetFiles[this.currDSIndex].fileFormat);

    this.datasetFiles.forEach((dsFile, index) => {
      this.datasetFiles[index].sheetIndex = null;
      this.datasetFiles[index].sheetName = '';
      this.datasetFiles[index].selectedSheets = [];
      this.datasetFiles[index].selected = false;

      if(index === 0) {
        this.currDelimiter = (this.isCSV ? ',' : '');
        this.currQuote = (this.isCSV ? '\"' : '');
      }
      if(this.datasetFiles[index].fileFormat == Dataset.FILE_FORMAT.CSV) {
        this.datasetFiles[index].sheetInfo = null;
      }

      // FIXME : UI에서 각자 따로 오는 response를 어떻게 처리할지
      this._getGridInformation(index, this._getParamForGrid(dsFile), index === 0 ? 'draw' : '');
      // console.info('this.datasetFiles', this.datasetFiles);
    });
  }

  /**
   * When Datafile Checked
   * @param event
   * @param DsIdx
   */
  public checkGroup(event: Event, DsIdx: number){
    //stop event bubbling
    event.stopPropagation();
    event.preventDefault();

    if(!this.datasetFiles[DsIdx].sheetInfo) return;

    this.datasetFiles[DsIdx].sheetInfo = this.datasetFiles[DsIdx].sheetInfo.map((obj) => {
      obj.selected = !this.datasetFiles[DsIdx].selected; //  obj.selected = true or false
      return obj;
    });

    this.datasetFiles[DsIdx].selected = !this.datasetFiles[DsIdx].selected;
    this._checkNextBtn();
  }

  public checkSheet(event:Event, DsIdx: number, sheetIdx: number){
    //stop event bubbling
    event.stopPropagation();
    event.preventDefault();

    if(!this.datasetFiles[DsIdx].sheetInfo) return;

    this.datasetFiles[DsIdx].sheetInfo[sheetIdx].selected = !this.datasetFiles[DsIdx].sheetInfo[sheetIdx].selected;
    if (!this.datasetFiles[DsIdx].sheetInfo[sheetIdx].selected) this.datasetFiles[DsIdx].selected = false;

    let selectedCount: number = 0;
    this.datasetFiles[DsIdx].sheetInfo.forEach((sheet)=>{
      if(sheet.selected) selectedCount ++;
    });
    if (selectedCount === this.datasetFiles[DsIdx].sheetInfo.length) this.datasetFiles[DsIdx].selected = true;

    this._checkNextBtn();
    this.safelyDetectChanges();
  }

  public safelyDetectChanges() {
    if (!this.changeDetect['destroyed']) {
      this.changeDetect.detectChanges();
    }
  } // function - safelyDetectChanges


  /**
   * Select sheet and show grid
   * @param event
   * @param dsIdx
   * @param sheetName
   * @param sheetIdx
   */
  public selectSheet(event: Event, dsIdx: number,sheetName: string, sheetIdx: number) {
    // stop event bubbling
    event.stopPropagation();
    event.preventDefault();

    this.previewErrorMsg = '';
    this.isDelimiterRequired = false;
    this.currDelimiter = '';
    this.currQuote = '\"';

    this.isColumnCountRequired = false;
    this.currColumnCount = ( this.datasetFiles[dsIdx].sheetInfo ? this.datasetFiles[dsIdx].sheetInfo[sheetIdx].columnCount : 0 );

    this.currDSIndex = dsIdx;
    this._setFileFormat(this.datasetFiles[dsIdx].fileFormat);
    this.currSheetIndex = sheetIdx;

    if(!this.datasetFiles[dsIdx].sheetInfo){
      this.clearGrid = true;
      return;
    }

    this._setDetailInformation(dsIdx, sheetIdx);

    this.currSheetIndex = sheetIdx;
    this.datasetFiles[dsIdx].sheetIndex = sheetIdx;
    this.datasetFiles[dsIdx].sheetName = sheetName;

    // if grid info is valid show grid else clear grid
    // if (!isNullOrUndefined(this.datasetFiles[dsIdx]) && this.datasetFiles[dsIdx].sheetInfo[sheetIdx]) {
    //   this._updateGrid(this.datasetFiles[dsIdx].sheetInfo[sheetIdx].data, this.datasetFiles[dsIdx].sheetInfo[sheetIdx].fields);
    // } else {
    //   this.clearGrid = true;
    // }
  }

  /**
   * Select datasetFile and show grid
   * @param {Event} event
   * @param {number} dsIdx
   */
  public selectFile(event: Event, dsIdx: number){
    // stop event bubbling
    event.stopPropagation();
    event.preventDefault();

    // this.previewErrorMsg = (this.datasetFiles[dsIdx].error? this.translateService.instant(this.datasetFiles[dsIdx].error.message) : '');

    this.isDelimiterRequired = false;
    this.isColumnCountRequired = false;

    if (this.datasetFiles[dsIdx].fileFormat != Dataset.FILE_FORMAT.EXCEL){
      this._setFileFormat(this.datasetFiles[dsIdx].fileFormat);

      this.currDSIndex = dsIdx;
      this.currSheetIndex = 0;

      this._setDetailInformation(dsIdx, 0);

      this.currDelimiter = this.datasetFiles[dsIdx].delimiter;
      this.currQuote = this.datasetFiles[dsIdx].quoteChar;

      this.currColumnCount = ( this.datasetFiles[dsIdx].sheetInfo ? this.datasetFiles[dsIdx].sheetInfo[0].columnCount : 0 );

      if(!this.datasetFiles[dsIdx].sheetInfo){
        this.clearGrid = true;
        return;
      }

      this.currSheetIndex = 0;
      this.datasetFiles[dsIdx].sheetIndex = 0;
      this.datasetFiles[dsIdx].sheetName = this.datasetFiles[dsIdx].sheetInfo[0].sheetName;
    }
  }

  private _getGridInformation(idx: number, param : any, option: string ) {
    // this.loadingService.show();
    // this.datasetService.getFileGridInfo(param)
    //   .pipe(finalize(() => this.loadingService.hide()))
    //   .subscribe(result => {
    //     if (result.gridResponses) {
    //
    //       if( option && option === 'draw') this.clearGrid = false;
    //
    //       this.datasetFiles[idx].error = null;
    //       this.previewErrorMsg = '';
    //
    //       this._setSheetInformation(idx, result.gridResponses, result.sheetNames);
    //
    //       // 첫번째 시트로 그리드를 그린다.
    //       const sheet = this.datasetFiles[idx].sheetInfo[this.currSheetIndex];
    //
    //       // Update grid
    //       // TODO. 임시 주석
    //       // if( option && option === 'draw') this._updateGrid(sheet['data'], sheet['fields']);
    //       //
    //       // if (result.sheetNames) {
    //       //   // Select first sheet in the list
    //       //   this.datasetFiles[idx]['sheetName'] = sheet['sheetName'] ? sheet['sheetName'] : undefined;
    //       // }
    //
    //     } else {
    //
    //       // no result from server
    //       if( option && option === 'draw') this.clearGrid = true;
    //       this.datasetFiles[idx].error = result;
    //       // this.previewErrorMsg = (this.datasetFiles[idx].error? this.translateService.instant(this.datasetFiles[idx].error.message) : '');
    //
    //     }
    //
    //     // 다음 버튼 활성화 여부 확인
    //     this._checkNextBtn();
    //   });
  }
  private _updateGrid(data: any, fields: Field[]) {
    if (data.length > 0 && fields.length > 0) {
      this.clearGrid = false;
      // const headers: header[] = this._getHeaders(fields);
      // const rows: any[] = PreparationCommonUtil.getRows(data);
      // this._drawGrid(headers, rows);
    } else {
      //this.loadingHide();
      this.clearGrid = true;
    }
  }
  private _drawGrid(headers: any[], rows: any[]) {
    this.safelyDetectChanges();
    // this.gridComponent.create(headers, rows, new GridOption()
    //   .SyncColumnCellResize(true)
    //   .MultiColumnSort(true)
    //   .RowHeight(32)
    //   .build()
    // );
    //
    // // slick-viewport - Custom Top
    // $('.slick-viewport').css('top', 50 + 'px');
    //
    // this.loadingHide();
  }


  private _setSheetInformation(idx: number, gridInfo: any, sheetNames: string[]) {
    if (gridInfo && gridInfo.length > 0) {
      this.datasetFiles[idx].sheetInfo = [];
      gridInfo.forEach((item, index) => {
        const gridData = this._getGridDataFromGridResponse(item);

        let info : Dataset.SheetInfo = {selected : true, data : gridData.data, fields : gridData.fields, totalRows : 0, valid : true, columnCount : gridData.fields.length} as Dataset.SheetInfo;

        if (sheetNames) info.sheetName = sheetNames[index];

        this.datasetFiles[idx].sheetInfo.push(info);

        if ( this.currDSIndex === 0 ) this._setDetailInformation(0, 0);

      });

      // set current column count
      if( idx === this.currDSIndex ) this.currColumnCount = (this.datasetFiles[this.currDSIndex].sheetInfo? this.datasetFiles[this.currDSIndex].sheetInfo[this.currSheetIndex].columnCount: null);

      this.datasetFiles[idx].selected = true;
      this.isNext = true;
    }
  }

  private _getGridDataFromGridResponse(gridResponse: any): GridData {
    let colCnt = gridResponse.colCnt;
    let colNames = gridResponse.colNames;
    let colTypes = gridResponse.colDescs;

    const gridData: GridData = new GridData();

    for (let idx = 0; idx < colCnt; idx++) {
      gridData.fields.push({
        name: colNames[idx],
        type: colTypes[idx].type,
        seq: idx,
        uuid : CommonUtil.Generate.makeUUID()
      });
    }

    gridResponse.rows.forEach((row) => {
      const obj = {};
      for (let idx = 0; idx < colCnt; idx++) {
        obj[colNames[idx]] = row.objCols[idx];
      }
      gridData.data.push(obj);
    });

    return gridData;
  }


  private _setFileFormat(fileFormat : Dataset.FILE_FORMAT){
    this.isCSV = (fileFormat === Dataset.FILE_FORMAT.CSV) || fileFormat === Dataset.FILE_FORMAT.TXT;
    this.isJSON = (fileFormat === Dataset.FILE_FORMAT.JSON);
    this.isEXCEL = (fileFormat === Dataset.FILE_FORMAT.EXCEL);
  }


  /**
   * Returns parameter required for grid fetching API
   * @returns result {fileKey: string, delimiter: string}
   * @private
   */
  private _getParamForGrid(datasetFile : Dataset.DatasetFile, manualColumnCount?:number) {
    const result = {
      storedUri : datasetFile.storedUri,
    };
    if (datasetFile.fileFormat === Dataset.FILE_FORMAT.CSV || datasetFile.fileFormat === Dataset.FILE_FORMAT.TXT) result['delimiter'] = datasetFile.delimiter;
    if (datasetFile.fileFormat === Dataset.FILE_FORMAT.CSV || datasetFile.fileFormat === Dataset.FILE_FORMAT.TXT) result['quoteChar'] = datasetFile.quoteChar;
    if (manualColumnCount && manualColumnCount > 0) result['manualColumnCount'] = manualColumnCount;

    return result;
  }


  /**
   * Detail Information of Selected Sheet
   * @private
   */
  private _setDetailInformation(dsIdx:number, sheetIdx?:number){
    if (this.datasetFiles[dsIdx].fileFormat === Dataset.FILE_FORMAT.EXCEL) {
      this.currDetail.detailName = this.datasetFiles[dsIdx].fileName;
      if(this.datasetFiles[dsIdx].sheetInfo) this.currDetail.detailName += '-' + this.datasetFiles[dsIdx].sheetInfo[sheetIdx].sheetName;
    } else {
      this.currDetail.detailName = this.datasetFiles[dsIdx].fileName;
    }
    this.currDetail.fileFormat = this.datasetFiles[dsIdx].fileFormat;
    this.currDetail.columns = ( (this.datasetFiles[dsIdx].sheetInfo)?this.datasetFiles[dsIdx].sheetInfo[sheetIdx].fields.length : null );
    this.currDetail.fileExtension = this.datasetFiles[dsIdx].fileExtension;
    // this.currDetail.uploadLocation  = this.datasetFiles[dsIdx].storageType;
  }





  /**
   * Check Next Button
   */
  private _checkNextBtn() {
    let selectedCount : number = 0;
    this.datasetFiles.forEach((dsFile)=>{
      if ( dsFile.sheetInfo ){
        dsFile.sheetInfo.forEach((sheet)=>{
          if(sheet.selected) selectedCount ++;
        })
      }
    });
    this.isNext = (selectedCount > 0);
  }
}
class Field {
  name : string;
  type : string;
  timestampStyle?: string;
}

class GridData {
  public data: any[];
  public fields: any[];

  constructor() {
    this.data = [];
    this.fields = [];
  }
}
