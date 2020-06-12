/* tslint:disable */
import {PageResult} from '../../common/constants/page';
import {AbstractHistory} from '../../common/domain/abstract-history-entity';

export namespace Dataflow {

  export class Create {
    dfId: string;
    name: string;
    description: string;
    custom: string;
    dataset: Array<string>;
  }

  export class Select extends AbstractHistory.Entity {
    dfId: string;
    name: string;
    description: string;
    custom: string;
    diagrams: Array<DataflowDiagram.Entity>;
    diagramData: Array<DataflowDiagramResponse>;
    upstreams: Array<Upstream>;
    datasetCount: number;
    recipeCount: number;
  }

  namespace DataflowDiagram {
    export class Entity {

    }

    export enum ObjectType {
      DATASET = 'DATASET',
      RECIPE = 'RECIPE'
    }
  }

  class DataflowDiagramResponse {
    creatorDfId: string;
    creatorDfName: string;
    objId: string;
    objName: string;
    objType: DataflowDiagram.ObjectType;
    createdTime: Date;
  }

  class Upstream {
  }

  export namespace Result {

    export namespace GetDataflows {

      export class Entity {
        page: PageResult;
        _embedded: {
          dataflow: Array<Dataflow.Select>
        };
      }

      export enum Projections {
        FOR_LIST_VIEW = 'forListView'
      }
    }
  }
}
