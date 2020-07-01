import {Component, EventEmitter, HostBinding, Output} from '@angular/core';

@Component({
  selector: 'div[recipe-rule-edit]',
  templateUrl: './recipe-rule-edit.component.html',
})
export class RecipeRuleEditComponent {

  @HostBinding('class.pb-box-ruleedit')
  public readonly pbBoxRuleedit = true;

  @Output()
  public readonly onClose = new EventEmitter();

}
