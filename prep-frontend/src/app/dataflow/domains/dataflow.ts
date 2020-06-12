import {PageResult} from '../../common/constants/page';

export namespace Dataflow {

  export class Entity {

  }

  export enum Projections {
    FOR_LIST_VIEW = 'forListView'
  }

  export namespace Result {
    export class GetDataflows {
      page: PageResult;
      _embedded: {
        dataflow: Array<Dataflow.Entity>
      };
    }
  }
}
