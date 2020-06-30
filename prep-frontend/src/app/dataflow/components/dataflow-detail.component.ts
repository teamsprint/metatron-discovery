/* tslint:disable */
import {Component, OnDestroy, OnInit, ChangeDetectorRef, Injector, ViewChild, ElementRef} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {RouterUrls} from '../../common/constants/router.constant';
import {DataflowService} from '../services/dataflow.service';
import {DatasetsService} from '../../dataset/services/datasets.service';
import {RecipeService} from '../../recipe/services/recipe.service';
import {LoadingService} from '../../common/services/loading/loading.service';
import {finalize} from 'rxjs/operators';
import {Dataflow} from '../domains/dataflow';
import {Dataset} from '../../dataset/domains/dataset';
import {Recipe} from '../../recipe/domain/recipe';
import {LnbComponent} from '../../lnb/components/lnb.component';
import {NGXLogger} from 'ngx-logger';
import * as _ from 'lodash';
import * as $ from 'jquery';
import interact from 'interactjs';
import {AngularGridInstance, Column, FieldType, GridOption, SelectedRange} from 'angular-slickgrid';
import {Alert} from '../../common/utils/alert.util';

declare let echarts: any;

@Component({
  templateUrl: './dataflow-detail.component.html',
  styleUrls: ['./dataflow-detail.component.css']
})
export class DataflowDetailComponent implements OnInit, OnDestroy {
  @ViewChild('nameInput', {static: false})
  private nameInput: ElementRef;

  @ViewChild(LnbComponent)
  public lnbComponent: LnbComponent;


  // echart ins
  public chart: any;
  // 현재 컴포넌트 jQuery 객체
  public $element: JQuery;

  public readonly ROUTER_URLS = RouterUrls;
  public readonly LAYER_POPUP = interact('.pb-box-dataflow');
  public expanded: boolean = false;
  public dataflow: Dataflow.ValueObjects.Select;
  private dataflowId: string;
  // 차트를 그리기 위한 기반 데이터
  public dataSetList: any[] = [];
  private upstreamList: Dataflow.Upstream[] = [];

  echartsIntance : any;


  // 루트 데이터셋 개수
  private rootCount: number = 0;

  // depth 개수
  private depthCount: number = 0;

  // 노드 리스트
  private chartNodes: any[] = [];

  // 노드간 링크 리스트
  private chartLinks: any[] = [];

  // 타입별 아이콘 정보
  private symbolInfo: any;

  // 차트 기본 옵션
  private chartOptions: any;

  // 노드 라벨 속성
  private label: any;

  // 룰 리스트에서 필요한 변수
  public ruleList: Command[];
  public commandList: any[];
  public nameTextInputEnable =false;
  public dataflowName: string = '';
  // Change Detect
  public changeDetect: ChangeDetectorRef;
  public roptions = {backgroundColor: '#ffffff',
    tooltip: { show: false },
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
    series: [
      {
        type: 'graph',
        legendHoverLink: false,
        layout: 'none',
        coordinateSystem: 'cartesian2d',
        focusNodeAdjacency: false,
        symbolSize: 50,
        hoverAnimation: true,
        roam: false,
        // edgeSymbol: ['none', 'arrow'],
        draggable: true,
        itemStyle: { normal: { color: '#aaa', borderColor: '#1af' } },
        nodes: null,
        links: null,
        lineStyle: { normal: { opacity: 0.3, width: 4 } }
      }
    ], animation: false
  };
  public options = {
    backgroundColor: '#ffffff',
    tooltip: { show: false },
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
    series: [
      {
        type: 'graph',
        legendHoverLink: false,
        layout: 'none',
        coordinateSystem: 'cartesian2d',
        focusNodeAdjacency: false,
        symbolSize: 50,
        hoverAnimation: true,
        roam: false,
        // edgeSymbol: ['none', 'arrow'],
        draggable: true,
        itemStyle: { normal: { color: '#aaa', borderColor: '#1af' } },
        nodes: null,
        links: null,
        lineStyle: { normal: { opacity: 0.3, width: 4 } }
      }
    ], animation: false
  };


