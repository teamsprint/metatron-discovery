import {Component, HostBinding} from '@angular/core';

@Component({
  selector: 'div[recipe-nest-rule]',
  templateUrl: './recipe-nest-rule.component.html'
})
export class RecipeNestRuleComponent {

  @HostBinding('class.pb-ui-part-sub')
  public readonly pbUiPartSub = true;

}
