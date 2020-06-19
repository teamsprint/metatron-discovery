/* tslint:disable */
import {Component, OnDestroy, OnInit} from '@angular/core';
import {RouterUrls} from '../../common/constants/router.constant';
import {CommonUtil} from '../../common/utils/common-util';

// import interact from 'interactjs';

// const dragMoveListener = (event) => {
//
//   const target = event.target;
//   const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
//   const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
//
//   target.style.webkitTransform =
//     target.style.transform =
//       'translate(' + x + 'px, ' + y + 'px)';
//
//   target.setAttribute('data-x', x);
//   target.setAttribute('data-y', y);
// };
//
// const resizeListener = (event) => {
//
//   const target = event.target;
//   let x = (parseFloat(target.getAttribute('data-x')) || 0);
//   let y = (parseFloat(target.getAttribute('data-y')) || 0);
//
//   // update the element's style
//   target.style.width = event.rect.width + 'px';
//   target.style.height = event.rect.height + 'px';
//
//   // translate when resizing from top or left edges
//   x += event.deltaRect.left;
//   y += event.deltaRect.top;
//
//   target.style.webkitTransform = target.style.transform =
//     'translate(' + x + 'px,' + y + 'px)';
//
//   target.setAttribute('data-x', x);
//   target.setAttribute('data-y', y);
// };

@Component({
  templateUrl: './dataflow-detail.component.html',
  styleUrls: ['./dataflow-detail.component.css']
})
export class DataflowDetailComponent implements OnInit, OnDestroy {

  public readonly ROUTER_URLS = RouterUrls;
  public readonly COMMON_UTIL = CommonUtil;
  public readonly UUID = this.COMMON_UTIL.Generate.makeUUID();

  // public readonly LAYER_POPUP = interact('#' + this.UUID);

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

  ngOnInit(): void {
    // this.LAYER_POPUP
    //   .resizable({
    //     edges: {
    //       left: true,
    //       right: true,
    //       bottom: true,
    //       top: true
    //     },
    //     listeners: {
    //       move: resizeListener
    //     },
    //     modifiers: [
    //       // minimum size
    //       interact.modifiers.restrictSize({
    //         min: { width: 100, height: 100 }
    //       })
    //     ],
    //
    //     inertia: true
    //   })
    //   .draggable({
    //     listeners: {
    //       move: dragMoveListener
    //     },
    //     inertia: true,
    //     modifiers: [
    //       interact.modifiers.restrictRect({
    //         restriction: 'parent',
    //         endOnly: true
    //       })
    //     ]
    //   });
  }

  ngOnDestroy(): void {
    // this.LAYER_POPUP.unset();
  }
}
