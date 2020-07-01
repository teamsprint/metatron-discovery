import {Component, HostBinding} from '@angular/core';

@Component({
  selector: 'div[recipe-split-rule]',
  templateUrl: './recipe-split-rule.component.html',
})
export class RecipeSplitRuleComponent {

  @HostBinding('class.pb-ui-part-sub')
  public readonly pbUiPartSub = true;

}
