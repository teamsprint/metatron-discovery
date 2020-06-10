import {Component} from '@angular/core';
import {Location} from '@angular/common';

@Component({
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.css']
})
export class DatasetComponent {

  constructor(public readonly location: Location) {
  }
}
