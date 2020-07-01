import {Component, HostBinding} from '@angular/core';

@Component({
  selector: 'div[recipe-countpattern-rule]',
  templateUrl: './recipe-countpattern-rule.component.html'
})
export class RecipeCountpatternRuleComponent {

  @HostBinding('class.pb-ui-part-sub')
  public readonly pbUiPartSub = true;

}
