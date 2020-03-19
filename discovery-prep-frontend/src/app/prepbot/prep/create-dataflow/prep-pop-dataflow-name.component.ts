/*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

import {AbstractPopupComponent} from '../../../common/component/abstract-popup.component';
import {Component, ElementRef, Injector, Input, Output, EventEmitter, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {
    FileFormat
} from '../../../domain/data-preparation/pr-dataset';
import {PopupService} from '../../../common/service/popup.service';
import { DatasetService } from '../service/dataset.service';
import {isNullOrUndefined, isUndefined} from 'util';
import {StringUtil} from '../../../common/util/string.util';
import {Alert} from '../../../common/util/alert.util';
import * as _ from 'lodash';
import { concatMap } from 'rxjs/operators';
import { from} from "rxjs/observable/from";
import {DataflowService} from "../service/dataflow.service";
import {PrDataflow} from "../../../domain/data-preparation/pr-dataflow";
import {PreparationCommonUtil} from "../../util/preparation-common.util";
import {DsType, Field, ImportType, PrDataset, RsType} from '../../../domain/data-preparation/pr-dataset';
declare let moment;

@Component({
  selector: 'prep-pop-dataflow-name',
  templateUrl: './prep-pop-dataflow-name.component.html',
  providers: [DatasetService]
})
export class PrepPopDataflowNameComponent extends AbstractPopupComponent implements OnInit, OnDestroy  {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

    @Output()
    public stepChange : EventEmitter<string> = new EventEmitter();

    @Output()
    public createClose : EventEmitter<void> = new EventEmitter();

    @Output()
    public createComplete: EventEmitter<void> = new EventEmitter();
    @Input()
    public selectedDatasets : PrDataset[] = [];

    @Output()
    public selectedDatasetsChange : EventEmitter<any> = new EventEmitter();



    @Input() // [DB, STAGING, FILE]
    public type : string;

    public dataflowInfo: any = {dfName:"",dfDesc:""};

    // name error msg show/hide
    public showNameError: boolean = false;

    // desc error msg show/hide
    public showDescError: boolean = false;

    // to check request is only sent once.
    public flag: boolean = false;

    @ViewChild('nameElement')
    public nameElement : ElementRef;

  // public isShow = false;

  public datasetInfo : DatasetInfo[] = [];
  public fileExtension: string;

  public datasetInformationList: any;

  public isMultiSheet: boolean = false;
  public names : string [] = [];
  public clonedNames:string[] = [];
  public descriptions : string [] = [];
  public nameErrors: string[] = [];
  public descriptionErrors: string[] = [];
  public currentIndex: number = 0;
  public isMaxLengthError: boolean = false;
  public results: any[] = [];

  public isChecked: boolean = true; // jump to dataflow main grid

  public prepCommonUtil = PreparationCommonUtil;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor(private popupService: PopupService,
              private datasetService: DatasetService,
              private dataflowService: DataflowService,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public ngOnInit() {
    super.ngOnInit();

    this.datasetInformationList = [];

    this._setDatasetInfo();
    this.init();

  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

    public init() {
        // this.isShow = true;
    }


    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    | Public Method
    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/





    /** Complete */
    public complete() {
      this.resetErrorMessage();

      const name : string = this.dataflowInfo.dfName;
      if(name==null || name.replace(/ /g,'') =='') {
          this.showNameError =true;
      }
      const desc : string = this.dataflowInfo.dfDesc;
      if(desc==null || desc.replace(/ /g,'') =='') {
            this.showDescError =true;
      }
      if( this.showNameError) return;


      const df = new PrDataflow();
      df.datasets = [];
      df.dfName =  this.dataflowInfo.dfName;
      df.dfDesc =  this.dataflowInfo.dfDesc;




      this.loadingShow();
      this.dataflowService.createDataflow(df).then((result) => {
        this.loadingHide();
        if (result) {
          // console.info('result', result)

          // this.createCompleteEvent();
            if(this.selectedDatasets==null || this.selectedDatasets.length==0) {
                this.createCompleteEvent();
            }else{
                this.updateDatasets(result.dfId);
            }

        } else {

          // this.close();
        }

      }).catch(() => {
        this.loadingHide();
        // this.close();
      });



//  let today = moment();
//     const df = new PrDataflow();
//
//   df.datasets = this.selectedDatasets.map((ds)=>{
// return ds._links.self.href;
// });
//       df.dfName =  this.dataflowInfo.dfName;
//         df.dfDesc =  this.dataflowInfo.dfDesc;
//
//
//     this.loadingShow();
//       this.dataflowService.createDataflow(df).then((result) => {
//         this.loadingHide();
//         if (result) {
//
//           this.createCompleteEvent();
//         } else {
//
//           this.close();
//         }
//
//       }).catch(() => {
//         this.loadingHide();
//         this.close();
//       });

  }

  private updateDatasets(dfId: string) {
      const dsIds: any = {};
      dsIds.dsIds = [];

      this.selectedDatasets.forEach((item) => {
          dsIds.dsIds.push(item.dsId);
          // }
      })

      this.dataflowService.updateDataSets(dfId, dsIds).then((result) => {
          this.loadingHide();
          if (result) {
              // console.info('result', result)
              this.createCompleteEvent();
          }
      }).catch(() => {
          this.loadingHide();
          // this.close();
      });




  }


    /** go to done step */
    public createCompleteEvent() {
      this.createComplete.emit();

    }


  /** go to previous step */
  public prev() {
      this.stepChange.emit( '' );
  }


  /**
   * close popup
   * */
  public close() {
    super.close();
    this.createClose.emit();
  }

  /**
   * Short cut to dataFlow
   * @private
   */
  private _makeShortCutToDataFlow() {

    let today = moment();
    const df = new PrDataflow();
    this.loadingShow();

    // 데이터셋이 생성이 됐다면 데이터플로우 생성을 한다.
    if (this.results[0] && !isNullOrUndefined(this.results[0].link)) {
      df.datasets = [this.results[0].link];
      df.dfName = `${this.results[0].dsName}_${today.format('MM')}${today.format('DD')}_${today.format('HH')}${today.format('mm')}`  ;

      // 1. create dataflow with dataset
      this.dataflowService.createDataflow(df).then((result1) => {
        this.loadingHide();
        if (result1) {

          // 2. Find wrangled dataset
          // 3. Move to dataFlow main grid (navigate)
          this.router.navigate([`/management/datapreparation/dataflow/${result1['dfId']}/rule/${result1.datasets[1].dsId}`]);
        } else {

          // If error move to dataset list
          this.loadingHide();
          this.close();
        }

      }).catch(() => {

        // If error move to dataset list
        this.loadingHide();
        this.close();
      });
    } else {
      // If error move to dataset list
      this.loadingHide();
      this.close();
    }
  }

    // public goto(step) {
    //     // this.step = step;
    //     this.stepChange.emit( step );
    // }


  /**
   * show/hide error msg
   * @param index
   * */
  public hideNameError(index: number) {
    if (isUndefined(this.names[index]) || this.names[index].length > 0 || this.names[index].length <= 150) {
      this.showNameError = false;
      this.nameErrors[index] = '';
    }
  }

  /**
   * show/hide error msg
   * @param index
   * */
  public hideDescError(index: number) {
    if (isUndefined(this.descriptions[index]) || this.descriptions[index].length <= 150) {
      this.showDescError = false;
      this.descriptionErrors[index] = '';
    }
  }

  /**
   * Error action
   * @param error
   */
  public errorAction(error) {
    this.flag = false;
    Alert.error(this.translateService.instant('msg.dp.alert.num.fail.dataset', {value : 1}));
    this.close();
  }


  /**
   * Check if next button is disabled or not
   */
  public isBtnDisabled() : boolean {
    return this.showNameError || this.showDescError;
  }


  /**
   * Keyup event
   * @param event
   */
  public keyupEvent(event) {
    if (event.keyCode === 13) {
      this.complete();
    }
  }


  /**
   * Keyboard down event on name input
   * @param event
   * @param index
   */
  public keyDownEvent(event, index) {

    if (this.names[index].length > 149 && this.isKeyPressedWithChar(event.keyCode) && !this.isMaxLengthError) {
      this.isMaxLengthError = true;
      if(this.type !== 'FILE') {
        this.showNameError = true;
      }
      this.nameErrors[index] = this.translateService.instant('msg.dp.ui.max.length.error');
      setTimeout(() => {
        this.hideNameError(index);
        this.isMaxLengthError = false;
      }, 2000);
    }

    if (this.nameErrors[index] !== '' && !this.isMaxLengthError) {
      this.hideNameError(index);
    }
  }


  /**
   * Keyboard press down event on description input
   * @param event
   * @param index
   */
  public keyDownDescEvent(event, index) {

    if (this.descriptions[index].length > 149 && this.isKeyPressedWithChar(event.keyCode) && !this.isMaxLengthError) {
      this.isMaxLengthError = true;
      this.descriptionErrors[index] = this.translateService.instant('msg.dp.ui.max.length.error');
      setTimeout(() => {
        this.hideDescError(index);
        this.isMaxLengthError = false;
      }, 2000);
    }

    if (this.descriptionErrors[index] !== '' && !this.isMaxLengthError) {
      this.hideDescError(index);
    }

  }

  /**
   * Returns true if something is typed on the keyboard
   * Returns false if shift, tab etc is pressed
   * @param keyCode
   */
  public isKeyPressedWithChar(keyCode: number): boolean {
    const exceptionList: number[] = [8,9,13,16,17,18,19,20,27,33,34,35,36,37,38,39,40,45,46,91,92,219,220,93,144,145];
    return exceptionList.indexOf(keyCode) === -1
  }


  /**
   * Return appropriate title for each dataset type
   */
  public get getTypeName() {

    let result = 'Staging DB';

    if (this.type === 'DB') {
      result = 'Database';
    }

    if (this.type === 'FILE') {
      result = 'File';
    }

    if (this.type === 'URL') {
      result = this.type;
    }

    return result;

  }
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
    private resetErrorMessage(): void{
        this.showNameError = false;
        this.showDescError = false;

    }


  /**
   * 데이터셋 이름의 default값을 넣는다.
   * @param {string} type
   * @private
   */
  private _setDefaultDatasetName(type : string) : void {
    // For placeholder
    this.clonedNames = _.cloneDeep(this.names);

    this.nameElement && setTimeout(() => { this.nameElement.nativeElement.select(); });
  } // function - _setDefaultDatasetName


  /**
   * Set dataset information (summary)
   * @private
   */
  private _setDatasetInfo() {

      this.datasetInformationList = [];

      for(let i=0; i<this.selectedDatasets.length; i++) {
        const dataset: any = this.selectedDatasets[i];

          // console.info('dataset.importType', dataset.importType);
          // WRANGLED
          if (dataset.dsType === DsType.WRANGLED) {
              // this.datasetInformationList = [{ name : this.translateService.instant('msg.comm.th.type') , value : dataset.dsType },
              //     {name : this.translateService.instant('msg.dp.th.summary'), value : this.getRows },
              //     {name : '', value : dataset.gridResponse.colCnt + ' column(s)' }
              // ]
              //
              this.datasetInformationList.push({name : this.translateService.instant('msg.comm.th.type'), value : dataset.dsType, header:true});
              this.datasetInformationList.push({name : this.translateService.instant('msg.dp.th.summary'), value : this.getRows(dataset), header:false});

              
              // FILE
          }  else if (dataset.importType === ImportType.UPLOAD || dataset.importType === ImportType.URI) {
              let filepath : string = dataset.filenameBeforeUpload;

              // this.datasetInformationList = [
              //     { name : this.translateService.instant('msg.comm.th.type') ,
              //         value : PreparationCommonUtil.getDatasetType(dataset)
              //     },
              //     {name : this.translateService.instant('msg.dp.th.file'),
              //         value : `${filepath}`
              //     },
              // ];
              this.datasetInformationList.push({name : this.translateService.instant('msg.comm.th.type'), value : PreparationCommonUtil.getDatasetType(dataset), header:true});
              this.datasetInformationList.push({name : this.translateService.instant('msg.dp.th.file'), value : filepath, header:false});




              // EXCEL
              if (this._getFileType(dataset.importType, filepath) === 'EXCEL') {
                  this.datasetInformationList.push({name : this.translateService.instant('msg.dp.th.sheet'), value : this.getSheetName(dataset), header:false })
              }

              // this.datasetInformationList.push(
              //     {name : 'URI', value : dataset.storedUri},
              //     {name : this.translateService.instant('msg.comm.detail.size'), value : this.getTotalBytes },
              //     {name : this.translateService.instant('msg.dp.th.summary'), value : this.getRows(dataset) },
              //     {name : '', value : dataset.gridResponse.colCnt + ' column(s)' })


              // STAGING OR DB
          } else if (dataset.importType === 'STAGING_DB' || dataset.importType === 'DATABASE') {

              // this.datasetInformationList = [
              //     { name : this.translateService.instant('msg.comm.th.type') ,
              //         value : PreparationCommonUtil.getDatasetType(dataset) }];

              this.datasetInformationList.push({name : this.translateService.instant('msg.comm.th.type'), value : PreparationCommonUtil.getDatasetType(dataset), header:true});


              if (!isNullOrUndefined(this.getDatabase(dataset))) {
                  this.datasetInformationList.push({ name : this.translateService.instant('msg.dp.th.database'), value : this.getDatabase(dataset), header:false});
              }

              if (dataset.rsType === 'TABLE') {
                  this.datasetInformationList.push({ name : this.translateService.instant('msg.lineage.ui.list.search.table'), value : this.getTable(dataset), header:false })
              } else {
                  this.datasetInformationList.push({ name : this.translateService.instant('msg.lineage.ui.list.search.sql'), value : this.getQueryStmt(dataset), header:false })
              }

          }
          this.datasetInformationList.push({name:null, value:null, header:false});

      }
      // this.datasetInformationList = [];
      // console.info('this.datasetInformationList', this.datasetInformationList);

  }

    /**
     * Returns file type (csv, json, excel etc)
     * @param {ImportType} type
     * @param {string} fileName
     * @returns {string}
     */
    private _getFileType(type: ImportType, fileName : string) : string {

        let result = 'CSV';
        if (type === ImportType.UPLOAD) {
            let extension = new RegExp(/^.*\.(csv|xls|txt|xlsx|json)$/).exec(fileName)[1];
            if(extension.toUpperCase() === 'XLSX' || extension.toUpperCase() === 'XLS') {
                result =  'EXCEL'
            }  else if (extension.toUpperCase() === 'JSON') {
                result =  'JSON'
            }
        }
        return result;
    }


    /**
     * get names of sheet
     */
    private getSheetName(dataset: any) : string {

        let result = "N/A";
        if(dataset.sheetName) {
            result = dataset.sheetName;
        }
        return result;
    }

    /** get total bytes */
    public getTotalBytes(dataset: any) {
        if( (dataset.importType===ImportType.STAGING_DB &&
                dataset.rsType!==RsType.TABLE)  || dataset.importType===ImportType.DATABASE) {
            return null
        } else {
            let size = -1;
            if(Number.isInteger(dataset.totalBytes)) {
                size = dataset.totalBytes;
            }
            return this._formatBytes(size,1);
        }
    }

    /**
     * Format bytes
     * @param a 크기
     * @param b 소숫점 자릿
     * @private
     */
    private _formatBytes(a,b) {
        if (-1 === a)  {
            return "0 Bytes";
        }

        let c=1024,d=b||2,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(a)/Math.log(c));
        return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]
    }




    private getHost(dataset: any) {
        if(dataset.importType===ImportType.DATABASE && !isNullOrUndefined(dataset.dcHostname)) {
            return dataset.dcHostname;
        }
        return null;
    }

    private getPort(dataset: any) {
        if( dataset.importType===ImportType.DATABASE && !isNullOrUndefined(dataset.dcPort)) {
            return dataset.dcPort;
        }
        return null;
    }

    private getDatabase(dataset: any) {
        return dataset.dbName;
    }

    private getUrl(dataset: any) {
        return dataset.dcUrl;
    }

    private getTable(dataset: any) {
        return dataset.tblName;
    }

    private getQueryStmt(dataset: any) {
        return dataset.queryStmt;
    }


    /** get row count */
    private getRows(dataset: any) {
        let rows = '0 row(s)';
        if(!isNullOrUndefined(dataset.totalLines) && Number.isInteger(dataset.totalLines)) {
            if (dataset.totalLines === -1) {
                rows = '(counting)';
            } else {
                rows = new Intl.NumberFormat().format(dataset.totalLines) + ' row(s)';
            }
        }
        return rows;
    }


  /**
   * Returns parameter needed for creating staging dataset
   * @returns {Object}
   * @private
   */
  private _getHiveParams(hive): object {

    if (hive.rsType === RsType.QUERY) {
      hive.queryStmt = hive.sqlInfo.queryStmt;
      hive.dbName = hive.sqlInfo.databaseName;
    } else {
      hive.tblName = hive.tableInfo.tableName;
      hive.dbName = hive.tableInfo.databaseName;
    }
    return hive
  }


  /**
   * Returns parameter needed for creating jdbc dataset
   * @param jdbc
   * @returns {Object}
   * @private
   */
  private _getJdbcParams(jdbc) : object {

    // For postgre dbName is database not databaseName!
    if (jdbc.rsType === RsType.QUERY) {
      jdbc.queryStmt = jdbc.sqlInfo.queryStmt;
      jdbc.dbName = jdbc.sqlInfo.databaseName;
    } else {
      jdbc.tblName = jdbc.tableInfo.tableName;
      jdbc.dbName = jdbc.tableInfo.databaseName;
    }
    return jdbc
  }


  /**
   * Returns parameter needed for creating staging dataset
   * @returns {Object}
   * @private
   */
  private _getFileParams(file): object {
    const params: any = {};
    if (file.fileFormat === FileFormat.EXCEL){
      params.delimiter = ',';
    } else {
      params.delimiter = file.delimiter;
    }

    if (file.fileFormat === FileFormat.CSV || file.fileFormat === FileFormat.TXT ){
      params.quoteChar = file.quoteChar;
    }

    params.dsName = file.dsName;
    params.dsDesc = file.dsDesc;
    params.dsType = 'IMPORTED';
    if (this.type === 'FILE') {
      params.importType = 'UPLOAD';
    } else if(this.type === 'URL') {
      params.importType = 'URI';
    } else {
      params.importType = 'UPLOAD';
    }
    params.filenameBeforeUpload = file.filenameBeforeUpload;
    params.storageType = file.storageType;
    params.sheetName = file.sheetName;
    params.storedUri = file.storedUri;
    params.manualColumnCount = file.manualColumnCount;

    return params
  }



  /**
   * Create dataset (call API)
   * @param {Object} params
   * (staging and db)
   * @private
   */
  private _createDataset(params : object) {

    // let type = this.type === 'DB' ? this.datasetJdbc : this.datasetHive;
    //
    // let tableInfo = type.tableInfo;
    // let sqlInfo = type.sqlInfo;
    //
    // // delete - only use in UI
    // delete type.tableInfo;
    // delete type.sqlInfo;
    //
    // // Error when creating dataflow with dataset with no querystmt
    // if (type.rsType === RsType.TABLE) {
    //   var databaseName = tableInfo.databaseName;
    //   var tableName = tableInfo.tableName;
    //   if(type.dataconnection.connection.implementor==="POSTGRESQL") {
    //     if( /^[a-z0-9]+$/.test(databaseName) === false ) {
    //       databaseName = `"${databaseName}"`;
    //     }
    //     if( /^[a-z0-9]+$/.test(tableName) === false ) {
    //       tableName = `"${tableName}"`;
    //     }
    //   }
    //   params['queryStmt'] = `select * from ${databaseName}.${tableName}`;
    // }
    //
    // this.loadingShow();
    // this.flag = true;
    // this.datasetService.createDataSet(params).then((result) => {
    //   this.flag = false;
    //   this.loadingHide();
    //   if (result) {
    //     this.results = [];
    //     this.results.push({dsId: result.dsId, dsName: result.dsName, link : result['_links'].self.href});
    //     if (this.isChecked && this.isFromDatasetList) {
    //       this._makeShortCutToDataFlow();
    //     } else {
    //       this.popupService.notiPopup({
    //         name: 'complete-dataset-create',
    //         data: this.results.length > 0 ? this.results[0].dsId : null
    //       });
    //     }
    //   }
    // }).catch((error) => {
    //
    //   type.tableInfo = tableInfo;
    //   type.sqlInfo = sqlInfo;
    //
    //   // Error when creating dataflow with dataset with no querystmt
    //   if (type.rsType === RsType.TABLE) {
    //     delete params['queryStmt'];
    //   }
    //
    //   this.loadingHide();
    //   this.errorAction(error);
    // })
  }


  /**
   * Create file type dataset
   * @param param
   * @private
   */
  private _createFileDataset(param): Promise<any> {
    return new Promise((resolve, reject) => {
      this.datasetService.createDataSet(param).
      then(result => resolve(result)).
      catch(error => reject(error));
    });
  }


}

class DatasetInfo {
  name : string;
  value : any;
  svg?: string;
}


