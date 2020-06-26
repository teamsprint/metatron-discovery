import {Component, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {ViewMode} from '../../main/value-objects/view-mode';
import {LocalStorageService} from '../../common/services/local-storage/local-storage.service';
import {AngularGridInstance, Column, FieldType, GridOption} from 'angular-slickgrid';
import {CommonUtil} from '../../common/utils/common-util';
import * as _ from 'lodash';
import {SlickgridRuleEditSupportService} from '../services/slickgrid-rule-edit-support-service';
import {IconClass, Item, SlickGridCustomContextMenu} from '../domain/slickgrid-custom-context-menu';

declare const Slick;

@Component({
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css']
})
export class RecipeDetailComponent implements OnInit {

  public readonly VIEW_MODE = ViewMode;
  public readonly COMMON_UTIL = CommonUtil;
  public readonly UUID = this.COMMON_UTIL.Generate.makeUUID();

  public readonly GRID_OPTIONS: GridOption = {
    enableAutoResize: true,
    enableHeaderButton: true,
    enableHeaderMenu: false,
    autoResize: {
      containerId: 'demo-container',
      sidePadding: 10
    },
    rowHeight: 26,
    enableFiltering: false,
    enableCellNavigation: true,
    headerButton: {
      onCommand: (e, args) => {
        this.slickgridRuleEditSupportUtil
          .commandRegister(e, args, this.gridObj, [
              this.slickgridRuleEditSupportUtil.colSelectionCommand
            ]
          );
      }
    }
  };
  private readonly SLICK_GRID_CUSTOM_CONTEXT_MENU = new SlickGridCustomContextMenu([
    Item.of('Drop', false, null, null, []),
    Item.ofDivider(),
    Item.of('Alter', false, null, null, [
      Item.of('Column type', false, IconClass.AB, null, []),
      Item.of('Set format', true, IconClass.ARRAY, null, []),
      Item.of('Column name', false, IconClass.CALEN, null, []),
    ]),
    Item.of('Edit', false, null, null, [
      Item.of('Replace', false, IconClass.INT, null, []),
      Item.of('Set', false, IconClass.LOCAL, null, []),
      Item.of('Keep', true, IconClass.SHARP, null, []),
      Item.of('Delete', true, IconClass.TF, null, [])
    ]),
    Item.of('Generate', false, null, null, [
      Item.of('Duplicate', false, null, null, []),
      Item.of('Derive', false, null, null, []),
      Item.of('Split', false, null, null, []),
      Item.of('Extract', false, null, null, []),
      Item.of('Count pattern', false, null, null, []),
      Item.of('Merge', false, null, null, []),
      Item.of('Nest', false, null, null, []),
      Item.of('Unnest', true, null, null, []),
      Item.of('Flatten', true, null, null, [])
    ]),
    Item.of('Sort', false, null, null, [
      Item.of('Ascending', false, null, null, []),
      Item.of('Descending', false, null, null, []),
    ]),
    Item.of('Move', false, null, null, [
      Item.of('First', false, null, null, []),
      Item.of('Last', false, null, null, []),
      Item.of('Before ..', false, null, null, []),
      Item.of('After ..', false, null, null, [])
    ]),
    Item.of('Clean', true, null, null, [])
  ]);

  private readonly slickgridRuleEditSupportUtil = new SlickgridRuleEditSupportService();

  private readonly _header = {
    buttons: [
      _.cloneDeep(this.slickgridRuleEditSupportUtil.colSelectionHeader)
    ]
  };

  get header() {
    return _.cloneDeep(this._header);
  }

  public columnDefinitions: Column[] = [];
  private gridInstance: AngularGridInstance;
  private gridObj;

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
        width: 100,
        cssClass: 'type-column',
        formatter: this.slickgridRuleEditSupportUtil.colSelectionFormatter,
        header: this.header
      },
      {
        id: 'df_name',
        name: 'df_name',
        field: 'df_name',
        type: FieldType.string,
        sortable: true,
        width: 100,
        cssClass: 'type-column',
        formatter: this.slickgridRuleEditSupportUtil.colSelectionFormatter,
        header: this.header
      },
      {
        id: 'created_by',
        name: 'created_by',
        field: 'created_by',
        sortable: true,
        type: FieldType.string,
        width: 100,
        cssClass: 'type-column',
        formatter: this.slickgridRuleEditSupportUtil.colSelectionFormatter,
        header: this.header
      },
      {
        id: 'created_time',
        name: 'created_time',
        field: 'created_time',
        sortable: true,
        type: FieldType.date,
        minWidth: 90,
        cssClass: 'type-column',
        formatter: this.slickgridRuleEditSupportUtil.colSelectionFormatter,
        header: this.header
      },
      {
        id: 'modified_by',
        name: 'modified_by',
        field: 'modified_by',
        type: FieldType.string,
        sortable: true,
        width: 100,
        cssClass: 'type-column',
        formatter: this.slickgridRuleEditSupportUtil.colSelectionFormatter,
        header: this.header
      },
      {
        id: 'modified_time',
        name: 'modified_time',
        field: 'modified_time',
        type: FieldType.date,
        sortable: true,
        width: 100,
        cssClass: 'type-column',
        formatter: this.slickgridRuleEditSupportUtil.colSelectionFormatter,
        header: this.header
      },
      {
        id: 'version',
        name: 'version',
        field: 'version',
        sortable: true,
        type: FieldType.string,
        minWidth: 90,
        cssClass: 'type-column',
        formatter: this.slickgridRuleEditSupportUtil.colSelectionFormatter,
        header: this.header
      },
      {
        id: 'custom',
        name: 'custom',
        field: 'custom',
        sortable: true,
        type: FieldType.string,
        minWidth: 90,
        cssClass: 'type-column',
        formatter: this.slickgridRuleEditSupportUtil.colSelectionFormatter,
        header: this.header
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
    this.gridObj.registerPlugin(new Slick.Plugins.HeaderMenu({}, this.SLICK_GRID_CUSTOM_CONTEXT_MENU));
  }

  public gridCreated($event) {
    this.gridObj = $event;
  }
}