  constructor(protected injector: Injector,
              private readonly router: Router,
              private activatedRoute: ActivatedRoute,
              private readonly recipeService: RecipeService,
              private readonly datasetService: DatasetsService,
              private readonly dataflowService: DataflowService,
              private readonly loadingService: LoadingService,
              private readonly logger: NGXLogger) {
    this.changeDetect = injector.get(ChangeDetectorRef);
  }

  private LAYER_POPUP_POS = {x:0, y:0};
  private detailBoxSelectedId: string;
  public detailBoxOpen = false;
  public detailBoxDataset: Dataset.Select = null;
  public detailBoxDatasetName: string = '';
  public detailBoxRecipe: Recipe.Select = null;
  public detailBoxRecipeName: string = '';
  public recipeRulesSize: number = 0;
  public gridEnable = false;
  gridInstance: AngularGridInstance;
  private gridUseRowId: string = 'dataflow_dataset_grid_id';
  gridDatasetOrRecipe: Array<object> = [];
  columnDefinitions: Column[] = [];
  gridOptions: GridOption = {
    autoResize: {
      containerId: 'dataflow-datasetOrrecipe-detail-container',
      sidePadding: 10
    },
    rowSelectionOptions: {
      selectActiveRow: false
    },
    rowHeight: 26,
    enableAutoResize: true,
    enableCellNavigation: true,
    showCustomFooter: true,
    enableExcelCopyBuffer: true
  };



  ngOnInit(): void {
    const dragMoveListener = (event) => {
      const target = event.target;
      const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
      const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

      target.style.webkitTransform =
        target.style.transform =
          'translate(' + x + 'px, ' + y + 'px)';

      target.setAttribute('data-x', x);
      target.setAttribute('data-y', y);
      this.LAYER_POPUP_POS.x = x;
      this.LAYER_POPUP_POS.y = y;

    };

    const resizeListener = (event) => {
      const target = event.target;
      let x = (parseFloat(target.getAttribute('data-x')) || 0);
      let y = (parseFloat(target.getAttribute('data-y')) || 0);

      // update the element's style
      target.style.width = event.rect.width + 'px';
      target.style.height = event.rect.height + 'px';

      // translate when resizing from top or left edges
      x += event.deltaRect.left;
      y += event.deltaRect.top;

      target.style.webkitTransform = target.style.transform =
        'translate(' + x + 'px,' + y + 'px)';

      target.setAttribute('data-x', x);
      target.setAttribute('data-y', y);
    };

    this.LAYER_POPUP
      .resizable({
        edges: {
          left: true,
          right: true,
          bottom: true,
          top: true
        },
        listeners: {
          move: resizeListener
        },
        modifiers: [
          interact.modifiers.restrictSize({
            min: { width: 180, height: 200 }
          })
        ],

        inertia: true
      })
      .draggable({
        listeners: {
          move: dragMoveListener
        },
        inertia: true,
        modifiers: [
          interact.modifiers.restrictRect({
            restriction: 'parent',
            endOnly: true
          })
        ]
      });


    this.activatedRoute
      .paramMap
      .subscribe((params) => {
        const dfId = params.get(RouterUrls.Managements.getFlowDetailPathVariableKey());
        if (dfId) {
          this.dataflowId = dfId;
        }
      });

    this.initViewPage();
    this.refreshDataflowData();
  }

  private refreshDataflowData() {
    this.detailBoxReset();
    if (this.dataflowId !== null && this.dataflowId !== undefined) {
      this.getDataflow();
    }
  }

  public onDataflowNameEdit($event) {
    $event.stopPropagation();
    this.nameTextInputEnable = true;
    this.changeDetect.detectChanges();
    this.nameInput.nativeElement.focus();
  }

