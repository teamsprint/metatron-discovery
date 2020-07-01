import {Component, HostBinding} from '@angular/core';

@Component({
  selector: 'div[recipe-header-rule]',
  templateUrl: './recipe-header-rule.component.html'
})
export class RecipeHeaderRuleComponent {

  @HostBinding('class.pb-ui-part-sub')
  public readonly pbUiPartSub = true;

}
