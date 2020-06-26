import {Component, OnDestroy, OnInit, ChangeDetectorRef, Injector, ViewChild, ElementRef} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {RouterUrls} from '../../common/constants/router.constant';
import {CommonUtil} from '../../common/utils/common-util';
import {DataflowService} from '../services/dataflow.service';
import {LoadingService} from '../../common/services/loading/loading.service';
import {finalize} from 'rxjs/operators';
import {Dataflow} from '../domains/dataflow';
import {NGXLogger} from 'ngx-logger';

@Component({
  templateUrl: './dataflow-detail.component.html',
  styleUrls: ['./dataflow-detail.component.css']
})
export class DataflowDetailComponent implements OnInit, OnDestroy {

  @ViewChild('nameInput', {static: false})
  private nameInput: ElementRef;

  public readonly ROUTER_URLS = RouterUrls;
  public readonly COMMON_UTIL = CommonUtil;
  public readonly UUID = this.COMMON_UTIL.Generate.makeUUID();

  // public readonly LAYER_POPUP = interact('#' + this.UUID);
  public expanded: boolean = false;
  public dataflow: Dataflow.ValueObjects.Select;
  private dataflowId: string;
  // 차트를 그리기 위한 기반 데이터
  public dataSetList: any[] = [];
  private upstreamList: Dataflow.Upstream[] = [];

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
  public commandList: any[];
  public nameTextInputEnable =false;
  public dataflowName: string = '';
  // Change Detect
  public changeDetect: ChangeDetectorRef;


