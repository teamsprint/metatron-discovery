import {Component, HostBinding} from '@angular/core';

@Component({
  selector: 'div[recipe-extract-rule]',
  templateUrl: './recipe-extract-rule.component.html'
})
export class RecipeExtractRuleComponent {

  @HostBinding('class.pb-ui-part-sub')
  public readonly pbUiPartSub = true;

}
