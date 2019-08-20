/*
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AbstractComponent} from '../../../common/component/abstract.component';
import {DatasourceService} from '../../../datasource/service/datasource.service';
import {EngineService} from "../../service/engine.service";

declare let echarts: any;
declare let $: any;

@Component({
  selector: '[overview-graph-view]',
  templateUrl: './graph.component.html'
})
export class GraphComponent extends AbstractComponent implements OnInit, OnDestroy {

  @ViewChild('gcCPU') private _gcCpuChartElmRef: ElementRef;
  @ViewChild('usageMemory') private _usageMemoryChartElmRef: ElementRef;
  @ViewChild('gcCount') private _gcCountChartElmRef: ElementRef;
  @ViewChild('avgQueryTime') private _avgQueryTimeChartElmRef: ElementRef;

  public gcCpu:string = '';
  public heapMemory:string = '';
  public queryCount:number = 0;
  public runningTaskCount:number = 0;

  constructor(private _datasourceSvc: DatasourceService,
              private _engineSvc: EngineService,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  public ngOnInit() {
    super.ngOnInit();
    this._getGcCPU();
    this._getUsageMemory();
    this._getGcCount();
    this._getAvgQueryTime();
    this._getQueryCount();
    this._getRunningTasks();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /**
   * get GC CPU
   * @private
   */
  private _getGcCPU() {
    const queryParam: any =
      {
        dataSource: {
          joins: [],
          temporary: false,
          name: 'druid-metric-topic',
          type: 'default',
          connType: 'ENGINE'
        },
        filters: [
          {
            selector: 'SINGLE_COMBO',
            type: 'include',
            field: 'metric',
            valueList: ['jvm/gc/cpu'],
            dataSource: 'druid-metric-topic'
          }
        ],
        pivot: {
          columns: [],
          rows: [],
          aggregations: [
            {
              type: 'measure',
              aggregationType: 'AVG',
              name: 'value',
              subType: 'LONG',
              subRole: 'MEASURE',
              format: {
                isAll: true,
                type: 'percent',
                sign: 'KRW',
                decimal: 0,
                useThousandsSep: true,
                customSymbol: null,
                abbr: 'NONE'
              },
              aggregationTypeList: [],
              alias: 'AVG(value)'
            },
            {
              type: 'dimension',
              name: 'gcGen',
              subType: 'UNKNOWN',
              subRole: 'DIMENSION',
              alias: 'gcGen'
            }
          ]
        },
        limits: {
          limit: 1000,
          sort: []
        },
        resultFormat: {
          type: 'chart',
          mode: 'pie',
          options: {
            addMinMax: true,
            showCategory: true,
            showPercentage: true
          },
          columnDelimeter: '―'
        }
      };

    this._datasourceSvc.searchQuery(queryParam).then((data) => {
      const seriesData = data.columns[0].value.map( item => {
        ( 'young' === item.name ) && ( this.gcCpu = item.percentage.toFixed(0) + '%' );
        return {
          name: item.name,
          value: item.value,
          percentage: item.percentage,
          itemStyle:{
            normal:{ color: 'young' === item.name ? '#f0f4ff' : '#4762a8' }
          }
        };
      });
      const chartOpts: any = {
        type: 'pie',
        series: [
          {
            type: 'pie',
            name: 'AVG(value)',
            radius: ['60%', '68%'],
            center: ['50%', '55%'],
            data: seriesData,
            hoverAnimation: false
          }
        ],
        label: { normal: { show: false } }
      };
      const chartObj = echarts.init(this._gcCpuChartElmRef.nativeElement, 'exntu');
      chartObj.setOption(chartOpts, false);
    });
  } // function - _getGcCPU

  /**
   * get Usage Memory
   * @private
   */
  private _getUsageMemory() {
    const queryParam: any =
      {
        dataSource: {
          joins: [],
          temporary: false,
          name: 'druid-metric-topic',
          type: 'default',
          connType: 'ENGINE'
        },
        filters: [
          {
            selector: 'SINGLE_COMBO',
            type: 'include',
            field: 'metric',
            valueList: ['jvm/mem/used'],
            dataSource: 'druid-metric-topic'
          }
        ],
        pivot: {
          columns: [],
          rows: [],
          aggregations: [
            {
              type: 'measure',
              aggregationType: 'SUM',
              name: 'value',
              subType: 'LONG',
              subRole: 'MEASURE',
              format: {
                isAll: true,
                type: 'percent',
                sign: 'KRW',
                decimal: 0,
                useThousandsSep: true,
                abbr: 'NONE'
              },
              aggregationTypeList: [],
              alias: 'SUM(value)'
            },
            {
              type: 'dimension',
              name: 'memKind',
              subType: 'UNKNOWN',
              subRole: 'DIMENSION',
              alias: 'memKind'
            }
          ]
        },
        limits: {
          limit: 1000,
          sort: []
        },
        resultFormat: {
          type: 'chart',
          mode: 'pie',
          options: {
            addMinMax: true,
            showCategory: true,
            showPercentage: true
          },
          columnDelimeter: '―'
        }
      };

    this._datasourceSvc.searchQuery(queryParam).then((data) => {
      console.info(data);
      const seriesData = data.columns[0].value.map( item => {
        ( 'heap' === item.name ) && ( this.heapMemory = item.percentage.toFixed(0) + '%' );
        return {
          name: item.name,
          value: item.value,
          percentage: item.percentage,
          itemStyle:{
            normal:{ color: 'heap' === item.name ? '#f0f4ff' : '#314673' }
          }
        };
      });
      const chartOpts: any = {
        'type': 'pie',
        'legend': {
          'show': false,
          'seriesSync': false,
          'left': 'left',
          'symbol': 'circle',
          'width': '100%',
          'itemGap': 20,
          'pageItems': 5,
          'textStyle': {
            'fontSize': 13,
            'fontFamily': 'SpoqaHanSans'
          }
        },
        'series': [
          {
            'type': 'pie',
            'name': 'AVG(value)',
            'radius': ['60%', '68%'],
            'center': ['50%', '55%'],
            'data': seriesData,
            'hoverAnimation': false
          }
        ],
        'label': { 'normal': { 'show': false } }
      };
      const chartObj = echarts.init(this._usageMemoryChartElmRef.nativeElement, 'exntu');
      chartObj.setOption(chartOpts, false);
    });
  } // function - _getUsageMemory

  /**
   * get Gc Count
   * @private
   */
  private _getGcCount() {
    const queryParam: any =
      {
        dataSource: {
          joins: [],
          temporary: false,
          name: 'druid-metric-topic',
          type: 'default',
          connType: 'ENGINE'
        },
        filters: [
          {
            selector: 'SINGLE_COMBO',
            type: 'include',
            field: 'metric',
            valueList: ['jvm/gc/count'],
            dataSource: 'druid-metric-topic'
          }
        ],
        pivot: {
          columns: [
            {
              type: 'timestamp',
              name: 'event_time',
              subType: 'TIMESTAMP',
              subRole: 'TIMESTAMP',
              format: {
                'type': 'time_continuous',
                'discontinuous': false,
                'unit': 'SECOND',
                'timeZone': 'Asia/Seoul',
                'locale': 'en'
              },
              alias: 'SECOND(event_time)'
            }
          ],
          rows: [],
          aggregations: [
            {
              type: 'measure',
              aggregationType: 'COUNT',
              name: 'value',
              subType: 'LONG',
              subRole: 'MEASURE',
              format: {
                isAll: true,
                type: 'number',
                sign: 'KRW',
                decimal: 0,
                useThousandsSep: true,
                abbr: 'NONE'
              },
              aggregationTypeList: [],
              alias: 'COUNT(value)'
            }
          ]
        },
        limits: {
          limit: 1000,
          sort: []
        },
        resultFormat: {
          type: 'chart',
          mode: 'line',
          options: {
            addMinMax: true,
            showCategory: true,
            showPercentage: true,
            isCumulative: false
          },
          columnDelimeter: '―'
        }
      };

    this._datasourceSvc.searchQuery(queryParam).then((data) => {
      console.info(data);
      const chartOps: any = {
        'type': 'line',
        'grid': [
          {
            'top': 0,
            'bottom': 0,
            'left': 0,
            'right': 0
          }
        ],
        'xAxis': [
          {
            'type': 'category',
            'show': false,
            'data': data.rows,
            'name': 'SECOND(event_time)',
            'axisName': 'SECOND(event_time)'
          }
        ],
        'yAxis': [
          {
            'type': 'value',
            'show': false,
            'name': 'AVG(value)',
            'axisName': 'AVG(value)'
          }
        ],
        'series': [
          {
            'type': 'line',
            'name': 'AVG(value)',
            'data': data.columns[0].value,
            'connectNulls': true,
            'showAllSymbol': true,
            'symbol': 'none',
            'sampling': 'max',
            'itemStyle': {
              'normal': {
                'color': '#72d9a7'
              }
            },
            'smooth': true
          }
        ]
      };
      const chartobj = echarts.init(this._gcCountChartElmRef.nativeElement, 'exntu');
      chartobj.setOption(chartOps, false);
    });
  } // function - _getGcCount

  /**
   * get Avg Query Time
   * @private
   */
  private _getAvgQueryTime() {
    const queryParam: any =
      {
        dataSource: {
          joins: [],
          temporary: false,
          name: 'druid-metric-topic',
          type: 'default',
          connType: 'ENGINE'
        },
        filters: [
          {
            selector: 'SINGLE_COMBO',
            type: 'include',
            field: 'metric',
            valueList: ['query/time'],
            dataSource: 'druid-metric-topic'
          }
        ],
        pivot: {
          columns: [
            {
              type: 'timestamp',
              name: 'event_time',
              subType: 'TIMESTAMP',
              subRole: 'TIMESTAMP',
              format: {
                'type': 'time_continuous',
                'discontinuous': false,
                'unit': 'SECOND',
                'timeZone': 'Asia/Seoul',
                'locale': 'en'
              },
              alias: 'SECOND(event_time)'
            }
          ],
          rows: [],
          aggregations: [
            {
              type: 'measure',
              aggregationType: 'AVG',
              name: 'value',
              subType: 'LONG',
              subRole: 'MEASURE',
              format: {
                isAll: true,
                type: 'number',
                sign: 'KRW',
                decimal: 0,
                useThousandsSep: true,
                abbr: 'NONE'
              },
              aggregationTypeList: [],
              alias: 'AVG(value)'
            }
          ]
        },
        limits: {
          limit: 1000,
          sort: []
        },
        resultFormat: {
          type: 'chart',
          mode: 'line',
          options: {
            addMinMax: true,
            showCategory: true,
            showPercentage: true,
            isCumulative: false
          },
          columnDelimeter: '―'
        }
      };

    this._datasourceSvc.searchQuery(queryParam).then((data) => {
      console.info(data);
      const chartOps: any = {
        'type': 'line',
        'grid': [
          {
            'top': 0,
            'bottom': 0,
            'left': 0,
            'right': 0
          }
        ],
        'xAxis': [
          {
            'type': 'category',
            'show': false,
            'data': data.rows,
            'name': 'SECOND(event_time)',
            'axisName': 'SECOND(event_time)'
          }
        ],
        'yAxis': [
          {
            'type': 'value',
            'show': false,
            'name': 'AVG(value)',
            'axisName': 'AVG(value)'
          }
        ],
        'series': [
          {
            'type': 'line',
            'name': 'AVG(value)',
            'data': data.columns[0].value,
            'connectNulls': true,
            'showAllSymbol': true,
            'symbol': 'none',
            'sampling': 'max',
            'itemStyle': {
              'normal': {
                'color': '#2eaaaf'
              }
            },
            'smooth': true
          }
        ]
      };
      const chartobj = echarts.init(this._avgQueryTimeChartElmRef.nativeElement, 'exntu');
      chartobj.setOption(chartOps, false);
    });
  } // function - _getAvgQueryTime

  /**
   * get Query Count
   * @private
   */
  private _getQueryCount() {
    const queryParam: any =
      {
        dataSource: {
          joins: [],
          temporary: false,
          name: 'druid-metric-topic',
          type: 'default',
          connType: 'ENGINE'
        },
        filters: [
          {
            selector: 'SINGLE_COMBO',
            type: 'include',
            field: 'metric',
            valueList: ['query/time'],
            dataSource: 'druid-metric-topic'
          }
        ],
        pivot: {
          columns: [],
          rows: [],
          aggregations: [
            {
              type: 'measure',
              aggregationType: 'COUNT',
              name: 'value',
              subType: 'LONG',
              subRole: 'MEASURE',
              format: {
                isAll: true,
                type: 'number',
                sign: 'KRW',
                decimal: 2,
                useThousandsSep: true,
                abbr: 'NONE'
              },
              aggregationTypeList: [],
              alias: 'COUNT(value)'
            }
          ]
        },
        limits: {
          limit: 1000,
          sort: []
        },
        resultFormat: {
          type: 'chart',
          mode: 'label',
          options: {
            addMinMax: true,
            showCategory: true,
            showPercentage: true
          },
          columnDelimeter: '―'
        }
      };

    this._datasourceSvc.searchQuery(queryParam).then((data) => {
      this.queryCount = data.columns[0].value[0];
      console.info('>>>>>> queryCount', data);
    });
  } // function - _getQueryCount

  /**
   * get Running Tasks
   * @private
   */
  private _getRunningTasks() {
    this._engineSvc.getRunningTasks().then( result => {
      if( result ) {
        this.runningTaskCount = result.length;
      }
    });
  } // function - _getRunningTasks
}
