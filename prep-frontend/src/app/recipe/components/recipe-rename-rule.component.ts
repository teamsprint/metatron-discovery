import {Component, HostBinding} from '@angular/core';

@Component({
  selector: 'div[recipe-rename-rule]',
  templateUrl: './recipe-rename-rule.component.html'
})
export class RecipeRenameRuleComponent {

  @HostBinding('class.pb-ui-part-sub')
  public readonly pbUiPartSub = true;

}
