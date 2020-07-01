import {Component, HostBinding} from '@angular/core';

@Component({
  selector: 'div[recipe-union-rule]',
  templateUrl: './recipe-union-rule.component.html',
})
export class RecipeUnionRuleComponent {

  @HostBinding('class.pb-ui-part-sub')
  public readonly pbUiPartSub = true;

}
