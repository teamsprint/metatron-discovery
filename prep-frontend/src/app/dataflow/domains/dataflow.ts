import {PageResult} from '../../common/constants/page';
import {UserProfile} from '../../user/domains/user';

export namespace Dataflow {

  export namespace ValueObjects {
    export class Create {
      dfId: string;
      name: string;
      description: string;
      custom: string;
      dataset: Array<string>;
    }

    export class Select {
      dfId: string;
      name: string;
      description: string;
      custom: string;

      // TODO: 무시. 화면에서 사용 불필요
      // diagrams: Array<DataflowDiagram.Entity>;

      diagramData: Array<DataflowDiagramResponse>;
      upstreams: Array<Upstream>;
      datasetCount: number;
      recipeCount: number;

      createdTime: Date;
      modifiedTime: Date;
      createdBy: UserProfile;
      modifiedBy: UserProfile;
    }
  }

  export namespace DataflowDiagram {
    export class Entity {
      // orderNo: number;
      // dataflow: Dataflow;
      // dataset: Dataset;
      // recipe: Recipe;
      // objType: DataflowDiagram.ObjectType;
    }

    export enum ObjectType {
      DATASET = 'DATASET',
      RECIPE = 'RECIPE'
    }
  }

  export class DataflowDiagramResponse {
    creatorDfId: string;
    creatorDfName: string;
    objId: string;
    objName: string;
    objType: DataflowDiagram.ObjectType;
    createdTime: Date;
  }

  export class Upstream {
    dfId: string;
    upstreamDsId: string;
    reId: string;
  }

  export class PrepParamDatasetIdList {
    dsIds: Array<string>;
    forSwap: boolean;
  }

  export namespace Result {

    export namespace GetDataflows {

      export class Entity {
        page: PageResult;
        '_embedded': {
          dataflow: Array<Dataflow.ValueObjects.Select>
        };
      }

      export enum Projections {
        FOR_LIST_VIEW = 'forListView'
      }
    }
  }
}
