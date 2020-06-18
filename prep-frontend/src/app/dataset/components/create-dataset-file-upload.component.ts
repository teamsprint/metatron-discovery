/* tslint:disable */
import {ChangeDetectorRef, Injector, Component, ElementRef, EventEmitter, Output, Input, ViewChild, OnInit, OnDestroy} from '@angular/core';
import {CookieService} from 'ngx-cookie-service';
import {CookieConstant} from '../../common/constants/cookie.constant';
import {Dataset} from '../domains/dataset';
import {DatasetsService} from '../services/datasets.service';
import {CommonConstant} from '../../common/constants/common.constant';
import * as _ from 'lodash';

declare let plupload: any;

class UploadNegotitationParameters {
  public limit_size = 0;
  public storage_types: string[] = [];
  // public timestamp = 0 ;
  public upload_id = '';
}

@Component({
  selector: 'create-dataset-file-upload',
  templateUrl: './create-dataset-file-upload.component.html'
})
export class CreateDatasetFileUploadComponent implements OnInit, OnDestroy{
  @Output()
  public readonly onClose = new EventEmitter();
  @Output()
  public readonly onGotoStep = new EventEmitter();

  @ViewChild('drop_container1')
  private drop_container1: ElementRef;

  @ViewChild('drop_container2')
  private drop_container2: ElementRef;

  public datasetFiles: Dataset.DatasetFile[] = [];
  // file uploader
  public chunk_uploader: any;
  public uploadNegoParams: UploadNegotitationParameters;

  public isUploading : boolean = false;
  public changeDetect: ChangeDetectorRef;
  public fileLocations: any[];
  public fileLocation: string;
  public fileLocationDefaultIdx : number = 0;
  // public isLocationListShow1: boolean = false;
  // public isLocationListShow2: boolean = false;
  public limitSize : number;
  public upFiles : any[];
  public sucessFileCount : number = 0;
  public supportedFileCount : number = 0;
  public unsupportedFileCount : number = 0;
  public unsupportedFileView : boolean = false;
  public isNext : boolean = false;
  private _isFileAddedInterval : any;
  private _isFileAdded : boolean = false;

  constructor(private readonly datasetService: DatasetsService,
              private readonly cookieService: CookieService,
              protected injector: Injector) {
  }


  ngOnInit(): void {
    this.changeDetect = this.injector.get(ChangeDetectorRef);
    this.upFiles = [];

    this.datasetService.getFileUploadNegotiation().subscribe((params) => {
      if (!params) {
        return;
      }

      this.uploadNegoParams = JSON.parse(JSON.stringify(params)); // deep copy for negotiation parameters

      this.fileLocations = [];
      if(this.uploadNegoParams.storage_types && this.uploadNegoParams.storage_types.length > 0){
        this.uploadNegoParams.storage_types.forEach((storage_type)=>{
          // FIXME: The storage type is currently LOCAL.
          //if( storage_type === 'LOCAL' )
          this.fileLocations.push( { 'value': storage_type, 'label': storage_type } );
        })
      } else {
        this.fileLocations.push( { 'value': 'LOCAL', 'label': 'LOCAL' } );
      }

      let idx = this.fileLocations.findIndex((item) => {
        return item.value.toUpperCase() === 'LOCAL';
      });
      if (idx == -1) idx = 0;
      this.fileLocationDefaultIdx = idx;
      this.fileLocation = this.fileLocations[idx].value;

      this.limitSize = this.uploadNegoParams.limit_size;

      this.initPlupload();
    });
  }

  public ngOnDestroy() {
    this.chunk_uploader = null;
    clearInterval(this._isFileAddedInterval);
    this._isFileAddedInterval = null;
  }

