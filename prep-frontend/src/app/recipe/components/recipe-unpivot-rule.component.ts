import {Component, HostBinding} from '@angular/core';

@Component({
  selector: 'div[recipe-unpivot-rule]',
  templateUrl: './recipe-unpivot-rule.component.html',
})
export class RecipeUnpivotRuleComponent {

  @HostBinding('class.pb-ui-part-sub')
  public readonly pbUiPartSub = true;

}
