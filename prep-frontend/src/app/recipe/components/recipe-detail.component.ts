import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Location} from '@angular/common';
import {ViewMode} from '../../main/value-objects/view-mode';
import {LocalStorageService} from '../../common/services/local-storage/local-storage.service';
import {AngularGridInstance, Column, GridOption, SelectedRange} from 'angular-slickgrid';
import {CommonUtil} from '../../common/utils/common-util';
import * as _ from 'lodash';
import {RecipeService} from '../services/recipe.service';
import {NGXLogger} from 'ngx-logger';
import {LoadingService} from '../../common/services/loading/loading.service';
import {concatMap, finalize, map} from 'rxjs/operators';
import {RouterUrls} from '../../common/constants/router.constant';
import {ActivatedRoute} from '@angular/router';
import {Recipe} from '../domain/recipe';
import {DataflowService} from '../../dataflow/services/dataflow.service';
import {IconClass, Item, SlickGridCustomContextMenu} from '../../common/domain/slickgrid-custom-context-menu';
import {Dataflow} from '../../dataflow/domains/dataflow';
// @ts-ignore
import Split from 'split.js';
import {CustomColSelectionExtension} from '../../common/services/slickgrid/custom-col-selection-extension';
import {RecipeLocalStorageService} from '../../common/services/local-storage/recipe-local-storage.service';
import GridResponse = Recipe.GridResponse;

declare const Slick;

enum RuleEditMenus {
  RULES = 'RULES',
  JOB_RESULT = 'JOB_RESULT'
}

@Component({
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css']
})
export class RecipeDetailComponent implements OnInit, OnDestroy {

  public readonly COMMON_UTIL = CommonUtil;
  public readonly UUID = this.COMMON_UTIL.Generate.makeUUID();
  public readonly VIEW_MODE = ViewMode;
  public readonly RULE_EDIT_MENUS = RuleEditMenus;

  @ViewChild('leftSlider', { static: true })
  private readonly leftSlider: ElementRef;
  @ViewChild('rightSlider', { static: true })
  private readonly rightSlider: ElementRef;
  private readonly RECIPE_DETAIL_SPLIT_RATE = this.recipeLocalStorageService.getRecipeDetailSplitRate();
  private readonly LEFT_SLIDER_MIN_SIZE = 750;
  private readonly RIGHT_SLIDER_MIN_SIZE = 300;
  private split;