  public enterDataflowName($event) {
    if (13 === $event.keyCode) {
      this.dataflowNameChange();
    }
  }

  public dataflowNameChange() {
    if(this.dataflowName !== this.dataflow.name) {
      this.updateDataflow();
    }else{
      this.nameTextInputEnable = false;
    }
  }

  private updateDataflow() {
    this.nameTextInputEnable = false;
    this.loadingService.show();
    const dataflowEn: Dataflow.ValueObjects.Create = new Dataflow.ValueObjects.Create;
    dataflowEn.dfId = this.dataflowId;
    dataflowEn.name = this.dataflowName;
    this.dataflowService
      .updateDataflow(this.dataflowId, dataflowEn)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe(dataflow => {
        if (!dataflow) {
          return;
        }
        this.dataflow.name = dataflow['name'];
      });
  }


  private getDataflow() {
    this.loadingService.show();
    this.dataflowService
      .getDataflow(this.dataflowId)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe(dataflows => {
        if (!dataflows) {
          return;
        }
        this.dataflow = dataflows as Dataflow.ValueObjects.Select;
        this.dataflowName = this.dataflow.name;
        this.dataSetList = [];
        this.upstreamList = [];
        if (this.dataflow.diagramData !== null && this.dataflow.upstreams) { // if dataflow has diagramData
          this.makeDataSetList();
        }
      });
  }

  private initViewPage() {
    this.symbolInfo = {
      DATASET: {
        UPLOAD: {
          DEFAULT: 'image://' + window.location.origin + '/assets/images/dataflow/img_db.png',
        },
        DATABASE: {
          DEFAULT: 'image://' + window.location.origin + '/assets/images/dataflow/img_db.png',
        }
      },
      RECIPE: {
        DEFAULT: 'image://' + window.location.origin + '/assets/images/dataflow/img_dataset.png',
      },
      SELECTED: {
        DATASET: 'image://' + window.location.origin + '/assets/images/dataflow/img_db_focus.png',
        RECIPE: 'image://' + window.location.origin + '/assets/images/dataflow/img_dataset_focus.png'
      }
    };

    this.label = {
      normal: {
        show: true,
        position: 'bottom',
        textStyle: { color: '#000000', fontWeight: 'bold' },
        formatter(params) {
          if (params.data.dsName.length > 24) {
            return params.data.dsName.slice(0, 20) + ' ...';
          } else {
            return params.data.dsName;
          }
        }
      },
      emphasis: {
        show: true,
        position: 'bottom',
        textStyle: { color: '#000000', fontWeight: 'bold' },
        formatter(params) {
          return params.data.dsName;
          // if (params.data.dsName.length > 20) {
          //   return params.data.dsName.slice(0, 20) + ' ...';
          // } else {
          //   return params.data.dsName;
          // }
        }
      }
    };
    this.chartOptions = {
      backgroundColor: '#ffffff',
      tooltip: { show: false },
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
      series: [
        {
          type: 'graph',
          legendHoverLink: false,
          layout: 'none',
          coordinateSystem: 'cartesian2d',
          focusNodeAdjacency: false,
          symbolSize: 50,
          hoverAnimation: true,
          roam: false,
          // edgeSymbol: ['none', 'arrow'],
          draggable: true,
          itemStyle: { normal: { color: '#aaa', borderColor: '#1af' } },
          nodes: null,
          links: null,
          lineStyle: { normal: { opacity: 0.3, width: 4 } }
        }
      ], animation: false
    };

    this.commandList = [
      { command: 'create', alias: 'Cr' },
      { command: 'header', alias: 'He' },
      { command: 'keep', alias: 'Ke' },
      { command: 'replace', alias: 'Rp' },
      { command: 'rename', alias: 'Rm' },
      { command: 'set', alias: 'Se' },
      { command: 'settype', alias: 'St' },
      { command: 'countpattern', alias: 'Co' },
      { command: 'split', alias: 'Sp' },
      { command: 'derive', alias: 'Dr' },
      { command: 'delete', alias: 'De' },
      { command: 'drop', alias: 'Dp' },
      { command: 'pivot', alias: 'Pv' },
      { command: 'unpivot', alias: 'Up' },
      { command: 'join', alias: 'Jo' },
      { command: 'extract', alias: 'Ex' },
      { command: 'flatten', alias: 'Fl' },
      { command: 'merge', alias: 'Me' },
      { command: 'nest', alias: 'Ne' },
      { command: 'unnest', alias: 'Un' },
      { command: 'aggregate', alias: 'Ag' },
      { command: 'sort', alias: 'So' },
      { command: 'move', alias: 'Mv' },
      { command: 'union', alias: 'Ui' }
    ];
  }