  public readonly options = {
    'backgroundColor': '#ffffff',
    'tooltip': {
      'show': false
    },
    'xAxis': {
      'type': 'value',
      'max': 5,
      'interval': 1,
      'splitLine': {
        'show': false
      },
      'axisLabel': {
        'show': false
      },
      'axisLine': {
        'show': false
      },
      'axisTick': {
        'show': false
      }
    },
    'yAxis': {
      'type': 'value',
      'max': 5,
      'interval': 1,
      'inverse': true,
      'splitLine': {
        'show': false
      },
      'axisLabel': {
        'show': false
      },
      'axisLine': {
        'show': false
      },
      'axisTick': {
        'show': false
      }
    },
    'series': [
      {
        'type': 'graph',
        'legendHoverLink': false,
        'layout': 'none',
        'coordinateSystem': 'cartesian2d',
        'focusNodeAdjacency': false,
        'symbolSize': 50,
        'hoverAnimation': true,
        'roam': false,
        'draggable': true,
        'itemStyle': {
          'normal': {
            'color': '#aaa',
            'borderColor': '#1af'
          }
        },
        'nodes': [
          {
            'dsId': '12fa7a34-c50e-4919-9ce6-c3df5e1a0721',
            'dsName': 'SKT 갤럭시 A80 디지털 영상 캠페인_Daily Report_191215_Final_Raw - Rawdata',
            'name': '12fa7a34-c50e-4919-9ce6-c3df5e1a0721',
            'dsType': 'IMPORTED',
            'importType': 'UPLOAD',
            'detailType': 'DEFAULT',
            'upstream': [],
            'children': [],
            'value': [
              0,
              0
            ],
            'symbol': 'image://http://52.141.2.109:8180/assets/images/dataflow/img_db.png',
            'originSymbol': 'image://http://52.141.2.109:8180/assets/images/dataflow/img_db.png',
            'label': {
              'normal': {
                'show': true,
                'position': 'bottom',
                'textStyle': {
                  'color': '#000000',
                  'fontWeight': 'bold'
                }
              },
              'emphasis': {
                'show': true,
                'position': 'bottom',
                'textStyle': {
                  'color': '#000000',
                  'fontWeight': 'bold'
                }
              }
            }
          },
          {
            'dsId': '7a711f7b-b368-490d-8fce-3dc3ea13497f',
            'dsName': 'SKT 갤럭시 A80 디지털 영상 캠페인_Daily Report_191215_Final_Raw - Rawdata',
            'name': '7a711f7b-b368-490d-8fce-3dc3ea13497f',
            'dsType': 'WRANGLED',
            'detailType': 'DEFAULT',
            'flowName': '99d6f24e-c5fb-410b-ab21-550c336defda',
            'upstream': [
              '12fa7a34-c50e-4919-9ce6-c3df5e1a0721'
            ],
            'children': [],
            'value': [
              1,
              0
            ],
            'symbol': 'image://http://52.141.2.109:8180/assets/images/dataflow/img_dataset.png',
            'originSymbol': 'image://http://52.141.2.109:8180/assets/images/dataflow/img_dataset.png',
            'label': {
              'normal': {
                'show': true,
                'position': 'bottom',
                'textStyle': {
                  'color': '#000000',
                  'fontWeight': 'bold'
                }
              },
              'emphasis': {
                'show': true,
                'position': 'bottom',
                'textStyle': {
                  'color': '#000000',
                  'fontWeight': 'bold'
                }
              }
            },
            'rootDataset': {
              'createdBy': 'admin',
              'createdTime': '2020-05-16T12:03:36.000Z',
              'modifiedBy': 'admin',
              'modifiedTime': '2020-05-16T12:03:38.000Z',
              'dsId': '12fa7a34-c50e-4919-9ce6-c3df5e1a0721',
              'dsName': 'SKT 갤럭시 A80 디지털 영상 캠페인_Daily Report_191215_Final_Raw - Rawdata',
              'dsDesc': '',
              'dsType': 'IMPORTED',
              'importType': 'UPLOAD',
              'storedUri': 'file:///home/metatron/servers/metatron-discovery/dataprep/uploads/c3b7e346-5e18-4ea8-914d-7fc4171df054csv',
              'filenameBeforeUpload': 'SKT 갤럭시 A80 디지털 영상 캠페인_Daily Report_191215_Final_Raw.xlsx',
              'totalLines': 1231,
              'totalBytes': 143741,
              'sheetName': 'Rawdata',
              'delimiter': ',',
              'manualColumnCount': 12,
              'refDfCount': 2,
              'upstreamDsIds': []
            },
            'rootValue': [
              0,
              0
            ]
          },
          {
            'dsId': '88d5ee96-5d02-4ccf-ab40-2bcb9fad49e3',
            'dsName': 'accounts_POSTGRESQL (1)',
            'name': '88d5ee96-5d02-4ccf-ab40-2bcb9fad49e3',
            'dsType': 'WRANGLED',
            'detailType': 'DEFAULT',
            'flowName': '99d6f24e-c5fb-410b-ab21-550c336defda',
            'upstream': [
              '0e8c28c1-61fb-4896-82bb-a4c5e10bcdb8',
              'caa0bd33-6f66-4d70-a753-1e705d842635',
              '7a711f7b-b368-490d-8fce-3dc3ea13497f'
            ],
            'children': [],
            'value': [
              2,
              1
            ],
            'symbol': 'image://http://52.141.2.109:8180/assets/images/dataflow/img_dataset.png',
            'originSymbol': 'image://http://52.141.2.109:8180/assets/images/dataflow/img_dataset.png',
            'label': {
              'normal': {
                'show': true,
                'position': 'bottom',
                'textStyle': {
                  'color': '#000000',
                  'fontWeight': 'bold'
                }
              },
              'emphasis': {
                'show': true,
                'position': 'bottom',
                'textStyle': {
                  'color': '#000000',
                  'fontWeight': 'bold'
                }
              }
            },
            'rootDataset': {
              'createdBy': 'admin',
              'createdTime': '2020-05-21T02:30:03.000Z',
              'modifiedBy': 'admin',
              'modifiedTime': '2020-05-21T02:30:06.000Z',
              'dsId': '0e8c28c1-61fb-4896-82bb-a4c5e10bcdb8',
              'dsName': 'accounts_POSTGRESQL',
              'dsDesc': '설명 테스트',
              'dsType': 'IMPORTED',
              'importType': 'DATABASE',
              'totalLines': 110,
              'totalBytes': -1,
              'dcId': 'a1d0fcbb-5996-4fda-bade-0887158e1aa3',
              'dcImplementor': 'POSTGRESQL',
              'dcName': 'PostgreSQL-sql.improvado.io-5432',
              'dcType': 'JDBC',
              'dcHostname': 'sql.improvado.io',
              'dcPort': 5432,
              'dcUsername': 'agency_3756',
              'dcPassword': 'xXD5d4q8saLmuofH2WUp9SRXd4kkvZ',
              'dcAuthenticationType': 'MANUAL',
              'dcPublished': true,
              'rsType': 'TABLE',
              'dbName': 'public',
              'tblName': 'accounts',
              'queryStmt': 'select * from public.accounts',
              'refDfCount': 2,
              'upstreamDsIds': []
            },
            'rootValue': [
              0,
              0
            ]
          },
          {
            'dsId': '0e8c28c1-61fb-4896-82bb-a4c5e10bcdb8',
            'dsName': 'accounts_POSTGRESQL',
            'name': '0e8c28c1-61fb-4896-82bb-a4c5e10bcdb8',
            'dsType': 'IMPORTED',
            'importType': 'DATABASE',
            'detailType': 'DEFAULT',
            'upstream': [],
            'children': [],
            'value': [
              0,
              1
            ],
            'symbol': 'image://http://52.141.2.109:8180/assets/images/dataflow/img_db.png',
            'originSymbol': 'image://http://52.141.2.109:8180/assets/images/dataflow/img_db.png',
            'label': {
              'normal': {
                'show': true,
                'position': 'bottom',
                'textStyle': {
                  'color': '#000000',
                  'fontWeight': 'bold'
                }
              },
              'emphasis': {
                'show': true,
                'position': 'bottom',
                'textStyle': {
                  'color': '#000000',
                  'fontWeight': 'bold'
                }
              }
            }
          },
          {
            'dsId': 'caa0bd33-6f66-4d70-a753-1e705d842635',
            'dsName': 'accounts_POSTGRESQL',
            'name': 'caa0bd33-6f66-4d70-a753-1e705d842635',
            'dsType': 'WRANGLED',
            'detailType': 'DEFAULT',
            'flowName': '99d6f24e-c5fb-410b-ab21-550c336defda',
            'upstream': [
              '0e8c28c1-61fb-4896-82bb-a4c5e10bcdb8'
            ],
            'children': [],
            'value': [
              1,
              2
            ],
            'symbol': 'image://http://52.141.2.109:8180/assets/images/dataflow/img_dataset.png',
            'originSymbol': 'image://http://52.141.2.109:8180/assets/images/dataflow/img_dataset.png',
            'label': {
              'normal': {
                'show': true,
                'position': 'bottom',
                'textStyle': {
                  'color': '#000000',
                  'fontWeight': 'bold'
                }
              },
              'emphasis': {
                'show': true,
                'position': 'bottom',
                'textStyle': {
                  'color': '#000000',
                  'fontWeight': 'bold'
                }
              }
            },
            'rootDataset': {
              'createdBy': 'admin',
              'createdTime': '2020-05-21T02:30:03.000Z',
              'modifiedBy': 'admin',
              'modifiedTime': '2020-05-21T02:30:06.000Z',
              'dsId': '0e8c28c1-61fb-4896-82bb-a4c5e10bcdb8',
              'dsName': 'accounts_POSTGRESQL',
              'dsDesc': '설명 테스트',
              'dsType': 'IMPORTED',
              'importType': 'DATABASE',
              'totalLines': 110,
              'totalBytes': -1,
              'dcId': 'a1d0fcbb-5996-4fda-bade-0887158e1aa3',
              'dcImplementor': 'POSTGRESQL',
              'dcName': 'PostgreSQL-sql.improvado.io-5432',
              'dcType': 'JDBC',
              'dcHostname': 'sql.improvado.io',
              'dcPort': 5432,
              'dcUsername': 'agency_3756',
              'dcPassword': 'xXD5d4q8saLmuofH2WUp9SRXd4kkvZ',
              'dcAuthenticationType': 'MANUAL',
              'dcPublished': true,
              'rsType': 'TABLE',
              'dbName': 'public',
              'tblName': 'accounts',
              'queryStmt': 'select * from public.accounts',
              'refDfCount': 2,
              'upstreamDsIds': []
            },
            'rootValue': [
              0,
              1
            ]
          }
        ],
        'links': [
          {
            'source': '12fa7a34-c50e-4919-9ce6-c3df5e1a0721',
            'target': '7a711f7b-b368-490d-8fce-3dc3ea13497f'
          },
          {
            'source': '7a711f7b-b368-490d-8fce-3dc3ea13497f',
            'target': '88d5ee96-5d02-4ccf-ab40-2bcb9fad49e3'
          },
          {
            'source': '0e8c28c1-61fb-4896-82bb-a4c5e10bcdb8',
            'target': '88d5ee96-5d02-4ccf-ab40-2bcb9fad49e3'
          },
          {
            'source': '0e8c28c1-61fb-4896-82bb-a4c5e10bcdb8',
            'target': 'caa0bd33-6f66-4d70-a753-1e705d842635',
            'lineStyle': {
              'normal': {
                'curveness': -0.2
              }
            }
          },
          {
            'source': 'caa0bd33-6f66-4d70-a753-1e705d842635',
            'target': '88d5ee96-5d02-4ccf-ab40-2bcb9fad49e3'
          }
        ],
        'lineStyle': {
          'normal': {
            'opacity': 0.3,
            'width': 4
          }
        }
      }
    ],
    'animation': false
  };


