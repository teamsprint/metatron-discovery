export class RecipeRuleCommand {

  static readonly CREATE = { command: 'create', alias: 'Cr' };
  static readonly HEADER = { command: 'header', alias: 'He' };
  static readonly KEEP = { command: 'keep', alias: 'Ke' };
  static readonly REPLACE = { command: 'replace', alias: 'Rp' };
  static readonly RENAME = { command: 'rename', alias: 'Rm' };
  static readonly SET = { command: 'set', alias: 'Se' };
  static readonly SETTYPE = { command: 'settype', alias: 'St' };
  static readonly COUNTPATTERN = { command: 'countpattern', alias: 'Co' };
  static readonly SPLIT = { command: 'split', alias: 'Sp' };
  static readonly DERIVE = { command: 'derive', alias: 'Dr' };
  static readonly DELETE = { command: 'delete', alias: 'De' };
  static readonly DROP = { command: 'drop', alias: 'Dp' };
  static readonly PIVOT = { command: 'pivot', alias: 'Pv' };
  static readonly UNPIVOT = { command: 'unpivot', alias: 'Up' };
  static readonly JOIN = { command: 'join', alias: 'Jo' };
  static readonly EXTRACT = { command: 'extract', alias: 'Ex' };
  static readonly FLATTEN = { command: 'flatten', alias: 'Fl' };
  static readonly MERGE = { command: 'merge', alias: 'Me' };
  static readonly NEST = { command: 'nest', alias: 'Ne' };
  static readonly UNNEST = { command: 'unnest', alias: 'Un' };
  static readonly AGGREGATE = { command: 'aggregate', alias: 'Ag' };
  static readonly SORT = { command: 'sort', alias: 'So' };
  static readonly MOVE = { command: 'move', alias: 'Mv' };
  static readonly UNION = { command: 'union', alias: 'Ui' };

  public static of() {
    return [
      RecipeRuleCommand.CREATE,
      RecipeRuleCommand.HEADER,
      RecipeRuleCommand.KEEP,
      RecipeRuleCommand.REPLACE,
      RecipeRuleCommand.RENAME,
      RecipeRuleCommand.SET,
      RecipeRuleCommand.SETTYPE,
      RecipeRuleCommand.COUNTPATTERN,
      RecipeRuleCommand.SPLIT,
      RecipeRuleCommand.DERIVE,
      RecipeRuleCommand.DELETE,
      RecipeRuleCommand.DROP,
      RecipeRuleCommand.PIVOT,
      RecipeRuleCommand.UNPIVOT,
      RecipeRuleCommand.JOIN,
      RecipeRuleCommand.EXTRACT,
      RecipeRuleCommand.FLATTEN,
      RecipeRuleCommand.MERGE,
      RecipeRuleCommand.NEST,
      RecipeRuleCommand.UNNEST,
      RecipeRuleCommand.AGGREGATE,
      RecipeRuleCommand.SORT,
      RecipeRuleCommand.MOVE,
      RecipeRuleCommand.UNION
    ];
  }

  public static ofCommandByName(name: string) {
    const rules = RecipeRuleCommand.of();
    return rules[ rules.map(command => command.command).indexOf(name) ];
  }

  public static ofNames() {
    return RecipeRuleCommand
      .of()
      .map(command => command.command);
  }

  public static hasCommandByName(name: string) {
    return RecipeRuleCommand
      .ofNames()
      .indexOf(name) > -1;
  }
}