  private makeDataSetList() {
    this.dataSetList = this.dataflow.diagramData;
    this.upstreamList = this.dataflow.upstreams;
    this.dataflowChartAreaResize();

    // this.logger.info('this.upstreamList', this.upstreamList);

    if (this.dataSetList && 1 < this.dataSetList.length) {
      this.dataSetList.sort(function(left, right) {
        const leftTime = Date.parse(left.createdTime);
        const rightTime = Date.parse(right.createdTime);
        if (NaN == rightTime) {
          return -1;
        } else if (NaN == leftTime) {
          return 1;
        }
        return leftTime < rightTime ? -1 : leftTime > rightTime ? 1 : 0;
      });
    }

    // this.logger.info('this.dataSetList A', this.dataSetList);

    if (this.dataSetList !== null && this.dataSetList.length > 0 ) {
      for (let ds of this.dataSetList) {
        ds.upstreamIds = [];
        for (let upstream of this.upstreamList) {
          if (upstream.recipeId === ds.objId) {
            ds.upstreamIds.push(upstream.upstreamId);
          }
        }
      }

      // this.logger.info('this.dataSetList B', this.dataSetList);
      this.makeChartData();
    }
  }

  private makeChartData() {
    this.chartNodes = [];
    this.chartLinks = [];
    this.depthCount = 0;
    this.rootCount = 0;


    // 최상위 노드 탐색
    this.dataSetList.forEach(item => {
      const rootDataset = this.findRootDataset(item, this.dataSetList);
      if (rootDataset.objId !== item.objId) {
        item.rootDataset = rootDataset;
      }
    });

    this.createNodeTree(this.dataSetList);
    // this.logger.info('this.chartNodes C', this.chartNodes);

    // 중복 제거 - 원래 생성되는 배열을 보존하기 위해서 createNodeTree()는 원형대로 놓아둠
    this.chartNodes = this.chartNodes.filter(function(elem, index, self) {
      for (let dsIdx in self) {
        if (self[ dsIdx ].objId === elem.objId) {
          if (dsIdx === index.toString()) {
            return true;
          }
          break;
        }
      }
      return false;
    });

    this.chartSpacing(this.chartNodes, this.chartLinks);

    // 하위 노드 위치 조정 ( 최상위 노드에 맞춰 정렬되도록 변경 )
    this.chartNodes.forEach(item1 => {
      if (item1.rootValue) {
        const rootDsNode = this.chartNodes.filter(item2 => item2.objId === item1.rootDataset.objId)[0];
        if (item1.value[1] < rootDsNode.value[1]) {
          const itemIdx = this.chartNodes
            .filter(item2 => item2.rootDataset && item2.rootDataset.objId === item1.rootDataset.objId)
            .findIndex(item2 => item2.objId === item1.objId);
          item1.value[1] = rootDsNode.value[1] + itemIdx;
        }
      }
    });


    this.options.xAxis.max = this.depthCount > 5 ? 5 + (this.depthCount - 5) : 5;
    this.options.yAxis.max = this.rootCount > 5 ? 5 + (this.rootCount - 5) : 5;
    this.options.series[0].nodes = this.chartNodes;
    this.options.series[0].links = this.chartLinks;
    if(this.echartsIntance !== null && this.echartsIntance !== undefined) {
      this.echartsIntance.setOption(this.options);
      this.echartsIntance.resize();
    }
  }
  public onChartInit($event) {
    // this.dataflowChartAreaResize();
    this.echartsIntance  = $event;
    if(this.echartsIntance !== null && this.echartsIntance !== undefined) {
      this.echartsIntance.setOption(this.options);
      // this.echartsIntance.resize();
    }
  }

