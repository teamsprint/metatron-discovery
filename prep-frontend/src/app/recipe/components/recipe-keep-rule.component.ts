import {Component, HostBinding} from '@angular/core';

@Component({
  selector: 'div[recipe-keep-rule]',
  templateUrl: './recipe-keep-rule.component.html'
})
export class RecipeKeepRuleComponent {

  @HostBinding('class.pb-ui-part-sub')
  public readonly pbUiPartSub = true;

}
