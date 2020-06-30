import {AbstractHistory} from '../../common/domain/abstract-history-entity';
import * as _ from 'lodash';

export namespace Recipe {

  export class Entity extends AbstractHistory.Entity {
    recipeId: string;
    name: string;
    creatorDfId: string;
    creatorDsId: string;
    recipeRules: RecipeRule[];
    ruleCurIdx: number;
    totalLines: number;
    description: string;
    custom: string;
    gridResponse: GridResponse;
  }

  export class GridResponse {
    colCnt: number;
    colNames: string[];
    colDescs: ColDesc[];
    colHists: Array<object>;
    rows: Row[];
    mapColno: { [ key: string ]: number };
    newColNames: Array<object>;
    interestedColNames: Array<object>;
    dsName: string;
    slaveDsNameMap: SlaveDsNameMap;
    ruleString: string;
    jsonRuleString: string;
    valid: boolean;

    static getColNamesCount(gridResponse: GridResponse) {
      if (!gridResponse) {
        return 0;
      }

      if (!gridResponse.colNames) {
        return 0;
      }

      return gridResponse.colNames.length;
    }

    static getColDescsDistinctCount(gridResponse: GridResponse) {

      if (!gridResponse) {
        return 0;
      }

      if (!gridResponse.colDescs) {
        return 0;
      }

      return _.uniq(
        gridResponse.colDescs
          .filter(v => v.type)
          .map(v => v.type)
      ).length;
    }
  }

  export class Select extends Entity {
    gridResponse: GridResponse;
    manualColumnCount: number;
    totalLines: number;
    totalBytes: number;
  }

  export class ColDesc {
    type: Type;
  }

  export enum Type {
    String = 'STRING',
  }

  export class Row {
    objCols: string[];
  }

  export class SlaveDsNameMap {
  }

  // TODO: 확인 필요
  // TODO: 레시피 단 건 조회 기준
  // TODO: 아래 다시 정의
  // export class RecipeRule {
  //   ruleNo: number;
  //   ruleString: string;
  //   tslint:disable-next-line:variable-name
  //   is_valid: boolean;
  //   uiContext: string;
  //   shortRuleString: string;
  //   custom: string;
  // }

  export class RecipeRule {
    ruleNo: number;
    ruleString: string;
    uiContext: string;
    shortRuleString: string;
    valid: boolean;
  }
}
