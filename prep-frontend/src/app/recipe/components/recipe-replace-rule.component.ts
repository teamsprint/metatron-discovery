import {Component, HostBinding} from '@angular/core';

@Component({
  selector: 'div[recipe-replace-rule]',
  templateUrl: './recipe-replace-rule.component.html'
})
export class RecipeReplaceRuleComponent {

  @HostBinding('class.pb-ui-part-sub')
  public readonly pbUiPartSub = true;

}
