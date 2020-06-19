import {Component, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {ViewMode} from '../../main/value-objects/view-mode';
import {LocalStorageService} from '../../common/services/local-storage/local-storage.service';
import {AngularGridInstance, Column, FieldType, Formatters, GridOption, SelectedRange} from 'angular-slickgrid';
import {CommonUtil} from '../../common/utils/common-util';

@Component({
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css']
})
export class RecipeDetailComponent implements OnInit {

  public readonly VIEW_MODE = ViewMode;
  public readonly COMMON_UTIL = CommonUtil;

  columnDefinitions: Column[] = [];

  gridOptions: GridOption = {
    autoResize: {
      containerId: 'demo-container',
      sidePadding: 10
    },
    rowSelectionOptions: {
      selectActiveRow: false
    },
    rowHeight: 26,
    enableCheckboxSelector: true,
    enableRowSelection: true,
    showCellSelection: false,
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

  dataset: Array<object> = [];

  gridInstance: AngularGridInstance;

  constructor(public readonly location: Location,
              public readonly localStorageService: LocalStorageService) {
  }

  ngOnInit(): void {

    this.columnDefinitions = [
      {
        id: 'df_id',
        name: 'df_id',
        field: 'df_id',
        sortable: true,
        type: FieldType.string,
        width: 100
      },
      {
        id: 'df_name',
        name: 'df_name',
        field: 'df_name',
        type: FieldType.string,
        sortable: true,
        minWidth: 100
      },
      {
        id: 'created_by',
        name: 'created_by',
        field: 'created_by',
        sortable: true,
        type: FieldType.string,
        minWidth: 100,
      },
      {
        id: 'created_time',
        name: 'created_time',
        field: 'created_time',
        formatter: Formatters.decimal,
        params: { minDecimal: 1, maxDecimal: 2 },
        sortable: true,
        type: FieldType.date,
        minWidth: 90,
        exportWithFormatter: true
      },
      {
        id: 'modified_by',
        name: 'modified_by',
        field: 'modified_by',
        type: FieldType.string,
        sortable: true,
        minWidth: 100
      },
      {
        id: 'modified_time',
        name: 'modified_time',
        field: 'modified_time',
        type: FieldType.date,
        sortable: true,
        minWidth: 100
      },
      {
        id: 'version',
        name: 'version',
        field: 'version',
        sortable: true,
        type: FieldType.string,
        minWidth: 90,
        exportWithFormatter: true
      },
      {
        id: 'custom',
        name: 'custom',
        field: 'custom',
        sortable: true,
        type: FieldType.string,
        minWidth: 90,
        exportWithFormatter: true
      }
    ];

    this.dataset = [
      {
        df_id: '000f0f6d-25d1-4829-bcb9-66895e7adcf1',
        created_by: 'mjk',
        created_time: '2019-05-28 22:59:36',
        modified_by: 'mjk',
        modified_time: '2019-05-28 22:59:36',
        version: '1',
        custom: '',
        df_name: 'Bank Churn Raw Data.csv_0529_0759'
      },
      {
        df_id: '0222a2ee-0e2a-420f-ac1a-a490ff0dc5e8',
        created_by: 'ecoloy',
        created_time: '2019-03-12 1:33:00',
        modified_by: 'ecoloy',
        modified_time: '2019-03-12 1:33:00',
        version: '1',
        custom: '',
        df_name: 'ATM_data (CSV)_0312_1032'
      },
      {
        df_id: '0ab86bc6-82a9-4294-b1d0-205baa31d409',
        created_by: 'deidera',
        created_time: '2020-01-28 8:36:28',
        modified_by: 'choong',
        modified_time: '2020-02-21 9:17:41',
        version: '7',
        custom: '',
        df_name: 'ATM_data (CSV)_0312_102222222232'
      },
      {
        df_id: '0c6f072e-d11c-4150-b70f-4ad819a724a2',
        created_by: 'ecoloy',
        created_time: '2019-06-24 8:19:51',
        modified_by: 'ecoloy',
        modified_time: '2019-06-24 8:19:51',
        version: '1',
        custom: '',
        df_name: 'Seattle_Real_Time_Fire_911_Calls.csv_0624_1719'
      },
      {
        df_id: '0e0e2956-7f5b-4e7b-9dd9-76996dc20e34',
        created_by: 'ecoloy',
        created_time: '2020-03-11 3:53:52',
        modified_by: 'saaks',
        modified_time: '2020-06-02 2:36:45',
        version: '12',
        custom: '',
        df_name: 'coronamask'
      },
      {
        df_id: '156ea2e6-afeb-41c7-a34c-613173ec756e',
        created_by: 'polaris',
        created_time: '2019-03-12 4:52:53',
        modified_by: 'polaris',
        modified_time: '2019-03-12 4:52:53',
        version: '1',
        custom: '',
        df_name: 'colours - duplicated (EXCEL)_0312_1352'
      },
      {
        df_id: '1adcb5d6-848d-4938-a0b5-6c5978b256c9',
        created_by: 'mjk',
        created_time: '2019-03-26 12:21:58',
        modified_by: 'mjk',
        modified_time: '2019-03-26 12:21:58',
        version: '1',
        custom: '',
        df_name: 'smote_cnt_table (CSV)_0326_2121'
      },
      {
        df_id: '1d90168b-793a-4cd6-a90a-68681932a15f',
        created_by: 'mjk',
        created_time: '2019-03-27 5:35:25',
        modified_by: 'mjk',
        modified_time: '2019-03-27 5:35:25',
        version: '1',
        custom: '',
        df_name: 'coeff_table (CSV)_0327_1435'
      },
      {
        df_id: '23e35e31-2648-44bf-b701-d702e356b910',
        created_by: 'mjk',
        created_time: '2019-06-04 6:08:56',
        modified_by: 'mjk',
        modified_time: '2019-06-04 6:08:56',
        version: '1',
        custom: '',
        df_name: 'car.csv_0604_1508'
      },
      {
        df_id: '2a204f27-acc8-4094-abdc-40a859dd74bb',
        created_by: 'saaks',
        created_time: '2020-03-03 5:17:12',
        modified_by: 'saaks',
        modified_time: '2020-03-03 5:18:03',
        version: '2',
        custom: 'trutrutr',
        df_name: 'utru'
      },
      {
        df_id: '3178ac36-1c25-4110-ab48-32a9acb326cb',
        created_by: 'arie',
        created_time: '2019-07-03 8:13:45',
        modified_by: 'arie',
        modified_time: '2019-07-03 8:16:08',
        version: '3',
        custom: '',
        df_name: 'smote_cnt_table (CSV)_0111111'
      },
      {
        df_id: '36ebb414-f438-4fb7-b8f6-85987d45e918',
        created_by: 'saaks',
        created_time: '2020-03-03 2:15:16',
        modified_by: 'saaks',
        modified_time: '2020-03-03 2:15:47',
        version: '3',
        custom: '456',
        df_name: '456'
      },
      {
        df_id: '3ca9cb56-228b-4bd2-8dae-3975d377055c',
        created_by: 'ecoloy',
        created_time: '2020-04-10 1:07:31',
        modified_by: 'ecoloy',
        modified_time: '2020-05-04 5:23:30',
        version: '24',
        custom: '',
        df_name: 'sales_without_city_HIVE_0410_1007'
      },
      {
        df_id: '3e7ce88b-9a10-4a0e-a364-af38c3bc6a68',
        created_by: 'saaks',
        created_time: '2020-03-03 5:19:04',
        modified_by: 'saaks',
        modified_time: '2020-03-05 7:25:45',
        version: '6',
        custom: 'sdgsdgsd',
        df_name: 'gsdg'
      },
      {
        df_id: '3fb730cc-05ec-496a-be1e-20b225b663d1',
        created_by: 'saaks',
        created_time: '2020-03-03 2:13:57',
        modified_by: 'saaks',
        modified_time: '2020-03-05 7:25:44',
        version: '6',
        custom: '123',
        df_name: '123'
      },
      {
        df_id: '4004b1ee-1898-4785-8f8a-b03e925a0830',
        created_by: 'ecoloy',
        created_time: '2019-07-26 0:57:09',
        modified_by: 'ecoloy',
        modified_time: '2019-07-26 0:57:28',
        version: '2',
        custom: '',
        df_name: 'JV_workingday'
      },
      {
        df_id: '4426b3f7-af86-4275-b09a-b4d0ec58dd8d',
        created_by: 'mjk',
        created_time: '2019-06-11 8:07:02',
        modified_by: 'mjk',
        modified_time: '2019-06-11 8:07:02',
        version: '1',
        custom: '',
        df_name: 'bhs_ymdx=2019-09-06,07_0611_1707'
      },
      {
        df_id: '44e533d7-4d06-44c0-8504-08566d61dfb5',
        created_by: 'saaks',
        created_time: '2020-03-04 5:47:37',
        modified_by: 'saaks',
        modified_time: '2020-03-05 7:25:45',
        version: '5',
        custom: 'fasfas',
        df_name: 'fasfasfa'
      },
      {
        df_id: '46eab2e0-09d7-4c22-9f69-a0aaa7edc7d1',
        created_by: 'saaks',
        created_time: '2020-03-02 1:29:50',
        modified_by: 'saaks',
        modified_time: '2020-03-02 1:29:50',
        version: '0',
        custom: '',
        df_name: 'test'
      },
      {
        df_id: '4e912ff1-af77-41f0-8ee6-ea0dc40d444d',
        created_by: 'ecoloy',
        created_time: '2019-06-21 7:31:30',
        modified_by: 'ecoloy',
        modified_time: '2019-06-25 11:40:18',
        version: '2',
        custom: '',
        df_name: 'Stats.csv_0626_1446'
      },
      {
        df_id: '4ec8a4e9-220e-4805-ac25-bd407c9b55a0',
        created_by: 'mjk',
        created_time: '2019-03-27 5:33:58',
        modified_by: 'mjk',
        modified_time: '2019-03-27 5:33:58',
        version: '1',
        custom: '',
        df_name: 'roc_table (CSV)_0327_1433'
      },
      {
        df_id: '4f33e3bf-98b6-4432-9fca-855894ca9db8',
        created_by: 'polaris',
        created_time: '2019-06-26 5:46:15',
        modified_by: 'polaris',
        modified_time: '2019-06-26 5:46:15',
        version: '1',
        custom: '',
        df_name: 'Seasons_Stats.csv_0626_1446'
      },
      {
        df_id: '4fb0d0fe-c944-44de-84b6-ec891e0395c9',
        created_by: 'polaris',
        created_time: '2019-06-26 5:49:03',
        modified_by: 'polaris',
        modified_time: '2019-06-26 5:49:04',
        version: '1',
        custom: '',
        df_name: 'Players.csv_0626_1449'
      },
      {
        df_id: '5034e28d-e5df-47b6-983e-cff606176f32',
        created_by: 'ecoloy',
        created_time: '2019-03-17 14:07:44',
        modified_by: 'ecoloy',
        modified_time: '2019-03-17 14:07:44',
        version: '1',
        custom: '',
        df_name: 'notebook-sample (CSV)_0317_2307'
      },
      {
        df_id: '5322436c-65a1-4fd1-b4ff-2645890b0b90',
        created_by: 'ecoloy',
        created_time: '2019-06-03 6:13:16',
        modified_by: 'ecoloy',
        modified_time: '2019-06-03 6:13:16',
        version: '1',
        custom: '',
        df_name: 'AggregatedData.csv (from kaggle)_0603_1513'
      },
      {
        df_id: '551ef299-5889-429d-a8a7-9acd34d543dd',
        created_by: 'ecoloy',
        created_time: '2019-03-22 5:27:49',
        modified_by: 'ecoloy',
        modified_time: '2020-04-10 1:09:22',
        version: '12',
        custom: '',
        df_name: 'Sales_without_city (CSV)_0322_1427'
      },
      {
        df_id: '55235a4d-738c-4e8d-95d2-d0432b6bac7a',
        created_by: 'mjk',
        created_time: '2019-03-27 5:11:48',
        modified_by: 'mjk',
        modified_time: '2019-03-27 5:11:48',
        version: '1',
        custom: '',
        df_name: 'metric_table (CSV)_0327_1411'
      }
    ];
  }

  angularGridReady(gridInstance: AngularGridInstance) {
    this.gridInstance = gridInstance;
    this.gridInstance.dataView.setItems(this.dataset, 'df_id');
  }
}
