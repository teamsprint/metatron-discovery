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
import {AuthenticationType} from "../../../domain/dataconnection/dataconnection";
import {HiveFileCompression, Engine, SsType, UriFileFormat, AppendMode, HiveFileFormat} from '../../../domain/data-preparation/pr-snapshot';
import {DsType, ImportType, PrDatasetJdbc, QueryInfo, TableInfo, RsType, Field} from '../../../domain/data-preparation/pr-dataset';
import {isNullOrUndefined} from 'util';
import {DataflowService} from "../service/dataflow.service";
// import {StorageService} from "../../../data-storage/service/storage.service";
import {DataconnectionService} from '../../../dataconnection/service/dataconnection.service';
import {ConnectionParam} from "../../../data-storage/service/data-connection-create.service";
import {DatasetService} from '../service/dataset.service';
import {Dataconnection} from "../../../domain/dataconnection/dataconnection";
import {PageResult} from "../../../domain/common/page";
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

    private _isDataprepStagingEnabled: boolean = false;
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

    // public isErrorShow: boolean = false;
    // public fileUrlErrorMsg: string = '';
    // public fileFormatErrorMsg: string = '';
    // public ssNameErrorMsg: string = '';
    // public tblErrorMsg: string = '';


    public showNameError: boolean = false;
    public showFileURLError: boolean = false;
    public showDataConnectionError: boolean = false;
    public showDatabaseError: boolean = false;
    public showTableLError: boolean = false;



    public storedUriChangedDirectly: boolean = false;

    @Output()
    public snapshotCreateFinishEvent = new EventEmitter();

    @Output()
    public snapshotCloseEvent = new EventEmitter();


    @Output()
    public snapshotLoadEvent = new EventEmitter();

    @Input()
    public isFromMainGrid?: boolean = false;


    public isConnectionListShow: boolean = false;
    public connectionList : any = [];
    public selectedConnection: Dataconnection = null;
    public datasetJdbc: PrDatasetJdbc = new PrDatasetJdbc();
    public databaseList: any[] = [];
    public isDatabaseListShow: boolean = false;
    public schemaList: any[] = [];
    public isSchemaListShow: boolean = false;
    public isLocationListShow: boolean = false;
    public locationSelectedIndex: number  = 0;
    public isFormatListShow: boolean = false;
    // public isHiveEmbeddedFormatShow: boolean = false;
    // public isCompressionTypeShow: boolean = false;
    // public isOverwriteMethodShow: boolean = false;
    // public isFieldsShow: boolean = false;
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
        this.datasetId = data.id;
        this.datasetName = data.name;

        if (data.isFromMainGrid) { // Check if snapshot popup is open from main grid
            this.isFromMainGrid = true;
        }

        this._initialiseValues();
        this._getConnections();
        this._getConfig();
        this.changeSsType(SsType.URI);
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


        // Snapshot name cannot be empty
        if (this.snapshot.ssName.trim() === '') {
            // this.isErrorShow = true;
            // this.ssNameErrorMsg = this.translateService.instant('msg.common.ui.required');
            this.showNameError = true;
            return;
        }

        if (this.snapshot.ssType === SsType.DATABASE) {

            this.snapshot.dcId = this.selectedConnection.id;
            this.snapshot.dbName = undefined;
            if (!isNullOrUndefined(this.datasetJdbc.tableInfo.databaseName)) {
                this.snapshot.dbName = this.datasetJdbc.tableInfo.databaseName;
            }
            this.snapshot.tblName = undefined;
            if (!isNullOrUndefined(this.datasetJdbc.tableInfo.tableName)) {
                this.snapshot.tblName = this.datasetJdbc.tableInfo.tableName;
            }


            if(isNullOrUndefined(this.snapshot.dcId)) {
                this.showDataConnectionError = true;
                return;
            }
            if(isNullOrUndefined(this.snapshot.dbName)) {
                this.showDatabaseError = true;
                return;
            }
            if(isNullOrUndefined(this.snapshot.tblName)) {
                this.showTableLError = true;
                return;
            }
        }

        // file uri cannot be empty
        if (SsType.URI === this.snapshot.ssType) {
            if (this.snapshot.storedUri.length < 1){
                this.showFileURLError = true;
                return;
            }
        }

        if ( this.snapshot.engine !== Engine.EMBEDDED && this.uriFileFormat === UriFileFormat.SQL ) {
            // this.fileFormatErrorMsg = this.translateService.instant('msg.dp.alert.ss.not.support.sql');
            // this.isErrorShow = true;
            return;
        }


        // console.info('this.snapshot', this.snapshot);
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
                // this.fileFormatErrorMsg = '';
                // this.isErrorShow = false;

                if ('EMBEDDED' === event.value) {
                    this.snapshot.hiveFileFormat = this.hiveEmbeddedFormat[0].value;
                }
                break;
            case 'format':
                // this.fileFormatErrorMsg = '';
                // this.isErrorShow = false;

                if ( this.snapshot.ssType && this.snapshot.ssType === SsType.URI) {
                    this.uriFileFormat = event.value;
                }
                // if ( this.snapshot.ssType && this.snapshot.ssType === SsType.STAGING_DB)
                //     this.snapshot.hiveFileFormat = event.value;
                this.isFormatListShow = false;
                // this.isHiveEmbeddedFormatShow = false;
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
                // this.isOverwriteMethodShow = false;
                break;
            // case 'compression':
            //     this.snapshot.hiveFileCompression = event.value;
            //     this.isCompressionTypeShow = false;
            //     break;

            case 'connection':
                this.isConnectionListShow = false;
                this.datasetJdbc.dcId = event.id;
                this.getConnectionDetail();
                break;

            case 'database':
                this.isDatabaseListShow = false;
                this.showDatabaseError  = false;
                this.datasetJdbc.tableInfo.databaseName = event.name;
                this.datasetJdbc.tableInfo.tableName = undefined;
                this.getTables(event.name);
                break;

            case 'table':
                this.isSchemaListShow = false;
                this.showTableLError  = false;
                this.datasetJdbc.tableInfo.tableName = event.name;
                break;
        }

    }



    /**
     * When part key is selected
     * @param item
     */
    // public onPartitionSelected(item) {
    //     if(isNullOrUndefined(this.snapshot.partitionColNames) || this.snapshot.partitionColNames.length == 0){
    //         this.snapshot.partitionColNames = [];
    //         this.snapshot.partitionColNames.push(item.name);
    //         return;
    //     }
    //
    //     let chk: number  = -1;
    //     for(let i:number = 0; i< this.snapshot.partitionColNames.length; i++) {
    //         if(this.snapshot.partitionColNames[i]== item.name) {
    //             chk = i; break;
    //         }
    //     }
    //     if(chk>-1) {
    //         this.snapshot.partitionColNames.splice(chk);
    //     }else{
    //         this.snapshot.partitionColNames.push(item.name);
    //     }
    // }


    // public getPartitionSelectedInfo(): string {
    //     let returnLabel: string = '';
    //     if(isNullOrUndefined(this.snapshot.partitionColNames) || this.snapshot.partitionColNames.length == 0){
    //         returnLabel = 'Choose columns to use as partition keys';
    //     }else{
    //         returnLabel =  this.snapshot.partitionColNames.join(",");
    //     }
    //     return returnLabel;
    // }
    //
    // public getPartitionSelectedStyle(item): boolean {
    //     let returnBoolean: boolean = false;
    //     if(isNullOrUndefined(this.snapshot.partitionColNames) == false && this.snapshot.partitionColNames.length != 0){
    //         let chk: number  = -1;
    //         for(let i:number = 0; i< this.snapshot.partitionColNames.length; i++) {
    //             if(this.snapshot.partitionColNames[i]== item.name) {
    //                 chk = i; break;
    //             }
    //         }
    //         if(chk>-1) {
    //             returnBoolean = true;
    //         }
    //     }
    //     return returnBoolean;
    // }


    /**
     * Change snapshot type
     * @param ssType
     */
    public changeSsType(ssType : SsType) {
        this.resetErrorChecker();
        this.isAdvancedPrefOpen = false;
        this.snapshot = new SnapShotCreateDomain();
        this.snapshot.ssName = this.ssName;
        this.snapshot.ssType = ssType;
        this.changeEtlEngine(Engine.EMBEDDED);
        if (ssType === SsType.DATABASE) {
            this.snapshot.appendMode = AppendMode.OVERWRITE;
        } else if (ssType === SsType.URI) {
            // Default file format is CSV
            this.uriFileFormat = this.fileFormat[0].value;
            this.snapshot.storedUri = this._getDefaultStoredUri();
        }
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
     * Check if spark engine is enabled
     */
    public isSparkEnabled() :boolean {
        return this._isSparkEngineEnabled;
    }

    /**
     * Remove error msg when keydown in ssName
     */
    public ssNameKeyDown() {
        this.showNameError = false;
    }


    /**
     * Remove error msg when keydown in table name
     */
    // public tblNameKeyDown() {
    //     if (this.tblErrorMsg === '') {
    //         return;
    //     }
    //
    //     this.tblErrorMsg = '';
    //     this.isErrorShow = false
    // }

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
        this.showFileURLError = false;
    }






    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     | Protected Method
     |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     | Private Method
     |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

    private resetErrorChecker(): void {
        this.showNameError = false;
        this.showFileURLError = false;
        this.showDataConnectionError = false;
        this.showDatabaseError  = false;
        this.showTableLError  = false;
    }

    private _getConnections() {
        this.loadingShow();
        this._connectionService.getAllDataconnections(this._getConnectionPresetListParams(this.pageResult), 'forSimpleListView')
            .then((data) => {

                // 리스트가 있다면
                if (data.hasOwnProperty('_embedded')) {

                    // 리스트 추가
                    this.connectionList = this.connectionList.concat(data['_embedded'].connections);

                    if (this.connectionList.length !== 0 ) {

                        // 첫번째 커넥션 등록
                        this.datasetJdbc.dcId = this.connectionList[0].id;
                        this.getConnectionDetail();
                    } else {

                        this.loadingHide();
                        // 커넥션 리스트가 0개 라면
                        this.selectConnection(null);
                    }

                } else {
                    this.loadingHide();
                    // no connections
                    this.connectionList = [];
                    this.selectConnection(null)
                }

                this.pageResult = data['page'];

            })
            .catch((err) => {
                this.loadingHide();
                console.info('getConnections err)', err.toString());
            });
    }


    /**
     * Get connection detail information
     */
    private getConnectionDetail() {

        this.loadingShow();
        //  get connection data in preset
        this._connectionService.getDataconnectionDetail(this.datasetJdbc.dcId)
            .then((connection: Dataconnection) => {
                // loading hide
                this.loadingHide();
                this.selectConnection(connection);
            })
            .catch(error => this.commonExceptionHandler(error));
    }
    /**
     * Initialise _connection component
     * @param connection
     */
    private selectConnection(connection) {
        this.databaseList = [];
        this.schemaList = [];
        this.selectedConnection = connection;
        this.datasetJdbc.sqlInfo = new QueryInfo();
        this.datasetJdbc.tableInfo = new TableInfo();
        if(this.selectedConnection == null || isNullOrUndefined(this.selectedConnection)) return;
        this.checkConnection();
    }


    /**
     * Fetch dataset connections
     */

    private _getConnectionPresetListParams(pageResult: PageResult): object {
        return {
            authenticationType:'MANUAL',
            size: pageResult.size,
            page: pageResult.number,
            type: 'jdbc'
        };
    }



    /**
     * Check valid connection
     */
    private checkConnection(): void {
        // init connection validation
        this.loadingShow();
        // check connection
        this._connectionService.checkConnection({connection: this.getConnectionParams(this.selectedConnection)})
            .then((result: {connected: boolean}) => {
                // set connection validation result

                if(result.connected) {
                    this.datasetJdbc.dataconnection = this.getConnectionParams(this.selectedConnection);
                    this.datasetJdbc.connectionList = this.connectionList;
                    // this.stepChange.emit( 'DB-QUERY');

                    this.datasetJdbc.sqlInfo = new QueryInfo();
                    this.datasetJdbc.tableInfo = new TableInfo();

                    this.getDatabases();
                    this._setDefaultValues();
                }
            })
            .catch((error) => {
                this.loadingHide();
                console.info('getConnections err)', error.toString());
            });
    }

    /**
     * Set default values
     * @private
     */
    private _setDefaultValues() {

        // Imported and DB type is default value
        this.datasetJdbc.dsType = DsType.IMPORTED;
        this.datasetJdbc.importType = ImportType.DATABASE;


        // When no tab is selected -> default is TABLE
        if (isNullOrUndefined(this.datasetJdbc.rsType)) {
            this.datasetJdbc.rsType = RsType.TABLE;
        }
    }


    /**
     * Get connection params
     * @return {ConnectionParam}
     */
    private getConnectionParams(connection: Dataconnection) {
        let connectionParam: ConnectionParam = {
            implementor: connection.implementor
        };
        connectionParam.username = connection.username;
        connectionParam.password = connection.password;


        // not use URL
        if (isNullOrUndefined(connection.url)) {
            // HOST
            connectionParam.hostname = connection.hostname;
            connectionParam.port = connection.port;
            if (!isNullOrUndefined(connection.sid)) {
                connectionParam.sid = connection.sid;
            } else if (!isNullOrUndefined(connection.database)) {
                connectionParam.database = connection.database;
            } else if (!isNullOrUndefined(connection.catalog)) {
                connectionParam.catalog = connection.catalog
            }
        } else {  // use URL
            connectionParam.url = connection.url;
        }
        // check enable authentication
        if (!isNullOrUndefined(connection.authenticationType)) {
            connectionParam.authenticationType = connection.authenticationType;
        } else { // if disable authentication, set default type
            connectionParam.authenticationType = AuthenticationType.MANUAL;
        }

        return connectionParam;
    }

    /**
     * Get database list
     */
    private getDatabases() {
        this.loadingShow();

        if (!this.datasetJdbc.dataconnection.connection) {
            const connectionInfo = _.clone(this.datasetJdbc.dataconnection);
            this.datasetJdbc.dataconnection = {connection : {
                hostname: connectionInfo.hostname,
                implementor: connectionInfo.implementor,
                password: connectionInfo.password,
                port: connectionInfo.port,
                url: connectionInfo.url,
                username: connectionInfo.username,
                authenticationType: connectionInfo.authenticationType
            }
            };

            if (this.datasetJdbc.dataconnection.connection.implementor === 'POSTGRESQL' && !connectionInfo.url) {
                this.datasetJdbc.dataconnection.connection.database = connectionInfo.database;
            }

            if (this.datasetJdbc.dataconnection.connection.implementor === 'PRESTO' && !connectionInfo.url) {
                this.datasetJdbc.dataconnection.connection.catalog = connectionInfo.catalog;
            }

            if ( (this.datasetJdbc.dataconnection.connection.implementor === 'TIBERO' || this.datasetJdbc.dataconnection.connection.implementor === 'ORACLE')
                && !connectionInfo.url) {

                this.datasetJdbc.dataconnection.connection.sid = connectionInfo.sid;
            }

        }


        this.loadingShow();
        this._connectionService.getDatabasesWithoutId(this.datasetJdbc.dataconnection)
            .then((data) => {
                this.loadingHide();
                this.databaseList = [];
                if (data && data.databases) {
                    data.databases.forEach((item, index) => {
                        this.databaseList.push({idx : index, name : item, selected : false})
                    })
                }

            }).catch((error) => {
            this.loadingHide();
            let prep_error = this.dataprepExceptionHandler(error);
            // PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
        });


    } // function - getDatabases


    /**
     * Get table list
     * @param {string} database
     */
    private getTables(database:string) {
        this.loadingShow();

        const param = {
            connection : this.datasetJdbc.dataconnection.connection,
            database : database
        };

        this._connectionService.getTablesWitoutId(param).then((data) => {
            this.loadingHide();

            this.schemaList = [];
            if (data && data.tables.length > 0) {
                data.tables.forEach((item, index) => {
                    this.schemaList.push({idx : index, name : item, selected : false});
                });

            }

        }).catch((error) => {
            this.schemaList = [];
            this.loadingHide();
        });

    } // function - getTables



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

        this.uriFileFormat = this.fileFormat[0].value;

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

                // this._getStagingDb();

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
                this.prepAlertShow('',result.errorMsg);
            } else {
                this.isAdvancedPrefOpen = false;
                this.snapshotCreateFinishEvent.emit(result.ssId);
                this.prepNotiShow('Dataresult saving complete', result.ssName+'<br/>저장되었습니다.');
            }

        }).catch(error => this.commonExceptionHandler(error));
    }
}

export class SnapShotCreateDomain {
    public ssType: SsType;
    public ssName: string;
    public storedUri?: string;
    public dcId?: string;
    public dbName?: string;
    public tblName?: string;
    public hiveFileFormat?: HiveFileFormat;
    public hiveFileCompression?: HiveFileCompression;
    public appendMode?: AppendMode;
    public engine: Engine;
    public partitionColNames?: String[];
}