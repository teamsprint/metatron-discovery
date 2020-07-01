import {Component, HostBinding} from '@angular/core';

@Component({
  selector: 'div[recipe-merge-rule]',
  templateUrl: './recipe-merge-rule.component.html'
})
export class RecipeMergeRuleComponent {

  @HostBinding('class.pb-ui-part-sub')
  public readonly pbUiPartSub = true;

}
