import {Pipe, PipeTransform} from '@angular/core';
import * as _ from 'lodash';

@Pipe({
  name: 'tableSort'
})
export class TableSortPipe implements PipeTransform {

  transform(list: Array<Object>, property: string, direction: string = 'asc'): Array<Object> {

    // Check if is not null
    if (!list || !property || !direction) return list;

    list = _.cloneDeep(list);

    return list.sort((a: Object, b: Object) => {
      if (direction == 'desc') {
        return a[ property ] > b[ property ] ? -1 : a[ property ] < b[ property ] ? 1 : 0;
      } else {
        return a[ property ] < b[ property ] ? -1 : a[ property ] > b[ property ] ? 1 : 0;
      }
    })
  }

}
