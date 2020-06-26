import * as _ from 'lodash';
import {HeaderButtonOnCommandArgs} from 'angular-slickgrid/app/modules/angular-slickgrid/models/headerButtonOnCommandArgs.interface';

export class SlickgridRuleEditSupportService {

  public columnsWithHighlightingById = {};
  public readonly unSelectionCssClass = 'svg-sample';
  public readonly selectionCssClass = `${this.unSelectionCssClass}-action`;

  constructor() {
  }

  private _colSelectionHeader = {
    cssClass: _.cloneDeep(this.unSelectionCssClass),
    command: 'col-selection',
  };

  get colSelectionHeader(): { cssClass: string; command: string } {
    return _.cloneDeep(this._colSelectionHeader);
  }

  private _customContextMenu = {
    cssClass: _.cloneDeep(this.unSelectionCssClass) + _.cloneDeep(' ' + this.unSelectionCssClass) + '-context',
    command: 'custom-context-menu',
  };

  get customContextMenu(): { cssClass: string; command: string } {
    return _.cloneDeep(this._customContextMenu);
  }

  public readonly colSelectionFormatter = (row, cell, value, columnDef, dataContext) => {
    if (this.columnsWithHighlightingById && this.columnsWithHighlightingById[ columnDef.id ]) {
      return `<div class="type-column type-column-selected">${value}</div>`;
    } else {
      return `<div class="type-column">${value}</div>`;
    }
    // tslint:disable-next-line:semicolon
  };

  public readonly commandRegister = (e: Event, args: HeaderButtonOnCommandArgs, gridObj, functions) => {
    _.forEach(_.filter(functions, f => _.negate(_.isNil)(f)), f => f(e, args, gridObj));
    // tslint:disable-next-line:semicolon
  };

  public readonly colSelectionCommand = (e: Event, args: HeaderButtonOnCommandArgs, gridObj) => {

    const command = args.command;

    if (command !== this.colSelectionHeader.command) {
      return;
    }

    if (!this.columnsWithHighlightingById) {
      this.columnsWithHighlightingById = {};
    }

    const column = args.column;
    const button = args.button;

    if (command === this.colSelectionHeader.command) {
      if (button.cssClass === this.unSelectionCssClass) {
        this.columnsWithHighlightingById[ column.id ] = true;
        button.cssClass = this.selectionCssClass;
      } else {
        delete this.columnsWithHighlightingById[ column.id ];
        button.cssClass = this.unSelectionCssClass;
      }
      gridObj.invalidate();
    }
    // tslint:disable-next-line:semicolon
  };

  public readonly customContextCommand = (e: Event, args: HeaderButtonOnCommandArgs, gridObj) => {

    // const column = args.column;
    // const button = args.button;
    const command = args.command;

    if (command !== this.customContextMenu.command) {
      return;
    }

    console.log('customContextCommand', e);

    // tslint:disable-next-line:semicolon
  };
}