  private dataflowChartAreaResize(): void {
    const itemMinSize: number = 98;
    let minHeightSize: number = 600;
    let fixHeight: number = 600;

    const sizeArray: any[] = [];
    this.dataSetList.forEach(item => {
      if (item.objType === Dataflow.DataflowDiagram.ObjectType.DATASET) {
        const ditem = {};
        ditem['dsId'] = item.objId;
        ditem['recipes'] = [];
        sizeArray.push(ditem);
      }
    });
    this.dataSetList.forEach(item => {
      if (item.objType === Dataflow.DataflowDiagram.ObjectType.RECIPE) {
        sizeArray.forEach(item1 => {
          if (item.dsId === item1.parentId) {item1.recipes.push(item.objId);}
        });
      }
    });

    let itemcount = 0;
    sizeArray.forEach(item => {
      if (item.recipes.length === 0) {
        itemcount++;
      }else{
        itemcount = itemcount + item.recipes.length;
      }
    });
    this.logger.info('itemcount', itemcount);
    fixHeight = itemcount * itemMinSize;
    if (fixHeight < minHeightSize) {
      fixHeight = minHeightSize;
    }

    if ($('.pb-ui-graph-p') !== null && $('.pb-ui-graph-p') !== undefined) {
      if ($('.pb-ui-graph-p').height() < fixHeight) {
        $('.pb-ui-graph-p').css('overflow', 'auto');
      } else {
        $('.pb-ui-graph-p').css('overflow', 'hidden');
      }
    }
    this.logger.info('pb-ui-graph-c', $('.pb-ui-graph-p').height());
    $('.pb-ui-graph-c').css('height', fixHeight+'px').css('overflow', 'hidden');
  }



  private chartSpacing(chartNodes, chartLinks) {
    for (let idx in chartNodes) {
      let node = chartNodes[idx];

      let upstreams = chartLinks.filter(function (l) {
        if (l.target === node.objId) {
          return true;
        }
      });

      if (0 < upstreams.length) {
        let maxDepth = 0;
        upstreams.forEach(function (l) {
          let n = chartNodes.find(function (n) {
            if (n.objId === l.source) {
              return true;
            }
          });
          if (maxDepth < n.value[0]) {
            maxDepth = n.value[0];
          }
        });
        let diffDepth = maxDepth - node.value[0] + 1;
        if (0 < diffDepth) {
          let depth = node.value[0];
          let position = node.value[1];
          chartNodes.forEach(function (n) {
            if (position == n.value[1] && depth <= n.value[0]) {
              n.value[0] += diffDepth;
            }
          });
        }
      }
    }
  } // function - chartSpacing



  private findRootDataset(node: any, nodeList: any[]) {
    if (0 === node.upstreamIds.length && node.objType === Dataflow.DataflowDiagram.ObjectType.DATASET) {
      return node;
    } else {
      const result = nodeList
        .filter(item => -1 !== node.upstreamIds.indexOf(item.objId))
        .map(item => this.findRootDataset(item, nodeList));
      return (result && 0 < result.length) ? result[ 0 ] : node;
    }
  } // function - findRootDataset