  public initPlupload() {
    this.chunk_uploader = new plupload.Uploader({
      runtimes : 'html5,html4',
      chunk_size: '0',
      drop_element : [this.drop_container1.nativeElement, this.drop_container2.nativeElement],
      url : `${CommonConstant.API_CONSTANT.API_URL}/preparationdatasets/file_upload`,
      headers:{
        'Accept': 'application/json, text/plain, */*',
        'Authorization': this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN_TYPE) + ' ' + this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN)
      },

      filters : {
        max_file_size : 0,
        prevent_duplicate: true,
        mime_types: [
          {title: "Datapreparation files", extensions: "csv,txt,xls,xlsx,json"}
        ],

      },

      multipart_params: {
        storage_type: '',
        upload_id: '',
        chunk_size: '',
        total_size : ''
      },

      init: {
        PostInit: () => {
          for ( let item in this.chunk_uploader.settings.multipart_params){
            this.chunk_uploader.settings.multipart_params[item] = ''
          }
        },

        // QueueChanged: (up)=>{
        // },

        FilesAdded: (up, files) => {
          this.isNext = false;

          this.chunk_uploader.setOption('chunk_size', this.limitSize );

          plupload.each(files, (file, idx) => {
            this.chunk_uploader.settings.multipart_params.upload_id = null;
            this.chunk_uploader.settings.multipart_params.chunk_size = null;
            this.chunk_uploader.settings.multipart_params.total_size = null;

            file.uploaderNo = 1;
            file.upload_id = null;
            file.isUploaded = false;
            file.isUploading = false;
            file.isCanceled = false;
            file.isFailed = false;
            file.total_chunks = 0;
            file.uploading_chunks = 0;
            file.succeeded_chunks = 0;
            file.failed_chunks = 0;
            file.progressPercent = 0;
            file.storage_type = ('LOCAL' === this.fileLocation? 'Local': this.fileLocation);

            let tmp = this.getFileNameAndExtension(file.name);

            file.fileName = tmp[0];
            file.fileExtension = tmp[1];
            file.response = null;

            this.datasetService.getFileUploadNegotiation().subscribe((params) => {

              if (!params) {
                return;
              }
              this.uploadNegoParams = JSON.parse(JSON.stringify(params));
              file.upload_id = this.uploadNegoParams.upload_id;
              this.supportedFileCount++;
              this.changeDetect.detectChanges();
            });
          });

          files.forEach((file)=>{ this.upFiles.push(file); });
          this._isFileAddedCheck(1);
        },

        UploadProgress: (up, file) => {
          let idx = this.upFiles.findIndex((upFile)=>{ return upFile.id === file.id});
          this.upFiles[idx].progressPercent = file.percent;

          this.changeDetect.detectChanges();
        },

        BeforeUpload: (up, file)=>{
          this.chunk_uploader.settings.multipart_params.upload_id = file.upload_id;
          this.chunk_uploader.settings.multipart_params.chunk_size = this.limitSize;
          this.chunk_uploader.settings.multipart_params.total_size = file.size;

          this.chunk_uploader.settings.multipart_params.storage_type = this.fileLocation;

          this.changeDetect.detectChanges();
        },

        UploadFile: (up,file)=>{
          this.changeDetect.detectChanges();
        },

        FileUploaded: (up, file, info)=>{
          let response = JSON.parse(info.response);

          this.isUploading = false;
          file.isUploading = false;

          file.response = response;
          if( response.chunkIdx == 0 ) {
            file.uploading_chunks--;

            if( response.success==true ) {
              file.succeeded_chunks++;
            } else {
              file.failed_chunks++;
            }
          }

          if( file.succeeded_chunks == file.total_chunks ){
            file.isUploaded = true;
            file.storedUri = response.storedUri;
            this.sucessFileCount++;
          } else {
            file.isUploaded = false;
            file.storedUri = '';
          }

          let idx = this.upFiles.findIndex((upFile)=>{ return upFile.id === file.id});
          this.upFiles[idx].response = file.response;
          this.upFiles[idx].uploading_chunks = file.uploading_chunks;
          this.upFiles[idx].succeeded_chunks = file.succeeded_chunks;
          this.upFiles[idx].failed_chunks = file.failed_chunks;
          this.upFiles[idx].isUploading = file.isUploading;
          this.upFiles[idx].isUploaded = file.isUploaded;
          this.upFiles[idx].storedUri = file.storedUri;
          this.changeDetect.detectChanges();
        },

        BeforeChunkUpload: (up, file, result)=>{
          this.isUploading = true;

          file.total_chunks++;
          file.uploading_chunks++;
          file.isUploading = true;

          let idx = this.upFiles.findIndex((upFile)=>{ return upFile.id === file.id});
          this.upFiles[idx].total_chunks = file.total_chunks;
          this.upFiles[idx].uploading_chunks = file.uploading_chunks;
          this.upFiles[idx].isUploading = file.isUploading;

          this.changeDetect.detectChanges();
        },

        ChunkUploaded: (up, file, info)=>{
          let response = JSON.parse(info.response);

          this.isUploading = true;

          file.isUploading = true;
          file.uploading_chunks--;
          if( response.success==true ) {
            file.succeeded_chunks++;
          } else {
            file.failed_chunks++;
          }

          let idx = this.upFiles.findIndex((upFile)=>{ return upFile.id === file.id});
          this.upFiles[idx].isUploading = file.isUploading;
          this.upFiles[idx].uploading_chunks = file.uploading_chunks;
          this.upFiles[idx].succeeded_chunks = file.succeeded_chunks;
          this.upFiles[idx].failed_chunks = file.failed_chunks;

          this.changeDetect.detectChanges();
        },

        UploadComplete: (up, files) => {
          this.isUploading = false;
          this.fileUploadComplete(1);
          this.changeDetect.detectChanges();
        },

        /* error define
        -100 GENERIC_ERROR
        -200 HTTP_ERROR
        -300 IO_ERROR
        -400 SECURITY_ERROR
        -500 INIT_ERROR
        -600 FILE_SIZE_ERROR
        -601 FILE_EXTENSION_ERROR
        -602 FILE_DUPLICATE_ERROR
        -701 MEMORY_ERROR
         */
        Error: (up, err) => {
          switch (err.code){
            case -601:
              this.unsupportedFileCount++;
              this.unsupportedFileView = true;
              this._unsupportedFileView();
              //Alert.error(this.translateService.instant('msg.dp.alert.file.format.wrong'));
              break;
            case -100:
              console.log('GENERIC_ERROR', err);
              break;
            case -200:
              console.log('HTTP_ERROR', err);
              if (err.response) {
                const res = JSON.parse(err.response);
                // Alert.error(this.translateService.instant(res.message));
              }
              break;
            case -300:
              console.log('IO_ERROR', err);
              break;
            default:
              console.log('unknow error', err);
              break;
          }
        }
      }
    });
    this.chunk_uploader.init();

  }


  public startUpload(pluploadNo:number){
    this.isUploading = true;

    // $('.ddp-list-file-progress').scrollTop(422 * (this.upFiles.length +1));

    this.chunk_uploader.start();
  }

  /**
   * Files Upload Complete(Plupload)
   */
  public fileUploadComplete(pluploadNo:number){
    if (this.sucessFileCount < 1 && this.datasetFiles == undefined) {
      // console.log('fileUploadComplete : this.sucessFileCount < 1 ');
      return;
    }
    this.datasetFiles.splice(0, this.datasetFiles.length);
    for(let i=0; i< this.upFiles.length ; i++) {
      if (this.upFiles[i].isUploaded === true ){
        let datasetFile = new Dataset.DatasetFile();

        datasetFile.filenameBeforeUpload = this.upFiles[i].name;
        datasetFile.storedUri = this.upFiles[i].storedUri;
        // datasetFile.storageType = this._getStorageType(this.fileLocation);
        let fileFormat = this._getFileFormat(this.upFiles[i].fileExtension);
        // console.info('fileFormat', fileFormat);
        datasetFile.fileFormat = Dataset.FILE_FORMAT[fileFormat];

        // Delimiter is , when fileFormat is csv or excel or txt
        const formatWithCommaDel = ['CSV','EXCEL', 'TXT'];
        if(-1 !== formatWithCommaDel.indexOf(fileFormat.toString())) {
          datasetFile.delimiter = ',';
        }

        const quoteCharWithCommaDel = ['CSV', 'TXT'];
        if(-1 !== quoteCharWithCommaDel.indexOf(fileFormat.toString())) {
          datasetFile.quoteChar = '\"';
        }

        datasetFile.fileName = this.upFiles[i].fileName;
        datasetFile.fileExtension = this.upFiles[i].fileExtension;

        this.datasetFiles.push(datasetFile);
      }
    }
    this.isNext = ( !this.isUploading && this.sucessFileCount > 0) ;
    this.chunk_uploader.splice();
  }


  /**
   * Disable Drag and Drop in File list area
   */
  public disableEvent(event){
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
  }

  /**
   * File Upload Reset
   */
  public reset(){
    this.sucessFileCount = 0;
    this.supportedFileCount = 0;
    this.unsupportedFileCount = 0;
    this.unsupportedFileView = false;
    this.isNext = false;

    this.chunk_uploader.splice();
    this.upFiles.splice(0, this.upFiles.length);
    this.datasetFiles.splice(0, this.datasetFiles.length);
  }

  /**
   * Show formatBytes
   */
  public formatBytes(a,b) { // a=크기 , b=소숫점자릿
    if(0==a) return "0 Bytes";
    let c=1024,d=b||2,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(a)/Math.log(c));
    return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]
  }

  public getFileItemIconClassName(fileExtension: string ): string {
    const className: string = this._getFileFormatForIcon(fileExtension).toString();
    return "type-" + className.toLowerCase();
  }

  private _getFileFormatForIcon(fileExtension) {
    let fileType : string = fileExtension.toUpperCase();

    const formats = [
      {extension:'CSV', fileFormat:Dataset.FileFormat.CSV},
      {extension:'TXT', fileFormat:Dataset.FileFormat.TXT},
      {extension:'JSON', fileFormat:Dataset.FileFormat.JSON},
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

  /**
   * File Attach Check(Plupload)
   */
  private _isFileAddedCheck(pluploadNo:number){
    this._isFileAddedInterval = setInterval(()=>{
      for(let i=0; i< this.upFiles.length ; i++) {
        if (this.upFiles.length == i + 1 && this.upFiles[i].upload_id != null ) {
          this._isFileAdded = true;

          clearInterval(this._isFileAddedInterval);
          this._isFileAddedInterval = null;
          this.startUpload(pluploadNo);
        }
      }
    }, 1000);
  }

  /**
   * Unsupported File Wanning
   */
  private _unsupportedFileView(){
    if (this.unsupportedFileView) {
      setTimeout(() => {
        this.unsupportedFileView = false;
      }, 3000);
    }
  }

  private getFileNameAndExtension(fileName: string) : string[] {
    const val = new RegExp(/^.*\.(csv|xls|txt|xlsx|json)$/).exec(fileName);
    // returns [fileName,'csv'] if regular expression is error
    if (val === null || val === undefined) {
      return [fileName, 'csv']
    }
    return [val[0].split('.' + val[1])[0],val[1]]

  }

  private _getFileFormat(fileExtension) {
    let fileType : string = fileExtension.toUpperCase();

    const formats = [
      {extension:'CSV', fileFormat:Dataset.FileFormat.CSV},
      {extension:'TXT', fileFormat:Dataset.FileFormat.TXT},
      {extension:'JSON', fileFormat:Dataset.FileFormat.JSON},
      {extension:'XLSX', fileFormat:Dataset.FileFormat.EXCEL},
      {extension:'XLS', fileFormat:Dataset.FileFormat.EXCEL},
    ];

    const idx = _.findIndex(formats, {extension: fileType});

    if (idx !== -1) {
      return formats[idx].fileFormat
    } else {
      return formats[0].fileFormat
    }
  }

  public returnDatasetFiles() {
    return this.datasetFiles;
  }

  public next() {
    if (this.isNext === false) return;
    this.onGotoStep.emit('create-dataset-file-select');
  }
}
