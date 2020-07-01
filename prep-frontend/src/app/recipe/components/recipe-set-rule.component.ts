import {Component, HostBinding} from '@angular/core';

@Component({
  selector: 'div[recipe-set-rule]',
  templateUrl: './recipe-set-rule.component.html'
})
export class RecipeSetRuleComponent {

  @HostBinding('class.pb-ui-part-sub')
  public readonly pbUiPartSub = true;

}
