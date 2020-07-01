import {Component, HostBinding} from '@angular/core';

@Component({
  selector: 'div[recipe-drop-rule]',
  templateUrl: './recipe-drop-rule.component.html'
})
export class RecipeDropRuleComponent {

  @HostBinding('class.pb-ui-part-sub')
  public readonly pbUiPartSub = true;

}