  /**
   * 차트 전체 노드 구조 생성
   * @param nodeList
   */
  private createNodeTree(nodeList) {
    this.logger.info('createNodeTree', nodeList);

    // root노드
    const rootNodeList = nodeList.filter(node => (node.upstreamIds.length === 0));

    const recipeRootNodeList = nodeList.filter((node) => {
      return _.eq(node.objType, Dataflow.DataflowDiagram.ObjectType.RECIPE && !_.eq(node.creatorDfId, this.dataflow.dfId));
    });

    // 각 root로 부터 파생되는 노드를 순차적으로 생성
    _.concat(rootNodeList, recipeRootNodeList).map((node) => {
      const rootNode = this.createNode(node, 0, this.rootCount);
      this.rootCount += 1;
      this.setChildNode(nodeList, rootNode, rootNode);
    });

  } // function - createNodeTree



  private createNode(diagram: Dataflow.DataflowDiagram.Diagram, depth: number, position: number, rootNode?: any) {
    let importType: Dataset.IMPORT_TYPE = null;
    let detailType = null;
    let flowName = null;

    flowName = diagram.creatorDfId;
    importType = Dataset.IMPORT_TYPE.DATABASE;
    detailType = 'DEFAULT';

    const nodeSymbol = Dataflow.DataflowDiagram.ObjectType.DATASET === diagram.objType ? this.symbolInfo[diagram.objType][importType][detailType] : this.symbolInfo[diagram.objType][detailType];

    const node = {
      objId: diagram.objId,
      dsName: diagram.objName,
      name: diagram.objId,
      dsType: diagram.objType,
      importType: importType != null ? importType : undefined,
      detailType: detailType != null ? detailType : undefined,
      flowName: flowName != null ? flowName : undefined,
      upstream: diagram.upstreamIds,
      children: [],
      value: [depth, position],
      symbol: nodeSymbol,
      originSymbol: _.cloneDeep(nodeSymbol),
      label: this.label
    };
    if (rootNode) {
      node['rootDataset'] = diagram.rootDataset;
      node['rootValue'] = rootNode['value'];
    }

    // 차트 정보에 들어갈 노드 추가
    this.chartNodes.push(node);

    return node;
  } // function - createNode


  //  * 하위 노드 설정
  private setChildNode(nodeList, parent, rootNode) {
    const childNodeList = nodeList.filter((node) => {
      return node.upstreamIds.indexOf(parent.objId) > -1 && _.eq(node.creatorDfId, this.dataflow.dfId);
    });
    childNodeList.map((child, idx) => {
      const depth = parent.value[0] + 1;
      const position = parent.value[1] + idx;
      this.rootCount = this.rootCount <= position ? position + 1 : this.rootCount;

      // 차트 정보에 들어갈 노드 추가
      const childData = this.createNode(child, depth, position, rootNode);

      // 차트 정보에 들어갈 링크 추가
      const link = {
        source: parent.objId,
        target: childData.objId
      };
      if (parent.value[1] !== position) {
        link['lineStyle'] = {
          normal: {
            curveness: -0.2
          }
        };
      }
      this.chartLinks.push(link);
      this.setChildNode(nodeList, childData, rootNode);
    });
  } // function - setChildNode


  public chartClickEvent($event) {
    const graphData = $event;
    const symbolInfo = this.symbolInfo
    const option = this.echartsIntance.getOption();

    if (graphData['data'] === null || graphData['data'] === undefined) return;
    if (graphData['data']['objId'] === null || graphData['data']['objId'] === undefined) return;
    this.logger.info('this.chartClickEvent', $event);
    if (this.detailBoxSelectedId === graphData['data']['objId']) return;

    option.series[graphData.seriesIndex].nodes.map((node, idx) => {
      if (_.eq(idx, graphData.dataIndex) && graphData.data.detailType) {
        node.symbol = symbolInfo.SELECTED[graphData.data.dsType];
      } else {
        node.symbol = _.cloneDeep(node.originSymbol);
      }
    });
    this.echartsIntance.setOption(option);
    if (graphData['data']['dsType'] === Dataflow.DataflowDiagram.ObjectType.DATASET) {
      this.getDatasetInfomation(graphData['data']['objId']);
      return;
    }
    if (graphData['data']['dsType'] === Dataflow.DataflowDiagram.ObjectType.RECIPE) {
      this.getRecipeInfomation(graphData['data']['objId']);
      return;
    }
  }

