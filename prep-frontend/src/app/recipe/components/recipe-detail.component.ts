import {Component, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {ViewMode} from '../../main/value-objects/view-mode';
import {LocalStorageService} from '../../common/services/local-storage/local-storage.service';
import {AngularGridInstance, Column, FieldType, Formatters, GridOption} from 'angular-slickgrid';
import {CommonUtil} from '../../common/utils/common-util';

@Component({
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css']
})
export class RecipeDetailComponent implements OnInit {

  public readonly VIEW_MODE = ViewMode;
  public readonly COMMON_UTIL = CommonUtil;

  public readonly gridOptions: GridOption = {
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
    enableExcelCopyBuffer: true
  };
  public columnDefinitions: Column[] = [];
  private gridInstance: AngularGridInstance;

  public dataset: Array<object> = [];

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

  public gridInstanceReady(gridInstance: AngularGridInstance) {
    this.gridInstance = gridInstance;
    this.gridInstance.dataView.setItems(this.dataset, 'df_id');
  }
}
