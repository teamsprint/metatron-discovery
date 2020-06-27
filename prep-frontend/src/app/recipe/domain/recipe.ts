/* tslint:disable */
import {AbstractHistory} from '../../common/domain/abstract-history-entity';
import {PageResult} from '../../common/constants/page';
import {Connection} from '../../connection/domains/connection';
import {Dataset} from '../../dataset/domains/dataset';

export namespace Recipe {

  export class Entity extends AbstractHistory.Entity {
    recipeId: string;
    name: string;
    description: string;
    custom: string;
    creatorDfId: string;
    creatorDsId: string;
    recipeRules: RecipeRule[];
  }

  export class Select extends Entity {
    gridResponse: any;
  }

  export class RecipeRule {
    ruleNo: number;
    ruleString: string;
    is_valid: boolean;
    uiContext: string;
    shortRuleString: string;
    custom: string;
  }

}
