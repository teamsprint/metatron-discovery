import {Component, HostBinding} from '@angular/core';

@Component({
  selector: 'div[recipe-settype-rule]',
  templateUrl: './recipe-settype-rule.component.html'
})
export class RecipeSettypeRuleComponent {

  @HostBinding('class.pb-ui-part-sub')
  public readonly pbUiPartSub = true;

}