  constructor(protected injector: Injector,
              private readonly router: Router,
              private activatedRoute: ActivatedRoute,
              private readonly dataflowService: DataflowService,
              private readonly loadingService: LoadingService,
              private readonly logger: NGXLogger) {
    this.changeDetect = injector.get(ChangeDetectorRef);
  }


  ngOnInit(): void {

    this.activatedRoute
      .paramMap
      .subscribe((params) => {
        const dfId = params.get(RouterUrls.Managements.getFlowDetailPathVariableKey());
        if (dfId) {
          this.dataflowId = dfId;
        }
      });

    // 초기 세팅
    this.initViewPage();

    if (this.dataflowId !== null || this.dataflowId !== undefined) {
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
          if (params.data.dsName.length > 20) {
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
          if (params.data.dsName.length > 20) {
            return params.data.dsName.slice(0, 20) + ' ...';
          } else {
            return params.data.dsName;
          }
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

    // lineStyle: { normal: { opacity: 0.3, width: 4 } }


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

    this.logger.info('this.upstreamList', this.upstreamList);

    for (let ds of this.dataSetList) {
      ds.upstreamIds = [];
      for (let upstream of this.upstreamList) {
        if (upstream.recipeId === ds.objId) {
          ds.upstreamIds.push(upstream.upstreamId);
        }
      }
    }

    this.logger.info('this.dataSetList', this.dataSetList);

    this.makeChartData();

  }

  private makeChartData() {
    // 최상위 노드 탐색
    this.dataSetList.forEach(item => {
      const rootDataset = this.findRootDataset(item, this.dataSetList);
      if (rootDataset.objId !== item.objId) {
        item.rootDataset = rootDataset;
      }
    });

    // this.createNodeTree(this.dataSetList);

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

    this.logger.info('this.dataSetList', this.dataSetList);
  }

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
  // private createNodeTree(nodeList) {
  //   // root노드
  //   const rootNodeList = nodeList.filter(node => (node.upstreamIds.length === 0));
  //
  //   const recipeRootNodeList = nodeList.filter((node) => {
  //     return _.eq(node.objType, Dataflow.DataflowDiagram.ObjectType.RECIPE) && !_.eq(node.creatorDfId, this.dataflow.dfId);
  //   });
  //
  //   // 각 root로 부터 파생되는 노드를 순차적으로 생성
  //   _.concat(rootNodeList, recipeRootNodeList).map((node) => {
  //     const rootNode = this.createNode(node, 0, this.rootCount);
  //     this.rootCount += 1;
  //     this.setChildNode(nodeList, rootNode, rootNode);
  //   });
  //
  // } // function - createNodeTree


  //
  // private createNode(dataset: PrDataset, depth: number, position: number, rootNode?: any) {
  //   let importType: ImportType = null;
  //   let detailType = null;
  //   let flowName = null;
  //
  //   flowName = dataset.creatorDfId;
  //   importType = dataset.importType;
  //   detailType = 'DEFAULT';
  //
  //   const nodeSymbol = DsType.IMPORTED === dataset.dsType ? this.symbolInfo[dataset.dsType][importType][detailType] : this.symbolInfo[dataset.dsType][detailType];
  //
  //   const node = {
  //     dsId: dataset.dsId,
  //     dsName: dataset.dsName,
  //     name: dataset.dsId,
  //     dsType: dataset.dsType,
  //     importType: importType != null ? importType : undefined,
  //     detailType: detailType != null ? detailType : undefined,
  //     flowName: flowName != null ? flowName : undefined,
  //     upstream: dataset.upstreamDsIds,
  //     children: [],
  //     value: [depth, position],
  //     symbol: nodeSymbol,
  //     originSymbol: _.cloneDeep(nodeSymbol),
  //     label: this.label
  //   };
  //   if (rootNode) {
  //     node['rootDataset'] = dataset['rootDataset'];
  //     node['rootValue'] = rootNode['value'];
  //   }
  //
  //   // 차트 정보에 들어갈 노드 추가
  //   this.chartNodes.push(node);
  //
  //   return node;
  // } // function - createNode


  // /**
  //  * 하위 노드 설정
  //  * @param nodeList
  //  * @param parent
  //  * @param rootNode
  //  */
  // private setChildNode(nodeList, parent, rootNode) {
  //   const childNodeList = nodeList.filter((node) => {
  //     return node.upstreamDsIds.indexOf(parent.dsId) > -1 && _.eq(node.creatorDfId, this.dataflow.dfId);
  //   });
  //   childNodeList.map((child, idx) => {
  //     const depth = parent.value[0] + 1;
  //     const position = parent.value[1] + idx;
  //     this.rootCount = this.rootCount <= position ? position + 1 : this.rootCount;
  //
  //     // 차트 정보에 들어갈 노드 추가
  //     const childData = this.createNode(child, depth, position, rootNode);
  //
  //     // 차트 정보에 들어갈 링크 추가
  //     const link = {
  //       source: parent.dsId,
  //       target: childData.dsId
  //     };
  //     if (parent.value[1] !== position) {
  //       link['lineStyle'] = {
  //         normal: {
  //           curveness: -0.2
  //         }
  //       };
  //     }
  //     this.chartLinks.push(link);
  //     this.setChildNode(nodeList, childData, rootNode);
  //   });
  // } // function - setChildNode
  //

  ngOnDestroy(): void {
    // this.LAYER_POPUP.unset();
  }

  public expandedClose(event) {
    event.preventDefault();
    this.expanded = false;
  }

  public expandedStatus() {
    return this.expanded;

  }
}
