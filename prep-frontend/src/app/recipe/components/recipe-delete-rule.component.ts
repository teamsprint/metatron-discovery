import {Component, HostBinding} from '@angular/core';

@Component({
  selector: 'div[recipe-delete-rule]',
  templateUrl: './recipe-delete-rule.component.html'
})
export class RecipeDeleteRuleComponent {

  @HostBinding('class.pb-ui-part-sub')
  public readonly pbUiPartSub = true;

}
