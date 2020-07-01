import {Component, HostBinding} from '@angular/core';

@Component({
  selector: 'div[recipe-aggregate-rule]',
  templateUrl: './recipe-aggregate-rule.component.html'
})
export class RecipeAggregateRuleComponent {

  @HostBinding('class.pb-ui-part-sub')
  public readonly pbUiPartSub = true;

}
