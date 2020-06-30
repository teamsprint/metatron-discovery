export class SlickGridCustomContextMenu {

  public items: Item[];

  constructor(items: Item[]) {
    this.items = items;
  }
}

export class Item {

  title: string;
  disabled = false;
  iconClass: IconClass;
  handler: Function;
  child: Item[];
  divider: boolean;

  constructor(title: string, disabled: boolean, iconClass: IconClass, handler: Function, child: Item[], divider) {
    this.title = title;
    this.disabled = disabled;
    this.iconClass = iconClass;
    this.handler = handler;
    this.child = child;
    this.divider = divider;
  }

  public static of(title: string, disabled: boolean, iconClass: IconClass, handler: Function, child: Item[]) {
    return new Item(title, disabled, iconClass, handler, child, false);
  }

  public static ofDivider() {
    return new Item(undefined, undefined, undefined, undefined, undefined, true);
  }
}

export enum IconClass {
  SHARP = 'pb-icon-type-sharp',
  ARRAY = 'pb-icon-type-array',
  INT = 'pb-icon-type-int',
  TF = 'pb-icon-type-tf',
  CALEN = 'pb-icon-type-calen',
  AB = 'pb-icon-type-ab',
  LOCAL = 'pb-icon-type-local'
}
