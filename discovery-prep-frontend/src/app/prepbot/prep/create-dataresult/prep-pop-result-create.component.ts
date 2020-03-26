import {
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Injector, Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import {AbstractComponent} from '../../../common/component/abstract.component';
import {HiveFileCompression, Engine, SsType, UriFileFormat, AppendMode, HiveFileFormat} from '../../../domain/data-preparation/pr-snapshot';
import {Field} from '../../../domain/data-preparation/pr-dataset';
import {isUndefined, isNullOrUndefined} from 'util';
import {DataflowService} from "../service/dataflow.service";
import {StorageService} from "../../../data-storage/service/storage.service";
import {DataconnectionService} from '../../../dataconnection/service/dataconnection.service';
import {DatasetService} from '../service/dataset.service';
import * as _ from 'lodash';
declare let moment: any;

@Component({
    selector: 'prep-pop-result-create',
    templateUrl: './prep-pop-result-create.component.html'
})
export class PrepPopResultCreateComponent extends AbstractComponent implements OnInit, OnDestroy {
    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     | Private Variables
     |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
    public uriFileFormat: UriFileFormat;

    private _isDataprepStagingEnabled: boolean = true;
    private _isSparkEngineEnabled: boolean = false;

    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     | Public Variables
     |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
    public datasetId: string;

    public datasetName : string;

    public fields : Field[];

    public isShow : boolean = false;

    public ssName: string;

    public snapshot: SnapShotCreateDomain;

    public SsType = SsType;

    public isAdvancedPrefOpen : boolean = false;

    public fileFormat: {value: UriFileFormat, label: string}[];

    public compressionType: {value:HiveFileCompression, label: string}[];

    public overwriteMethod: {value: AppendMode, label: string}[];

    public Engine = Engine;

    public engineList: {value: Engine, label: string}[];

    public hiveEmbeddedFormat : {value: HiveFileFormat, label: string}[];

    public fileLocations: {value: string, label: string}[];

    public fileUris: string[];

    public dbList : string[];

    public isErrorShow: boolean = false;
    public fileUrlErrorMsg: string = '';
    public fileFormatErrorMsg: string = '';
    public ssNameErrorMsg: string = '';
    public tblErrorMsg: string = '';

    public storedUriChangedDirectly: boolean = false;

    @Output()
    public snapshotCreateFinishEvent = new EventEmitter();

    @Output()
    public snapshotCloseEvent = new EventEmitter();


    @Output()
    public snapshotLoadEvent = new EventEmitter();

    @Input()
    public isFromMainGrid?: boolean = false;


    public isLocationListShow: boolean = false;
    public locationSelectedIndex: number  = 0;
    public isFormatListShow: boolean = false;
    public isDbListShow: boolean = false;
    public isHiveEmbeddedFormatShow: boolean = false;
    public isCompressionTypeShow: boolean = false;
    public isOverwriteMethodShow: boolean = false;
    public isFieldsShow: boolean = false;

    public firstLoading: boolean = true;

    // 생성자
    constructor(protected elementRef: ElementRef,
                private dataflowService: DataflowService,
                private _connectionService: DataconnectionService,
                private datasetService: DatasetService,
                protected injector: Injector) {
        super(elementRef, injector);
    }

    public ngOnInit() {
        super.ngOnInit();
        this.snapshotLoadEvent.emit();
    }

    public ngOnDestroy() {
        super.ngOnDestroy();
    }


    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     | Public Method
     |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
    /**
     * Initial
     * @param {id:string, name : string, fields : Field[]} data
     */
    public init(data : {id: string, name: string, isFromMainGrid?: boolean}) {
        this.firstLoading = true;
        this.datasetId = data.id;
        this.datasetName = data.name;

        if (data.isFromMainGrid) { // Check if snapshot popup is open from main grid
            this.isFromMainGrid = true;
        }

        this._initialiseValues();

        this._getConfig().then(() => {
            this._getGridData(this.datasetId);
        });

    }





    /**
     * Close this popup
     */
    public close() {
        // super.close();
        this.isAdvancedPrefOpen = false;
        this.snapshotCloseEvent.emit();
    }


    /**
     * Open rename popup
     */
    public openRenamePopup() {
        this.snapshotCloseEvent.emit('hive');
    }


    /**
     * Complete making snapshot
     */
    public complete() {

        if (this.isErrorShow) {
            return;
        }

        // Only check field names for hive when isFromMainGrid
        // If Hive type (ssType)
        // open modal If there is inappropriate name for hive snapshot
        if (this.isFromMainGrid && this.snapshot.ssType === SsType.STAGING_DB && !this._isFieldsValidationPass()) {

            // TODO. SAAKS REMARK

            // const modal = new Modal();
            // modal.name = this.translateService.instant('msg.dp.alert.hive.column.error');
            // modal.btnName = this.translateService.instant('msg.comm.ui.ok');
            // this.confirmModalComponent.init(modal);

            return;
        }

        // Snapshot name cannot be empty
        if (this.snapshot.ssName.trim() === '') {
            this.isErrorShow = true;
            this.ssNameErrorMsg = this.translateService.instant('msg.common.ui.required');
            return;
        }

        if (this.snapshot.ssType === SsType.STAGING_DB) {

            // table name cannot be empty
            if (isUndefined(this.snapshot.tblName) || this.snapshot.tblName === '') {
                this.tblErrorMsg = this.translateService.instant('msg.common.ui.required');
                this.isErrorShow = true;
                return;
            }

            if (isUndefined(this.snapshot.partitionColNames)) {
                this.snapshot.partitionColNames = [];
            }

            // table name validation
            const reg = /^[a-zA-Z0-9_]*$/;
            if(!reg.test(this.snapshot.tblName)){
                this.tblErrorMsg = this.translateService.instant('msg.dp.alert.ss.table.name');
                this.isErrorShow = true;
                return;
            }
        }

        // file uri cannot be empty
        if (SsType.URI === this.snapshot.ssType) {
            if (this.snapshot.storedUri.length < 1){
                this.fileUrlErrorMsg = this.translateService.instant('msg.common.ui.required');
                this.isErrorShow = true;
                return;
            }
        }

        if ( this.snapshot.engine !== Engine.EMBEDDED && this.uriFileFormat === UriFileFormat.SQL ) {
            this.fileFormatErrorMsg = this.translateService.instant('msg.dp.alert.ss.not.support.sql');
            this.isErrorShow = true;
            return;
        }

        this.loadingShow();
        this._createSnapshot(this.datasetId, this.snapshot);

    }


    /**
     * When snapshot Name change, modify file type uris
     * */
    public changeSSUri(){
        if( this.storedUriChangedDirectly === true) {
            return;
        }

        let fileName = this.snapshot.ssName.replace(/[^\w_가-힣]/gi, "_") +'.'+ this.uriFileFormat.toString().toLowerCase();
        this.changeStoredUri(fileName);
    }

    public changeStoredUri(fileName: string = null){
        try{
            var slashIndex = this.snapshot.storedUri.lastIndexOf("/");
            if(this.snapshot.storedUri && slashIndex > 0) {
                if(fileName===null) {
                    fileName = this.snapshot.storedUri.substring(slashIndex+1);
                }
                let replacedFileName = fileName.replace(/[^\w_.ㄱ-힣]/gi, "_");

                this.snapshot.storedUri = this.snapshot.storedUri.substring(0,slashIndex+1) + replacedFileName;
            }
        }catch (e) {
            //
        }

    }


    /**
     * When item is selected from the list
     * @param event
     * @param type
     * */
    public onSelected(event,type) {

        switch (type){
            case 'engine':
                this.fileFormatErrorMsg = '';
                this.isErrorShow = false;

                if ('EMBEDDED' === event.value) {
                    this.snapshot.hiveFileFormat = this.hiveEmbeddedFormat[0].value;
                }
                break;
            case 'format':
                this.fileFormatErrorMsg = '';
                this.isErrorShow = false;
                if ( this.snapshot.ssType && this.snapshot.ssType === SsType.URI) {
                    this.uriFileFormat = event.value;
                }
                if ( this.snapshot.ssType && this.snapshot.ssType === SsType.STAGING_DB)
                    this.snapshot.hiveFileFormat = event.value;
                this.isFormatListShow = false;
                this.isHiveEmbeddedFormatShow = false;
                this.changeSSUri();
                break;

            case 'location':
                for(let idx=0;idx<this.fileLocations.length;idx++) {
                    if( event.value==this.fileLocations[idx].value ) {
                        this.locationSelectedIndex  = idx;
                        this.snapshot.storedUri = this.fileUris[idx];
                        this.changeSSUri();
                        break;
                    }
                }
                this.isLocationListShow = false;
                break;
            case 'mode':
                this.snapshot.appendMode = event.value;
                this.isOverwriteMethodShow = false;
                break;
            case 'compression':
                this.snapshot.hiveFileCompression = event.value;
                this.isCompressionTypeShow = false;
                break;
        }

    }


    /**
     * When db name is selected
     * @param dbName
     */
    public onSelectedDBName(dbName) {
        this.snapshot['dbName'] = dbName;
        this.isDbListShow = false;
    }


    /**
     * When part key is selected
     * @param item
     */
    public onPartitionSelected(item) {
        if(isNullOrUndefined(this.snapshot.partitionColNames) || this.snapshot.partitionColNames.length == 0){
            this.snapshot.partitionColNames = [];
            this.snapshot.partitionColNames.push(item.name);
            return;
        }

        let chk: number  = -1;
        for(let i:number = 0; i< this.snapshot.partitionColNames.length; i++) {
            if(this.snapshot.partitionColNames[i]== item.name) {
                chk = i; break;
            }
        }
        if(chk>-1) {
            this.snapshot.partitionColNames.splice(chk);
        }else{
            this.snapshot.partitionColNames.push(item.name);
        }
    }


    public getPartitionSelectedInfo(): string {
        let returnLabel: string = '';
        if(isNullOrUndefined(this.snapshot.partitionColNames) || this.snapshot.partitionColNames.length == 0){
            returnLabel = 'Choose columns to use as partition keys';
        }else{
            returnLabel =  this.snapshot.partitionColNames.join(",");
        }
        return returnLabel;
    }

    public getPartitionSelectedStyle(item): boolean {
        let returnBoolean: boolean = false;
        if(isNullOrUndefined(this.snapshot.partitionColNames) == false && this.snapshot.partitionColNames.length != 0){
            let chk: number  = -1;
            for(let i:number = 0; i< this.snapshot.partitionColNames.length; i++) {
                if(this.snapshot.partitionColNames[i]== item.name) {
                    chk = i; break;
                }
            }
            if(chk>-1) {
                returnBoolean = true;
            }
        }
        return returnBoolean;
    }


    /**
     * Change snapshot type
     * @param ssType
     */
    public changeSsType(ssType : SsType) {
        this.firstLoading = false;
        this.snapshot = new SnapShotCreateDomain();
        this.snapshot.ssName = this.ssName;
        this.snapshot.ssType = ssType;
        this.isErrorShow = false;
        this.fileUrlErrorMsg = '';
        this.fileFormatErrorMsg = '';
        this.tblErrorMsg = '';
        this.ssNameErrorMsg = '';


        if (ssType === SsType.STAGING_DB) {
            this.snapshot.dbName = this.dbList[0];
            this.snapshot.tblName = 'snapshot1';
            this.snapshot.appendMode = this.overwriteMethod[0].value;
            this.snapshot.engine = this.engineList[0].value;
            this.snapshot.hiveFileFormat = this.hiveEmbeddedFormat[0].value;
            this.snapshot.hiveFileCompression = this.compressionType[0].value;

        } else if (ssType === SsType.URI) {

            // Default file format is CSV
            this.uriFileFormat = this.fileFormat[0].value;

            this.snapshot.storedUri = this._getDefaultStoredUri();
        }

        // Select snapshot name
        // TODO
        // setTimeout(() => {
        //     const ssName = this.elementRef.nativeElement.querySelector('.prep-snapshot-name-input');
        //     ssName.select();
        // })

    }

    /**
     * Change ETL Engine
     * @param engine
     */
    public changeEtlEngine(engine : Engine) {
        this.snapshot.engine = engine;
    }

    /**
     * Toggle Advanced setting button
     */
    public toggleAdvancedSettingBtn() {
        this.isAdvancedPrefOpen = !this.isAdvancedPrefOpen;
    }


    /**
     * Check if staging is enabled
     */
    public isStagingEnabled() :boolean {
        return StorageService.isEnableStageDB && this._isDataprepStagingEnabled;
    }


    /**
     * Check if spark engine is enabled
     */
    public isSparkEnabled() :boolean {
        return this._isSparkEngineEnabled;
    }

    /**
     * Remove error msg when keydown in ssName
     */
    public ssNameKeyDown() {
        if (this.ssNameErrorMsg === '') {
            return;
        }

        this.ssNameErrorMsg = '';
        this.isErrorShow = false
    }


    /**
     * Remove error msg when keydown in table name
     */
    public tblNameKeyDown() {
        if (this.tblErrorMsg === '') {
            return;
        }

        this.tblErrorMsg = '';
        this.isErrorShow = false
    }

    /**
     * Check if it has changed directly
     */
    public onChangeStoredUri(event) {
        if(event) {
            this.storedUriChangedDirectly = true;
            this.changeStoredUri();
        }
    }

    /**
     * Remove error msg when keydown in file uri
     */
    public fileUriKeyDown() {
        if (this.fileUrlErrorMsg === '') {
            return;
        }
        this.fileUrlErrorMsg = '';
        this.isErrorShow = false
    }






    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     | Protected Method
     |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     | Private Method
     |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

    private resetComponent(): void {

    }


    /**
     * Make snapshot with enter key
     * @param event Event
     * @private
     */
    // @HostListener('document:keydown.enter', ['$event'])
    // private _onEnterKeydownHandler(event: KeyboardEvent) {
    //     if(this.isShow && event.keyCode === 13) {
    //         this.complete();
    //     }
    // }


    /**
     * Close popup with esc button
     * @param event Event
     * @private
     */
    // @HostListener('document:keydown.escape', ['$event'])
    // private _onKeydownHandler(event: KeyboardEvent) {
    //     if (this.isShow && event.keyCode === 27 ) {
    //         this.close();
    //     }
    // }


    /**
     * Initialise values
     * @private
     */
    private _initialiseValues() {

        this.snapshot = new SnapShotCreateDomain();

        // -------------------
        // File system
        // -------------------
        this.fileFormat = [
            { value: UriFileFormat.CSV, label: 'CSV' },
            { value: UriFileFormat.JSON, label: 'JSON' },
            { value: UriFileFormat.SQL, label: 'SQL' }
        ];

        this.ssName = '';
        this.fileLocations = [];
        this.fileUris = [];


        // -------------------
        // Hive
        // -------------------
        this.overwriteMethod = [
            { value: AppendMode.OVERWRITE, label: 'Overwrite' },
            { value: AppendMode.APPEND, label: 'Append' }
        ];

        this.compressionType = [
            { value: HiveFileCompression.NONE, label: 'NONE' },
            { value: HiveFileCompression.SNAPPY, label: 'SNAPPY' },
            { value: HiveFileCompression.ZLIB, label: 'ZLIB' }
        ];

        this.hiveEmbeddedFormat = [
            { value: HiveFileFormat.ORC, label: 'ORC' },
            { value: HiveFileFormat.CSV, label: 'CSV' }
        ];

        this.engineList = [
            { value : Engine.EMBEDDED, label : 'Embedded Engine' },
            { value : Engine.SPARK, label : 'Spark' }
        ];

    }


    /**
     * Returns default snapshot name
     * @param ssName
     * @private
     */
    private _getDefaultSnapshotName(ssName?:string) : string {
        let today = moment();
        return !_.isNil(ssName) ? ssName : `${this.datasetName}_${today.format('YYYYMMDD_HHmmss')}`;
    }


    /**
     * Set fileLocation and fileUris with conf['file_uri']
     * @param fileUri
     * @private
     */
    private _setFileLocationAndUri(fileUri?:object) {

        this.fileLocations = [];
        this.fileUris = [];

        if (!_.isNil(fileUri)) {
            Object.keys(fileUri).forEach((item) => {
                this.fileLocations.push( { 'value': item, 'label': item } );
                this.fileUris.push(fileUri[item] );
            });
        }
    }

    /**
     * Returns default stored uri value (using fileLocations and file Uris)
     * @private
     */
    private _getDefaultStoredUri(): string{
        let result: string;

        if (0 < this.fileLocations.length) {

            result = this.fileUris[0] ;
            if (['.csv','.json','.sql'].indexOf(this.snapshot.storedUri) < 0)
                result +=  '.' + this.uriFileFormat.toString().toLowerCase();
        }
        return result;
    }


    /**
     * Fetch staging database list
     * @private
     */
    private _getStagingDb() {
        this.dbList = [];
        this._connectionService.getDatabaseForHive().then((data) => {
            if (data['databases']) {
                this.dbList = data['databases'];
            }
        }).catch((error) => {
            console.info('error -> ', error);
            this._isDataprepStagingEnabled = false;
        });
    }


    /**
     * Fetch configuration information (ssName and file URI info)
     * @private
     */
    private _getConfig() {

        return new Promise<any>((resolve, reject) => {

            this.dataflowService.getConfiguration(this.datasetId).then((conf) => {

                if(conf['sparkEngineEnabled']) {
                    this._isSparkEngineEnabled = conf['sparkEngineEnabled'];
                } else {
                    this._isSparkEngineEnabled = false;
                }

                this.ssName = this._getDefaultSnapshotName(conf['ss_name']);

                this._setFileLocationAndUri(conf['file_uri']);

                this._getStagingDb();

                // default: URI & EMBBEDED
                this.changeSsType(SsType.URI);
                this.changeEtlEngine(Engine.EMBEDDED);


                this.loadingHide();
                resolve();
            }).catch((err) => reject(err));

        });
    }


    /**
     * Create snapshot (API)
     * @param dsId
     * @param snapshot
     * @private
     */
    private _createSnapshot(dsId: string, snapshot: SnapShotCreateDomain) {

        this.dataflowService.createDataSnapshot(dsId, snapshot).then((result) => {
            this.loadingHide();
            if (result.errorMsg) {
                // Alert.error(result.errorMsg);
            } else {
                this.isAdvancedPrefOpen = false;
                this.snapshotCreateFinishEvent.emit(result.ssId);
                // this.isShow = false;

            }

        }).catch((error) => {
            this.loadingHide();
            let prep_error = this.dataprepExceptionHandler(error);
            // PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));

        });
    }


    /**
     * Returns true is all fields only consists of small alphabet, numbers and _
     * @private
     */
    private _isFieldsValidationPass(): boolean {

        const names = this.fields.map((item) => item.name);
        let enCheckReg = /^[a-z0-9_]+$/;
        let idx = names.findIndex((item) => {
            return (-1 !== item.indexOf(' ')) || !enCheckReg.test(item)
        });

        return idx === -1
    }


    /**
     * Fetch grid data of dataset
     * @param dsId
     * @private
     */
    private _getGridData(dsId: string) {

        this.datasetService.getDatasetDetail(dsId).then((result) => {
            this.fields = this._getGridDataFromGridResponse(result.gridResponse).fields;
        })

    }

    /**
     * Change grid data to grid response
     * @param gridResponse 매트릭스 정보
     * @returns 그리드 데이터
     */
    private _getGridDataFromGridResponse(gridResponse: any) {
        let colCnt = gridResponse.colCnt;
        let colNames = gridResponse.colNames;
        let colTypes = gridResponse.colDescs;

        const gridData = {
            data: [],
            fields: []
        };

        for ( let idx = 0; idx < colCnt; idx++ ) {
            gridData.fields.push({
                name: colNames[idx],
                type: colTypes[idx].type,
                seq: idx
            });
        }

        gridResponse.rows.forEach((row) => {
            const obj = {};
            for ( let idx = 0;idx < colCnt; idx++ ) {
                obj[ colNames[idx] ] = row.objCols[idx];
            }
            gridData.data.push(obj);
        });

        return gridData;
    } // function - getGridDataFromGridResponse

}

export class SnapShotCreateDomain {
    public engine: Engine;
    public ssName: string;
    public ssType: SsType;
    public hiveFileCompression?: HiveFileCompression;
    public storedUri?: string;
    public dbName?: string;
    public tblName?: string;
    public hiveFileFormat?: HiveFileFormat;
    public appendMode?: AppendMode;
    public partitionColNames?: String[];
}