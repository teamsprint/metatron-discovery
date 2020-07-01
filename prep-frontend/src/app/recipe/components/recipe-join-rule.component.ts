import {Component, HostBinding} from '@angular/core';

@Component({
  selector: 'div[recipe-join-rule]',
  templateUrl: './recipe-join-rule.component.html'
})
export class RecipeJoinRuleComponent {

  @HostBinding('class.pb-ui-part-sub')
  public readonly pbUiPartSub = true;

}
