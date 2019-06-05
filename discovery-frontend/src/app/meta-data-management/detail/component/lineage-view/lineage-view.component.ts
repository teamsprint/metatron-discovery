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

import {Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output, ViewChild, ViewChildren} from '@angular/core';
import * as _ from 'lodash';
import {AbstractComponent} from '../../../../common/component/abstract.component';
import {InputComponent} from '../../../../common/component/input/input.component';
import {LineageViewService} from '../../service/lineage-view.service';
import {MetadataService} from '../../../metadata/service/metadata.service';
import {MetadataModelService} from '../../../metadata/service/metadata.model.service';
import {Alert} from '../../../../common/util/alert.util';
import {Metadata} from '../../../../domain/meta-data-management/metadata';

declare let echarts;

@Component({
  selector: 'app-metadata-detail-lineageview',
  templateUrl: './lineage-view.component.html'
})
export class LineageViewComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild('metadataName')
  private metadataName: ElementRef;

  // 차트 기본 옵션
  private chartOptions: any;

  // 루트 데이터셋 개수
  private rootCount: number = 0;

  // depth 개수
  private depthCount: number = 0;

  // 노드 리스트
  private chartNodes: any[] = [];

  // 노드간 링크 리스트
  private chartLinks: any[] = [];

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // echart instance
  public chart: any;

  public lineageNodes: any = [];
  public lineageEdges: any = [];

  @Input()
  public isNameEdit: boolean;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(
    protected element: ElementRef,
    protected lineageViewService: LineageViewService,
    protected metadataService: MetadataService,
    public metadataModelService: MetadataModelService,
    protected injector: Injector) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    // Init
    super.ngOnInit();

    this._initialiseChartValues();

    this.setRandomLineageNode();
    /*
    this.getLineageNodes();
    this.getLineageEdges();
    */
  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public drawChart() {

    this.initChart();
  }

  /**
   * Set a lineage node for testing
   */
  public setRandomLineageNode() {
    let forward_node : any = {
      'systemName': 'system_'+ Math.floor((Math.random() * 1000) + 1),
      'tableName': 'table_'+ Math.floor((Math.random() * 1000) + 1),
      'columnName': 'column_'+ Math.floor((Math.random() * 1000) + 1),
      'name': 'node_'+ Math.floor((Math.random() * 1000) + 1),
      'description': 'desc',
      'attributes': { 'test1':'test1', 'test2':'test2' },
      'nodeType': 'TABLE'
    };
    let middle_node : any = {
      'systemName': 'system_'+ Math.floor((Math.random() * 1000) + 1),
      'tableName': 'table_'+ Math.floor((Math.random() * 1000) + 1),
      'columnName': 'column_'+ Math.floor((Math.random() * 1000) + 1),
      'name': 'node_'+ Math.floor((Math.random() * 1000) + 1),
      'description': 'desc',
      'attributes': { 'test1':'test1', 'test2':'test2' },
      'nodeType': 'TABLE'
    };
    let toward_node : any = {
      'systemName': 'system_'+ Math.floor((Math.random() * 1000) + 1),
      'tableName': 'table_'+ Math.floor((Math.random() * 1000) + 1),
      'columnName': 'column_'+ Math.floor((Math.random() * 1000) + 1),
      'name': 'node_'+ Math.floor((Math.random() * 1000) + 1),
      'description': 'desc',
      'attributes': { 'test1':'test1', 'test2':'test2' },
      'nodeType': 'TABLE'
    };

    let params : any = [ forward_node, middle_node, toward_node ];
    this.lineageViewService.postLineageNode(params).then((result) => {
      if (result) {
        this.lineageNodes = result;

        let lineage_edges : any = [ {
          'forwardSystemName' : result[0].systemName,
          'forwardTableName' : result[0].tableName,
          'forwardColumnName' : result[0].columnName,
          'towardSystemName' : result[1].systemName,
          'towardTableName' : result[1].tableName,
          'towardColumnName' : result[1].columnName,
          'attributes' : ''
        }, {
          'forwardSystemName' : result[1].systemName,
          'forwardTableName' : result[1].tableName,
          'forwardColumnName' : result[1].columnName,
          'towardSystemName' : result[2].systemName,
          'towardTableName' : result[2].tableName,
          'towardColumnName' : result[2].columnName,
          'attributes' : ''
        } ];
        lineage_edges.map(lineage_edge =>
          this.lineageViewService.postLineageEdge(lineage_edge).then((result) => {
            if (result) {
              this.lineageEdges.push(result);
              this.drawChart();
            }
          }).catch((error) => {
            console.error(error);
          })
        );
      } else {
        this.lineageNodes = [];
      }
    }).catch((error) => {
      console.error(error);
    });
  } // function - setRandomLineageNode

  /**
   * Get lineage nodes
   */
  public getLineageNodes() {
    this.lineageViewService.getLineageNodes().then((result) => {
      if (result) {
        this.lineageNodes = result;
      } else {
        this.lineageNodes = [];
      }
    }).catch((error) => {
      console.error(error);
    });
  } // function - getLineageNodes

  /**
   * Get lineage edges
   */
  public getLineageEdges() {
    this.lineageViewService.getLineageEdges().then((result) => {
      if (result) {
        this.lineageEdges = result;
      } else {
        this.lineageEdges = [];
      }
    }).catch((error) => {
      console.error(error);
    });
  } // function - getLineageEdges

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  private setNodeCategory(node, option, seriesIndex) {
    if(node.category===undefined) {
      node.category = 0;
    } else {
      node.category = (node.category+1)%2;
    }

    // BUG of echart: categories.symbol doesn't work
    // This problem has been fixed and will be released in echart 4.3.0.
    if(undefined!==option.series[seriesIndex].categories[node.category].symbol) {
      node.symbol = option.series[seriesIndex].categories[node.category].symbol;
    }
    if(undefined!==option.series[seriesIndex].categories[node.category].symbolSize) {
      node.symbolSize = option.series[seriesIndex].categories[node.category].symbolSize;
    }
  }

  /**
   * 차트 초기화
   */
  private initChart() {

    this.chart = echarts.init(this.$element.find('#chartCanvas')[0]);
    this.chart.clear();

    this.chartNodes = [];
    this.chartLinks = [];
    this.depthCount = 0;
    this.rootCount = 0;

    this.chart.off('click');
    this.chart.on('click', (params) => {
      if(params===null) { return; }
      if(params.componentType!=='series') { return; }

      //console.log(params.dataType +'_'+ params.dataIndex +' is clicked');

      if( params.dataType==='node' ) {
        const option = this.chart.getOption();
        option.series[params.seriesIndex].nodes.map((node, idx) => {
          if(idx===params.dataIndex) {
            this.setNodeCategory(node, option, params.seriesIndex);
          }
        });
        this.chart.setOption(option);
      }
    });

    this.chartNodes = this.lineageNodes.map((node,idx) => {
      node.name = node.systemName +':'+ node.tableName +':'+ node.columnName;
      node.x = idx*50;
      node.y = idx*50;
      node.value = [idx,0];

      node.category = 0;
      this.setNodeCategory(node, this.chartOptions, 0);

      return node;
    });

    this.chartLinks = this.lineageEdges.map(edge => {
      let source : string = edge.forwardSystemName +':'+ edge.forwardTableName +':'+ edge.forwardColumnName;
      let target : string = edge.towardSystemName +':'+ edge.towardTableName +':'+ edge.towardColumnName;
      let link : any = {
        'source': source,
        'target': target,
      };
      return link;
    });

    this.chartOptions.series[0].nodes = this.chartNodes;
    this.chartOptions.series[0].links = this.chartLinks;

    this.chart.setOption(this.chartOptions);
    this.chartAreaResize(true);

    let $chart = this;

    $(window).off('resize');
    $(window).on('resize', function (event) {
      $chart.chartAreaResize(true);
    });
  } // function - initChart

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Initialise chart values and options
   * @private
   */
  private _initialiseChartValues() {

    this.chartOptions = {
      backgroundColor: '#ffffff',
      roam: true,
      nodeScaleRatio: 0.6,
      tooltip: { show: true },
      xAxis: {
        type: 'value',
        max: null,
        interval: 1,
        splitLine: { show: false },
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        max: null,
        interval: 1,
        inverse: true,
        splitLine: { show: false },
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      graphic: {
        type: 'text',
        position: [1,1],
        left:100,
        right:100,
        width: 100,
        height: 100,
        draggable: true,
        style: {
          text: 'aaaaaaaaaaaaa',
          lineWidth: 1
        }
      },
      series: [
        {
          type: 'graph',
          legendHoverLink: false,
          layout: 'none',
          coordinateSystem: 'cartesian2d',
          focusNodeAdjacency: false,
          hoverAnimation: true,
          roam: false,
          draggable: true,
          itemStyle: {
            color: '#acacac',
            borderColor: '#1af'
          },
          categories: [
            {
              name: 'cat1',
              symbol: 'rect',
              symbolSize: [100,300],
              symbolKeepAspect: false,
              symbolOffset: [0, 0],
              label: {
                show: true,
                color: '#000',
                formatter: [
                  '{red|{b}}',
                  '{large|{c}}',
                  '<div id=test_1>test</div>'
                ].join('\n'),
                rich: {
                  red: {
                    color: 'red',
                    lineHeight: 10
                  },
                  large: {
                    color: 'blue',
                    fontSize: 18,
                    fontFamily: 'Microsoft YaHei',
                    borderColor: '#449933',
                    borderRadius: 4
                  }
                }
              },
            }, {
              name: 'cat2',
              symbol: 'circle',
              symbolSize: 150,
              label: {
                show: true,
                color: '#000',
                formatter: '{b}<br />{c}@@@@@'
              }
            },
          ],
          edgeLabel: {
            show: true,
            color: '#000',
            formatter: (params) => {
              return 'aaa';
            }
          },
          tooltip: {
            formatter: '{b0}: AAAAA<br />{b1}: {c1}'
          },
          nodes: null,
          links: null,
          lineStyle: { normal: { opacity: 1, width: 0.5 } },
          edgeSymbol: ['circle', 'arrow'],
          edgeSymbolSize: 10,
          left: 'center',
          top: 'middle',
          right: 'auto',
          bottom: 'auto',
          width: 'auto',
          height: 'auto'
        },
      ],
      color: ['#c23531','#2f4554', '#61a0a8', '#d48265', '#91c7ae','#749f83', '#ca8622', '#bda29a','#6e7074', '#546570', '#c4ccd3'],
      textStyle: {
        color: '#fff',
        fontSize: 12
      },
      animation: false
    };

  }

  private chartAreaResize(resizeCall?:boolean): void {
  /*
    if(resizeCall == undefined) resizeCall = false;
    const hScrollbarWith: number = 30;
    let minHeightSize: number = this.lineageNodes.length < 5 ? 500 : this.lineageNodes.length * 100;
    let fixHeight: number = minHeightSize;
    const minWidthSize: number = $('.ddp-wrap-flow2').width()- hScrollbarWith;
    $('.ddp-lineage-view').css('overflow-x', 'hidden');
    $('#chartCanvas').css('height', fixHeight+'px').css('width', minWidthSize+'px').css('overflow', 'hidden');
    if($('#chartCanvas').children()!=null && $('#chartCanvas').children()!=undefined){
      $('#chartCanvas').children().css('height', fixHeight+'px').css('width', minWidthSize+'px');}
    if($('#chartCanvas').children().children()!=null && $('#chartCanvas').children().children()!=undefined) {
      $('#chartCanvas').children().children().css('height', fixHeight+'px').css('width', minWidthSize+'px');}
    $('#chartCanvas div:last-child').css('height', '');
    $('#chartCanvas div:last-child').css('width', '');
    if (resizeCall == true && this.chart != null) {this.chart.resize();}
    */
  }
}

