export class RecipeRule {

  public static of() {
    return [
      { command: 'create', alias: 'Cr' },
      { command: 'header', alias: 'He' },
      { command: 'keep', alias: 'Ke' },
      { command: 'replace', alias: 'Rp' },
      { command: 'rename', alias: 'Rm' },
      { command: 'set', alias: 'Se' },
      { command: 'settype', alias: 'St' },
      { command: 'countpattern', alias: 'Co' },
      { command: 'split', alias: 'Sp' },
      { command: 'derive', alias: 'Dr' },
      { command: 'delete', alias: 'De' },
      { command: 'drop', alias: 'Dp' },
      { command: 'pivot', alias: 'Pv' },
      { command: 'unpivot', alias: 'Up' },
      { command: 'join', alias: 'Jo' },
      { command: 'extract', alias: 'Ex' },
      { command: 'flatten', alias: 'Fl' },
      { command: 'merge', alias: 'Me' },
      { command: 'nest', alias: 'Ne' },
      { command: 'unnest', alias: 'Un' },
      { command: 'aggregate', alias: 'Ag' },
      { command: 'sort', alias: 'So' },
      { command: 'move', alias: 'Mv' },
      { command: 'union', alias: 'Ui' }
    ];
  }

  public static ofCommandByName(name: string) {
    const rules = RecipeRule.of();
    return rules[ rules.map(command => command.command).indexOf(name) ];
  }

  public static ofNames() {
    return RecipeRule
      .of()
      .map(command => command.command);
  }

  public static hasCommandByName(name: string) {
    return RecipeRule
      .ofNames()
      .indexOf(name) > -1;
  }
}
