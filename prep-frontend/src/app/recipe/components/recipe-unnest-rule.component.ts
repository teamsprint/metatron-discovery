import {Component, HostBinding} from '@angular/core';

@Component({
  selector: 'div[recipe-unnest-rule]',
  templateUrl: './recipe-unnest-rule.component.html'
})
export class RecipeUnnestRuleComponent {

  @HostBinding('class.pb-ui-part-sub')
  public readonly pbUiPartSub = true;

}
