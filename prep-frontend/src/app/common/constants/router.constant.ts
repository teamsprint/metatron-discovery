export namespace RouterUrls {

  export class Prepbot {
    public static readonly ROOT = '';
  }

  export class Managements {

    public static readonly ROOT = 'management';
    public static readonly PREP_BOT = 'prepbot';
    public static readonly FLOWS = 'dataflows';
    public static readonly DATASET = 'datasets';

    public static getMainUrl() {
      return `/${Managements.ROOT}/${Managements.PREP_BOT}`;
    }

    public static getFlowsUrl() {
      return `/${Managements.ROOT}/${Managements.PREP_BOT}/${Managements.FLOWS}`;
    }

    public static getFlowDetailUrl(id: string) {
      return `/${Managements.ROOT}/${Managements.PREP_BOT}/${Managements.FLOWS}/${id}`;
    }
  }
}
