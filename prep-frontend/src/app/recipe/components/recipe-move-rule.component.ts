import {Component, HostBinding} from '@angular/core';

@Component({
  selector: 'div[recipe-move-rule]',
  templateUrl: './recipe-move-rule.component.html'
})
export class RecipeMoveRuleComponent {

  @HostBinding('class.pb-ui-part-sub')
  public readonly pbUiPartSub = true;

}
