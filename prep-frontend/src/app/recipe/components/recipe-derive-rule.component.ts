import {Component, HostBinding} from '@angular/core';

@Component({
  selector: 'div[recipe-derive-rule]',
  templateUrl: './recipe-derive-rule.component.html'
})
export class RecipeDeriveRuleComponent {

  @HostBinding('class.pb-ui-part-sub')
  public readonly pbUiPartSub = true;

}
