import {Component, HostBinding} from '@angular/core';

@Component({
  selector: 'div[recipe-flatten-rule]',
  templateUrl: './recipe-flatten-rule.component.html'
})
export class RecipeFlattenRuleComponent {

  @HostBinding('class.pb-ui-part-sub')
  public readonly pbUiPartSub = true;

}
