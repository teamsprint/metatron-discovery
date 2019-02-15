/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export namespace Engine {

  export class Constant {
    public static readonly ROUTE_PREFIX = 'management/engine-monitoring/';
  }

  export enum ContentType {
    OVERVIEW = 'overview',
    INGESTION = 'ingestion',
    QUERY = 'query'
  }

  export type MonitoringRouterParams = { 'type': Engine.ContentType };

  export class Content {

    constructor(private value: ContentType) {
    }

    public toString() {
      return this.value;
    }

    private static readonly overview = new Content(ContentType.OVERVIEW);
    private static readonly ingestion = new Content(ContentType.INGESTION);
    private static readonly query = new Content(ContentType.QUERY);

    public isOverview() {
      return this.value === Content.overview.toString();
    }

    public isIngestion() {
      return this.value === Content.ingestion.toString();
    }

    public isQuery() {
      return this.value === Content.query.toString();
    }
  }

}