  private getDatasetInfomation(dsId: string) {
    this.detailBoxReset();
    this.detailBoxOpenSetting();
    this.loadingService.show();
    this.datasetService
      .getDataset(dsId)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe(
        dataset => {
          if (!dataset) {
            this.detailBoxReset();
            return;
          }
          this.detailBoxSelectedId = dsId;
          this.detailBoxDataset = dataset as Dataset.Select;
          this.detailBoxDatasetName = this.detailBoxDataset.name;
          if (this.detailBoxDataset.gridResponse !== null) {
            this.makeDatagrid(this.detailBoxDataset.gridResponse);
          }
          this.detailBoxOpen = true;
        },
        error => {
          Alert.error(error?.message);
        }
      );
  }


  private getRecipeInfomation(recipeId: string) {
    this.detailBoxReset();
    this.detailBoxOpenSetting();
    this.loadingService.show();
    this.recipeService
      .getRecipe(recipeId)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe(
        recipe => {
          if (!recipe) {
            this.detailBoxReset();
            return;
          }
          this.detailBoxSelectedId = recipeId;
          this.detailBoxRecipe = recipe as Recipe.Select;
          if (this.detailBoxRecipe.recipeRules !== null) {
            this.recipeRulesSize = this.detailBoxRecipe.recipeRules.length;
            this._setRuleList(this.detailBoxRecipe.recipeRules);
          }
          this.detailBoxRecipeName = this.detailBoxRecipe.name;
          if (this.detailBoxRecipe.gridResponse !== null) {
            this.makeDatagrid(this.detailBoxRecipe.gridResponse);
          }
          this.detailBoxOpen = true;
        },
        error => {
          Alert.error(error?.message);
        }
      );
  }

  private detailBoxReset() {
    this.detailBoxOpen = false;
    this.detailBoxSelectedId = null;
    this.detailBoxDataset  = null;
    this.detailBoxRecipe = null;
    this.detailBoxDatasetName  = '';
    this.detailBoxRecipeName  = '';
    this.recipeRulesSize = 0;
    this.ruleList = [];
    this.gridDatasetOrRecipe = [];
    this.gridEnable = false;
  }

  private detailBoxOpenSetting() {
    // 좌표 정보가 있다면 그 정보 로 연다.
    // this.logger.info('this.LAYER_POPUP_POS', this.LAYER_POPUP_POS);
    const xpos: number = this.LAYER_POPUP_POS.x;
    const ypos: number = this.LAYER_POPUP_POS.y;
    const parantWidth = $( window ).width();
    const lnbWidth = $('.pb-layout-lnb').width();
    const paddindGap: number = 54;
    const boxflowWidth = Math.floor($('.pb-box-dataflow').width());

    let targetPosX: number = xpos;
    let targetPosY: number = ypos;
    const minValue = 50;
    if(targetPosX < minValue) {
      targetPosX = parantWidth - (lnbWidth + paddindGap + boxflowWidth);
    }
    if(targetPosY < 0) {
      targetPosY = 0;
    }
    this.LAYER_POPUP_POS.x = targetPosX;
    this.LAYER_POPUP_POS.y = targetPosY;
    $('.pb-box-dataflow').css('left', targetPosX+'px');

  }


