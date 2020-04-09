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
import {Component, ElementRef, Injector, Input,Output, EventEmitter, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {
FileFormat, PrDatasetHive, PrDatasetJdbc,
RsType
} from '../../../domain/data-preparation/pr-dataset';
import {PopupService} from '../../../common/service/popup.service';
import {DatasetService} from '../service/dataset.service';
import {DataflowService} from "../service/dataflow.service";
import {isNullOrUndefined, isUndefined} from 'util';
import {StringUtil} from '../../../common/util/string.util';
import {Alert} from '../../../common/util/alert.util';
import * as _ from 'lodash';
import { concatMap } from 'rxjs/operators';
import { from} from "rxjs/observable/from";
import {PrDataflow} from "../../../domain/data-preparation/pr-dataflow";
import {PreparationCommonUtil} from "../../util/preparation-common.util";
declare let moment;

@Component({
  selector: 'prep-pop-create-dataset-name',
  templateUrl: './prep-pop-create-dataset-name.component.html',
  providers: [DatasetService]
})
export class PrepPopCreateDatasetNameComponent extends AbstractPopupComponent implements OnInit, OnDestroy  {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Input()
  public step: string = '';

  @Output()
  public stepChange : EventEmitter<string> = new EventEmitter();

  @Output()
  public createClose : EventEmitter<void> = new EventEmitter();

  @Output()
  public createComplete : EventEmitter<void> = new EventEmitter();


  @Input()
  public datasetHive: PrDatasetHive;

  @Input()
  public datasetJdbc: PrDatasetJdbc;

  @Input()
  public datasetFiles : any;

  @Input() // [DB, STAGING, FILE]
  public type : string;

  @Input()
  public isFromDatasetList: boolean = true;

  // name error msg show/hide
  public showNameError: boolean = false;

  // desc error msg show/hide
  public showDescError: boolean = false;

  // to check request is only sent once.
  public flag: boolean = false;

  @ViewChild('nameElement')
  public nameElement : ElementRef;

  public isShow = false;

  public datasetInfo : DatasetInfo[] = [];
  public fileExtension: string;

  public dsfileInformations: any;

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


    this.dsfileInformations = [];

    // this.type='FILE'; // temporary
    // Set default name
    this._setDefaultDatasetName(this.type);

    // Set dataset information
    this._setDatasetInfo();
    this.init();

  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

    public init() {
        // this.isShow = true;
        // console.info('dsfileInformations', this.dsfileInformations);
    }


    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    | Public Method
    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

    /** Complete */
    public complete() {
        this.resetErrorMessage();
        //
        // const name : string = this.names[0];
        // if(name==null || name.replace(/ /g,'') =='') {
        //     this.showNameError =true;
        // }
        // const desc : string = this.descriptions[0];
        // if(desc==null || desc.replace(/ /g,'') =='') {
        //     this.showDescError =true;
        // }
        //
        // if (this.showNameError || this.showDescError) {
        //   return;
        // }
        // Name validation
        this.names.forEach((item, index) => {
            if (isUndefined(item) || item.trim() === '' || item.length < 1) {
                this.nameErrors[index] = this.translateService.instant('msg.dp.alert.name.error');
                this.showNameError = true;
            }
            if (item.length > 150) {
                this.showNameError = true;
                this.nameErrors[index] = this.translateService.instant('msg.dp.alert.name.error.description');
            }
        });
        // description validation
        this.descriptions.forEach((item, index) => {
            if (!StringUtil.isEmpty(this.descriptions[index]) && this.descriptions[index].length > 150) {
                this.descriptionErrors[index] = this.translateService.instant('msg.dp.alert.description.error.description');
            }
        });



        if (this.showNameError || this.showDescError) {
            return;
        }

        let params = {};
        if (this.type === 'STAGING') {

            this.datasetHive.dsName = this.names[0];
            this.datasetHive.dsDesc = this.descriptions[0];
            params = this._getHiveParams(this.datasetHive);
            this._createDataset(params);
        }

        if (this.type === 'DB') {

            this.datasetJdbc.dsName = this.names[0];
            this.datasetJdbc.dsDesc = this.descriptions[0];
            params = this._getJdbcParams(this.datasetJdbc);
            this._createDataset(params);

        }

        if (this.type === 'FILE' || 'URL' === this.type) {

            // List of parameters used to make multiple dataSets
            const params = this.names.map((name:string,index:number) => {
                this.datasetFiles[this.dsfileInformations[index].datasetFileIndex].dsName = name;
                this.datasetFiles[this.dsfileInformations[index].datasetFileIndex].dsDesc = this.descriptions[index];
                this.datasetFiles[this.dsfileInformations[index].datasetFileIndex].sheetName = this.dsfileInformations[index].sheetName;
                if (this.datasetFiles[this.dsfileInformations[index].datasetFileIndex].fileFormat != FileFormat.JSON) {
                    this.datasetFiles[this.dsfileInformations[index].datasetFileIndex].manualColumnCount = this.dsfileInformations[index].manualColumnCount;
                }
                return this._getFileParams(this.datasetFiles[this.dsfileInformations[index].datasetFileIndex]);
            });

            // Make list of params into observable using from.
            // used concatMap to send multiple sequential HTTP requests
            this.flag = true;
            this.results = [];
            const streams = from(params).pipe(
                concatMap(stream => this._createFileDataset(stream)
                    .catch((error) => {
                        console.info(error)
                    })));

            this.loadingShow();
            streams.subscribe((result) => {

                // push only successful result into an array
                // because this information is required in
                // complete() but no way to access them
                if (result) {
                    this.results.push({dsId: result.dsId, dsName: result.dsName, link : result['_links'].self.href});
                }

            },(error) => {
                console.error(error);
            },() => {

                this.flag = false;
                this.loadingHide();

                // Find number of errors
                const errorNum = this.names.length - this.results.length;
                if (errorNum > 0) {
                    Alert.error(this.translateService.instant('msg.dp.alert.num.fail.dataset', {value : errorNum}));
                }

                // 데이터셋 리스트에서 진입과 체크됐다면(데이터플로우로 바로 이동)
                if (this.isChecked && this.isFromDatasetList && this.names.length == 1) {
                    this._makeShortCutToDataFlow();
                } else {

                  this.createComplete.emit();
                    // // 리스트로 돌아간다.
                    // this.popupService.notiPopup({
                    //     name: 'complete-dataset-create',
                    //     data: this.results.length > 0 ? this.results[0].dsId : null
                    // });


                }
            })

        }



    }

  public goto(step) {
      // this.step = step;
      // this.stepChange.emit( step );
    }
  /** go to previous step */
  public prev() {
    let step_string: string ='';
    if (this.type === 'FILE') {
        step_string = 'select-sheet';
    }else if(this.type === 'DB') {
        step_string = 'DB';
    }else if(this.type === 'KAFKA') {
        step_string = 'complete-create-dataset';
    }
    this.stepChange.emit(step_string);
  }



  /**
   * close popup
   * */
  public close() {
    super.close();
    this.createClose.emit();
  }



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
    this.prepAlertShow('', this.translateService.instant('msg.dp.alert.num.fail.dataset',{value : 1}));
    // Alert.error(this.translateService.instant('msg.dp.alert.num.fail.dataset', {value : 1}));
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
  public keyupEvent(event, index) {
    // if (event.keyCode === 13) {
    //   this.complete();
      if(index==0) {
          this.showNameError= false;
      }
      if(index==1) {
          this.showDescError =false;
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

    public getFileItemIconClassName(fileExtension: string ): string {
        const className: string = this._getFileFormatForIcon(fileExtension).toString();
        return "type-" + className.toLowerCase();
    }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

    private _getFileFormatForIcon(fileName) {
        const fileTypeArray : any[] = fileName.toUpperCase().split('.');
        const fileType: string = fileTypeArray[fileTypeArray.length-1];

        const formats = [
            {extension:'CSV', fileFormat:FileFormat.CSV},
            {extension:'TXT', fileFormat:FileFormat.TXT},
            {extension:'JSON', fileFormat:FileFormat.JSON},
            {extension:'XLSX', fileFormat:'xlsx'},
            {extension:'XLS', fileFormat:'xls'},
        ];

        const idx = _.findIndex(formats, {extension: fileType});

        if (idx !== -1) {
            return formats[idx].fileFormat
        } else {
            return formats[0].fileFormat
        }
    }

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

    if ('FILE' === type || 'URL' === type) {

      // FIXME: no idea why dsfileInformations is used instead of datasetInfo
      this.datasetFiles.forEach((dsFile, index)=>{
        if(dsFile.sheetInfo){
          if(dsFile.fileFormat === FileFormat.EXCEL){
            dsFile.sheetInfo.forEach((sheet)=>{
              if (sheet.selected){
                let name = `${dsFile.fileName} - ${sheet.sheetName}`;
                this.names.push(name.slice(0,150));
                this.descriptions.push('');
                this.nameErrors.push('');
                this.descriptionErrors.push('');
                this.dsfileInformations.push({
                  datasetFileIndex : index,
                  fileName: dsFile.filenameBeforeUpload,
                  fileFormat: dsFile.fileFormat.toString(),
                  sheetName:sheet.sheetName,
                  manualColumnCount:sheet.columnCount,
                  // svg: dsFile.fileFormat.toUpperCase(),
                    svg: dsFile.fileExtension.toUpperCase(),
                });
              }
            })
          } else {
            if(dsFile.selected){
              let name = `${dsFile.fileName}.${dsFile.fileExtension}`;
              this.names.push(name.slice(0,150));
              this.descriptions.push('');
              this.nameErrors.push('');
              this.descriptionErrors.push('');
              if (dsFile.fileFormat === FileFormat.JSON ){
                this.dsfileInformations.push({
                  datasetFileIndex : index,
                  fileName: dsFile.filenameBeforeUpload,
                  fileFormat: dsFile.fileFormat.toString(),
                  sheetName:'',
                  // svg: dsFile.fileFormat.toUpperCase(),
                    svg: dsFile.fileExtension.toUpperCase(),
                });
              } else {
                this.dsfileInformations.push({
                  datasetFileIndex : index,
                  fileName: dsFile.filenameBeforeUpload,
                  fileFormat: dsFile.fileFormat.toString(),
                  sheetName:'',
                  manualColumnCount:dsFile.sheetInfo[0].columnCount,
                  // svg: dsFile.fileFormat.toUpperCase(),
                    svg: dsFile.fileExtension.toUpperCase(),
                });
              }
            }
          }
        }
      });

    } else if ('DB' === type) {

      // When table
      if (this.datasetJdbc.rsType === RsType.TABLE) {
        this.names[0] = `${this.datasetJdbc.tableInfo.tableName}_${this.datasetJdbc.dataconnection.connection.implementor}`;
      } else {
        this.names[0] = '';
      }
        this.nameErrors.push('');
        this.descriptionErrors.push('');


    } else if ('STAGING' === type) {

      // When table
      if (this.datasetHive.rsType === RsType.TABLE) {
        this.names[0] = `${this.datasetHive.tableInfo.tableName}_STAGING`;
      } else {
        this.names[0] = '';
      }
        this.nameErrors.push('');
        this.descriptionErrors.push('');
    }


    // For placeholder
    this.clonedNames = _.cloneDeep(this.names);
    // this.nameElement && setTimeout(() => { this.nameElement.nativeElement.select(); });
  } // function - _setDefaultDatasetName


  /**
   * Set dataset information (summary)
   * @private
   */
  private _setDatasetInfo() {

    if ('FILE' === this.type || 'URL' === this.type) {

      if (this.names.length === 1) {
        const ext = this.prepCommonUtil.getFileNameAndExtension(this.datasetFiles[0].filenameBeforeUpload)[1];
        if ('FILE' === this.type) {

          this.datasetInfo.push({
            name : this.translateService.instant('msg.dp.ui.list.file'),
            value : this.datasetFiles[0].fileName,
            svg : this.prepCommonUtil.getFileFormatWithExtension(ext).toString()
          });
        } else {
          this.datasetInfo.push({
            name : `URL(${this.prepCommonUtil.getFileFormatWithExtension(ext)})`,
            value : this.datasetFiles[0].storedUri,
            svg : this.prepCommonUtil.getFileFormatWithExtension(ext).toString()
          });
        }

        if ('XLSX' === this.datasetFiles[0].fileExtension.toUpperCase() || 'XLS' === this.datasetFiles[0].fileExtension.toUpperCase()) {
          this.datasetInfo.push({
            name: this.translateService.instant('msg.dp.th.sheet'),
            value: this.datasetFiles[0].sheetName
          });
        }
      }

    } else if ('DB' === this.type) {

      let ds = this.datasetJdbc;

      // TYPE
      this.datasetInfo.push({
        name : this.translateService.instant('msg.comm.th.type'),
        value : `DB(${ds.dataconnection['connection'].implementor})`,
        svg : ds.dataconnection['connection'].implementor,
      });

      if (this.datasetJdbc.rsType === RsType.TABLE) {

        // DATABASE NAME
        this.datasetInfo.push({
          name : this.translateService.instant('msg.dp.th.database'),
          value : ds.tableInfo.databaseName
        });

        // TABLE NAME
        this.datasetInfo.push({
          name : this.translateService.instant('msg.dp.th.ss.table'),
          value : ds.tableInfo.tableName
        });

      } else {

        this.datasetInfo.push({
          name : this.translateService.instant('msg.dp.th.database'),
          value : ds.sqlInfo.databaseName
        });

        // QUERY STATEMENT
        this.datasetInfo.push({
          name : this.translateService.instant('msg.dp.btn.query'),
          value : ds.sqlInfo.queryStmt
        });

      }

      if (ds.dataconnection['connection'].hostname && ds.dataconnection['connection'].port) {

        // HOST & PORT
        this.datasetInfo.push(
          {name : this.translateService.instant('msg.comm.th.host'), value : ds.dataconnection['connection'].hostname},
          {name : this.translateService.instant('msg.comm.th.port'), value : ds.dataconnection['connection'].port}
        );
      } else {

        // URL
        this.datasetInfo.push(
          {name : this.translateService.instant('msg.nbook.th.url'), value : ds.dataconnection['connection'].url}
        );
      }

    } else if ('STAGING' === this.type) {
      this.datasetInfo.push({
        name : this.translateService.instant('msg.comm.th.type'),
        value : 'STAGING_DB',
        svg : 'HIVE'
      });

      if (this.datasetHive.rsType === RsType.TABLE) {
        this.datasetInfo.push(
          {name : this.translateService.instant('msg.dp.th.database'), value : this.datasetHive.tableInfo.databaseName},
          {name : this.translateService.instant('msg.dp.th.ss.table'), value : this.datasetHive.tableInfo.tableName}
        );
      } else {
        this.datasetInfo.push({name : this.translateService.instant('msg.dp.btn.query'), value : this.datasetHive.sqlInfo.queryStmt});
      }

    }


    // console.info('this.datasetInfo',this.datasetInfo);

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

    let type = this.type === 'DB' ? this.datasetJdbc : this.datasetHive;

    let tableInfo = type.tableInfo;
    let sqlInfo = type.sqlInfo;

    // delete - only use in UI
    delete type.tableInfo;
    delete type.sqlInfo;

    // Error when creating dataflow with dataset with no querystmt
    if (type.rsType === RsType.TABLE) {
      var databaseName = tableInfo.databaseName;
      var tableName = tableInfo.tableName;
      if(type.dataconnection.connection.implementor==="POSTGRESQL") {
        if( /^[a-z0-9]+$/.test(databaseName) === false ) {
          databaseName = `"${databaseName}"`;
        }
        if( /^[a-z0-9]+$/.test(tableName) === false ) {
          tableName = `"${tableName}"`;
        }
      }
      params['queryStmt'] = `select * from ${databaseName}.${tableName}`;
    }

    this.loadingShow();
    this.flag = true;
    this.datasetService.createDataSet(params).then((result) => {
      this.flag = false;
      this.loadingHide();
      if (result) {
          this.results = [];
          this.results.push({dsId: result.dsId, dsName: result.dsName, link : result['_links'].self.href});
          if (this.isChecked && this.isFromDatasetList) {
              this._makeShortCutToDataFlow();
          }else{
              this.createComplete.emit();
          }

      }
    }).catch((error) => {

      type.tableInfo = tableInfo;
      type.sqlInfo = sqlInfo;

      // Error when creating dataflow with dataset with no querystmt
      if (type.rsType === RsType.TABLE) {
        delete params['queryStmt'];
      }

      this.loadingHide();
      this.errorAction(error);
    })
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
                    // this.router.navigate([`/management/prepbot/dataflow/${result1['dfId']}/rule/${result1.datasets[1].dsId}`]);
                    this.router.navigate([`/management/prepbot/dataflow/${result1['dfId']}/dataset/${result1.datasets[1].dsId}`]);
                } else {

                    // If error move to dataset list
                    // this.close();
                    this.createComplete.emit();
                }

            }).catch(() => {

                // If error move to dataset list
                this.loadingHide();
                this.close();
            });
        } else {
            // If error move to dataset list
            this.loadingHide();
            // this.close();
            this.createComplete.emit();
        }
    }

}

class DatasetInfo {
  name : string;
  value : any;
  svg?: string;
}


