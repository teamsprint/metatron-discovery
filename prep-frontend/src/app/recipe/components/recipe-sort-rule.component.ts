import {Component, HostBinding} from '@angular/core';

@Component({
  selector: 'div[recipe-sort-rule]',
  templateUrl: './recipe-sort-rule.component.html',
})
export class RecipeSortRuleComponent {

  @HostBinding('class.pb-ui-part-sub')
  public readonly pbUiPartSub = true;

}
