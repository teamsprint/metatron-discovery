/* tslint:disable */
import {AbstractHistory} from '../../common/domain/abstract-history-entity';
import {PageResult} from '../../common/constants/page';
import {Connection} from '../../connection/domains/connection';

export namespace Dataset {

  export class Entity extends AbstractHistory.Entity {
    dsId: string;
    name: string;
    description: string;
    custom: string;
    importType: IMPORT_TYPE;
    connId: string;
    rsType: RS_TYPE;
    dbName: string;
    tblName: string;
    queryStmt: string;
    fileFormat: FILE_FORMAT;
    filenameBeforeUpload: string;
    sheetName: string;
    storedUri: string;
    delimiter: string;
    quoteChar: string;
    serializedPreview: string;
    manualColumnCount: number;
    totalLines: number;
    totalBytes: number;
  }

  export class Select extends Entity {
    implementor: string;
    hostname: string;
    port: string;
    database: string;
    catalog: string;
    sid: string;
    url: string;
    connType: Connection.ConnType;
    gridResponse: any;

  }

  export class DatasetFile extends Entity {
    public sheets: string[];
    public sheetIndex: number;
    public selectedSheets: string[] = [];
    public sheetInfo: SheetInfo[];
    public fileName: string;
    public fileExtension: string;
    public selected = false;
    public error: object;
    public storageType: StorageType;
  }

  export class DatasetDatabase extends Entity {
    public connectionName: string;
    public implementor: string;

  }


  export class SheetInfo {
    selected: boolean;
    data: object[];
    fields: object[] = [];
    totalRows?: number;
    valid: boolean;
    sheetName?: string;
    columnCount?: number;
  }

  export class SimpleListEntity extends AbstractHistory.Entity {
    selected: boolean;
    origin: boolean;
    dsId: string;
    name: string;
    description: string;
    custom: string;
    importType: IMPORT_TYPE;
    rsType: RS_TYPE;
    dbName: string;
    tblName: string;
    queryStmt: string;
    fileFormat: FILE_FORMAT;
    filenameBeforeUpload: string;
    sheetName: string;
    storedUri: string;
    delimiter: string;
    quoteChar: string;
    serializedPreview: string;
    manualColumnCount: number;
    totalLines: number;
    totalBytes: number;
  }



  export enum IMPORT_TYPE {
    UPLOAD = 'UPLOAD',
    URI = 'URI',
    DATABASE = 'DATABASE',
    KAFKA = 'KAFKA'
  }

  export enum FILE_FORMAT {
    CSV = 'CSV',
    EXCEL = 'EXCEL',
    JSON = 'JSON',
    TXT = 'TXT'
  }

  export enum RS_TYPE {
    TABLE = 'TABLE',
    QUERY = 'QUERY'
  }
  export enum StorageType {
    LOCAL = 'LOCAL',
    HDFS = 'HDFS',
    S3 = 'S3',
    BLOB = 'BLOB',
    FTP = 'FTP',
  }




  export namespace Result {
    export namespace GetDatasets {
      export class SearchedData {
        page: PageResult;
        '_embedded': {
          datasets: Array<Dataset.SimpleListEntity>
        };
      }
    }
  }

}
