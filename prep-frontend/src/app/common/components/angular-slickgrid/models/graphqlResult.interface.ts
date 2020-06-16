import { Metrics } from './metrics.interface';
import { Statistic } from './statistic.interface';

export interface GraphqlResult {
  data: {
    [datasetName: string]: any[];
  };

  /** Some metrics of the last executed query (startTime, endTime, executionTime, itemCount, totalItemCount) */
  metrics?: Metrics;

  /** @deprecated please use "metrics" instead */
  statistics?: Statistic;
}
