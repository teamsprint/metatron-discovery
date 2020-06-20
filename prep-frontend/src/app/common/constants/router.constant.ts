export namespace RouterUrls {

  export class Prepbot {
    public static readonly ROOT = '';
  }

  export class Managements {

    public static readonly ROOT = 'management';
    public static readonly PREP_BOT = 'prepbot';
    public static readonly CONNECTION = 'connections';
    public static readonly FLOWS = 'dataflows';
    public static readonly DATASETS = 'datasets';
    public static readonly RECIPES = 'recipes';

    public static getMainUrl() {
      return `/${Managements.ROOT}/${Managements.PREP_BOT}`;
    }

    public static getConnectionsUrl() {
      return `/${Managements.ROOT}/${Managements.PREP_BOT}/${Managements.CONNECTION}`;
    }

    public static getSetsUrl() {
      return `/${Managements.ROOT}/${Managements.PREP_BOT}/${Managements.DATASETS}`;
    }
    public static getSetDetailUrl(id: string) {
      return `/${Managements.ROOT}/${Managements.PREP_BOT}/${Managements.DATASETS}/${id}`;
    }

    public static getFlowsUrl() {
      return `/${Managements.ROOT}/${Managements.PREP_BOT}/${Managements.FLOWS}`;
    }

    public static getFlowDetailUrl(id: string) {
      return `/${Managements.ROOT}/${Managements.PREP_BOT}/${Managements.FLOWS}/${id}`;
    }
  }
}
