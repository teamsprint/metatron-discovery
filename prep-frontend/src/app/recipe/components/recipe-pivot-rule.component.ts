import {Component, HostBinding} from '@angular/core';

@Component({
  selector: 'div[recipe-pivot-rule]',
  templateUrl: './recipe-pivot-rule.component.html'
})
export class RecipePivotRuleComponent {

  @HostBinding('class.pb-ui-part-sub')
  public readonly pbUiPartSub = true;

}
