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