  private _setRuleList(rules: any) {
    this.ruleList = [];
    const commandNames = this.commandList.map((command) => {
      return command.command;
    });

    // ruleStringInfos
    rules.forEach((rule) => {

      let ruleInfo: Command = new Command();
      let ruleVO = JSON.parse(rule['uiContext']);
      ruleInfo.command = ruleVO['name'];

      const idx = commandNames.indexOf(ruleInfo.command);

      if (idx > -1) {
        ruleInfo.alias = this.commandList[idx].alias;
        ruleInfo.shortRuleString = rule.shortRuleString || rule.ruleString
        ruleInfo.ruleString = rule.ruleString;

      } else {
        ruleInfo.shortRuleString = rule.shortRuleString ? rule.shortRuleString : rule.ruleString;
        ruleInfo.command = 'Create';
        ruleInfo.alias = 'Cr';
      }

      this.ruleList.push(ruleInfo);

    });
  }

  private makeDatagrid(gridData: any) {
    this.columnDefinitions = [];
    const filedArr: string[] = [];

    if (gridData !== null) {
      if (gridData['colNames'] !== null) {
        gridData['colNames'].forEach((item) => {
          const columnValue = {};
          columnValue['id'] = item;
          columnValue['name'] = item;
          columnValue['field'] = item;
          columnValue['sortable'] = false;
          columnValue['type'] = FieldType.string;
          columnValue['minWidth'] = 100;
          this.columnDefinitions.push(columnValue as Column);
          filedArr.push(item);
        });
      }

      if (gridData['rows']) {
        let idnum = 0;
        gridData['rows'].forEach((rowsitem) => {
          const ritemArr = {};
          ritemArr['dataflow_dataset_grid_id'] = this.gridUseRowId + '_' + idnum;
          rowsitem['objCols'].forEach((ritem, idx) => {
            ritemArr[filedArr[idx]] = ritem;
          });
          idnum++;
          this.gridDatasetOrRecipe.push(ritemArr);
        });
      }
      if(this.columnDefinitions.length > 0 && this.gridDatasetOrRecipe.length > 0) {
        this.gridEnable = true;
        this.gridInstance.dataView.setItems(this.gridDatasetOrRecipe, this.gridUseRowId);
      }
    }
  }

  public generateNewDataset(dsId: string) {
    this.loadingService.show();
    this.datasetService
      .generateNewDataset(dsId, this.dataflow.dfId)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe(result => {
        if (!result) {
          return;
        }
        // 임시
        // this.documentLocationReload();
        this.initViewPage();
        this.refreshDataflowData();
      });
  }

  angularGridReady(gridInstance: AngularGridInstance) {
    this.gridInstance = gridInstance;
    this.gridInstance.dataView.setItems(this.gridDatasetOrRecipe, this.gridUseRowId);
  }



  public editRules(recipeId: string) {
    this.router.navigate([RouterUrls.Managements.getRecipeDetailUrl(this.dataflowId, recipeId)]).then();
  }

  public detailBoxClose() {
    this.detailBoxReset();
    this.chartStyleReset();
  }

  private chartStyleReset() {
    if (this.echartsIntance !== null && this.echartsIntance !== undefined) {
      const option = this.echartsIntance.getOption();
      const clearSelectedNodeEffect = (() => {
        option.series[0].nodes.map((node) => {
          node.symbol = _.cloneDeep(node.originSymbol);
        });
      });
      clearSelectedNodeEffect();
      this.echartsIntance.setOption(option);
    }
  }

  public openAddDatasetPopup() {
    const selectedDatasetIds: string[] = [];
    if (this.dataSetList !== null && this.dataSetList !== undefined) {
      this.dataSetList.forEach(item => {
        if (item.objType === Dataflow.DataflowDiagram.ObjectType.DATASET) {
          selectedDatasetIds.push(item.objId);
        }
      });
    }
    this.lnbComponent.openAddDatasetPopup('ADD', selectedDatasetIds);
  }

  public addDatasetEvent(event) : void {

  }

  ngOnDestroy(): void {
    // this.LAYER_POPUP.unset();
  }


}
class Command {
  command : string;
  alias : string;
  shortRuleString?: string;
  ruleString?: string;
}