  private readonly SLICK_GRID_CUSTOM_CONTEXT_MENU = new SlickGridCustomContextMenu([
    Item.of('Drop', false, null, null, []),
    Item.ofDivider(),
    Item.of('Alter', false, null, null, [
      Item.of('Column type', false, null, null, [
        Item.of('Long', false, IconClass.INT, null, []),
        Item.of('Double', false, IconClass.INT, null, []),
        Item.of('Boolean', false, IconClass.SHARP, null, []),
        Item.of('Timestamp', false, IconClass.TF, null, []),
        Item.of('String', false, IconClass.AB, null, []),
        Item.of('Map', false, null, null, []),
        Item.of('Array', false, IconClass.ARRAY, null, [])
      ]),
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
  public readonly GRID_OPTIONS: GridOption = {
    autoResize: {
      containerId: `${this.UUID}-recipe-detail-component-container`,
      sidePadding: 10
    },
    rowSelectionOptions: {
      selectActiveRow: false
    },
    rowHeight: 26,
    enableAutoResize: true,
    enableCellNavigation: true,
    showCustomFooter: true,
    enableExcelCopyBuffer: true,
    enableHeaderButton: true,
    enableHeaderMenu: false,
    enableFiltering: false,
    datasetIdPropertyName: `${this.UUID}`,
    // enableAutoResize: true,
    // enableCellNavigation: true,
    // showCustomFooter: true,
    // enableExcelCopyBuffer: true,
    excelCopyBufferOptions: {
      onCopyCells: (e, args: { ranges: SelectedRange[] }) => console.log('onCopyCells', args.ranges),
      onPasteCells: (e, args: { ranges: SelectedRange[] }) => console.log('onPasteCells', args.ranges),
      onCopyCancelled: (e, args: { ranges: SelectedRange[] }) => console.log('onCopyCancelled', args.ranges),
    },
    headerButton: {
      onCommand: (e, args) => {
        this.customColSelectionExtension
          .commandRegister(e, args, this.gridObj, [
              this.customColSelectionExtension.colSelectionCommand
            ]
          );
      }
    }
  };
  private readonly customColSelectionExtension = new CustomColSelectionExtension();
  private gridInstance: AngularGridInstance;
  private gridObj;
  public columnDefinitions: Column[] = [];
  public dataset: Array<object> = [];

  private dataflowId: string;
  public dataflow: Dataflow.ValueObjects.Select;
  private recipeId: string;
  public recipe: Recipe.Entity;

  public isSelectedMenu = this.RULE_EDIT_MENUS.RULES;

  private readonly UNSELECT_RULE = -1;
  public isSelectedRule = this.UNSELECT_RULE;

  constructor(public readonly location: Location,
              public readonly localStorageService: LocalStorageService,
              private readonly logger: NGXLogger,
              private readonly loadingService: LoadingService,
              private readonly activatedRoute: ActivatedRoute,
              private readonly dataflowService: DataflowService,
              private readonly recipeService: RecipeService,
              private readonly recipeLocalStorageService: RecipeLocalStorageService) {
  }

  ngOnInit(): void {

    this.split = Split([this.leftSlider.nativeElement, this.rightSlider.nativeElement], {
        sizes: [this.RECIPE_DETAIL_SPLIT_RATE.left, this.RECIPE_DETAIL_SPLIT_RATE.right],
        minSize: [this.LEFT_SLIDER_MIN_SIZE, this.RIGHT_SLIDER_MIN_SIZE],
        onDragEnd: () => {
          this.gridInstance.resizerService.resizeGrid().then();
          this.recipeLocalStorageService.saveRecipeDetailSplitRate(Math.round((this.split.getSizes())[ 0 ]));
        }
      }
    );

    this.activatedRoute
      .paramMap
      .subscribe(params => {

        const dataflowId = params.get(RouterUrls.Managements.getFlowDetailPathVariableKey());
        if (dataflowId) {
          this.dataflowId = dataflowId;
        }

        const recipeId = params.get(RouterUrls.Managements.getRecipeDetailPathVariableKey());
        if (recipeId) {
          this.recipeId = recipeId;
        }
      });

    this.loadingService.show();

    this.dataflowService
      .getDataflow(this.dataflowId)
      .pipe(
        map((r: Dataflow.ValueObjects.Select) => this.dataflow = r),
        concatMap(() => {
          return this.recipeService
            .getRecipe(this.recipeId)
            .pipe(map(r => r));
        }),
        finalize(() => {
          this.columnDefinitions = this.generateGridHeaders(this.recipe.gridResponse);
          this.dataset = this.generateGridRows(this.recipe.gridResponse);
          this.loadingService.hide();
        })
      )
      .subscribe(
        (r: Recipe.Entity) => {
          this.recipe = r;
        },
        () => {
          this.dataflow = undefined;
          this.recipe = undefined;
          this.columnDefinitions = [];
          this.dataset = [];
        }
      );
  }

  ngOnDestroy(): void {
    if (this.split) {
      this.split.destroy();
    }
  }

  public gridInstanceReady(gridInstance: AngularGridInstance) {
    this.gridInstance = gridInstance;
    this.gridObj.registerPlugin(new Slick.Plugins.HeaderMenu({}, this.SLICK_GRID_CUSTOM_CONTEXT_MENU));
  }

  public gridCreated($event) {
    this.gridObj = $event;
  }

  public getGridResponseColDescsDistinctCount(gridResponse: Recipe.GridResponse) {
    return GridResponse.getColDescsDistinctCount(gridResponse);
  }

  public getGridResponseColNamesCount(gridResponse: Recipe.GridResponse) {
    return GridResponse.getColNamesCount(gridResponse);
  }

  private generateGridHeaders(gridResponse: Recipe.GridResponse) {

    const fields = [];

    for (let idx = 0; idx < gridResponse.colCnt; idx++) {
      fields.push({
        id: gridResponse.colNames[ idx ],
        name: gridResponse.colNames[ idx ],
        field: gridResponse.colNames[ idx ],
        type: gridResponse.colDescs[ idx ].type,
        cssClass: 'type-column',
        sortable: true,
        formatter: this.customColSelectionExtension.colSelectionFormatter,
        header: _.cloneDeep({
          buttons: [
            _.cloneDeep(this.customColSelectionExtension.colSelectionHeader)
          ]
        }),
        seq: idx
      });
    }

    return fields;
  }

  private generateGridRows(gridResponse: Recipe.GridResponse) {

    const rows = [];

    if (!gridResponse) {
      return rows;
    }

    if (!gridResponse.rows) {
      return rows;
    }

    gridResponse
      .rows
      .forEach((row) => {
        let obj = {};

        for (let idx = 0; idx < gridResponse.colCnt; idx++) {
          obj[ gridResponse.colNames[ idx ] ] = row.objCols[ idx ];
        }

        obj = _.merge({ [ this.UUID ]: this.COMMON_UTIL.Generate.makeUUID() }, obj);

        rows.push(obj);
      });

    return rows;
  }

  public getRecipeRuleUiContext(uiContext: string) {
    return Recipe.RecipeRule.getUiContext(uiContext);
  }

  public selectEditMenu(ruleEditMenu: RuleEditMenus) {

    if (this.isSelectedMenu) {
      this.isSelectedMenu = undefined;
      return;
    }

    this.isSelectedMenu = ruleEditMenu;
  }

  public selectRule(recipeRule: Recipe.RecipeRule) {

    if (this.isSelectedRule > this.UNSELECT_RULE) {
      this.isSelectedRule = this.UNSELECT_RULE;
      return;
    }

    this.isSelectedRule = recipeRule.ruleNo;
  }
}
