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

import { UIOption } from '../ui-option';
import {LineMarkType, LineMode, LineStyle, LineCornerType} from '../define/common';
/**
 * 라인차트 화면 UI에 필요한 옵션
 * Version 2.0
 */
export interface UILineChart extends UIOption {

  // 차트유형 : 선형/면적형으로 표현설정
  mark: LineMarkType;

  // 라인&포인트/포인트/라인
  lineStyle: LineStyle;

  // 기본 / 누적타입
  lineMode: LineMode;

  // 코너타입
  curveStyle?: LineCornerType;
}


