/*
 *
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

import {Field, LogicalType} from "../../domain/datasource/datasource";
import {StringUtil} from "../../common/util/string.util";
import {CommonUtil} from "../../common/util/common.util";
import {Injectable} from "@angular/core";

@Injectable()
export class FieldConfigService {

  /**
   * Set rename field list
   * @param {Field[]} fieldList
   */
  public setRenamedFieldList(fieldList: Field[]) {
    fieldList.forEach((field, index, list) => {
      let seq: number = 1;
      list.forEach((targetField, targetIndex) => {
        // if duplicate field
        if (index !== targetIndex && field.name === targetField.name) {
          // TODO data list rename require
          // rename field
          field.name = `${field.name} (${seq})`;
          // increase seq number
          seq += 1;
        }
      });
    });
  }

  /**
   * Is duplicated field name
   * @param {Field[]} fieldList
   * @param {string} name
   * @return {boolean}
   */
  public isDuplicatedFieldName(fieldList: Field[], name: string): boolean {
    return fieldList.filter(field => field.name === name).length > 1;
  }

  /**
   * Is valid rename, set validation message
   * @param {Field[]} fieldList
   * @param {string} name
   * @return {boolean}
   */
  public isValidRenameAndSetValidationMessage(fieldList: Field[], name: string): boolean {
    // check empty
    if (StringUtil.isEmpty(name)) {
      // set valid message
      return false;
    }
    // check duplicate
    else if (this.isDuplicatedFieldName(fieldList, name)) {
      // set valid message
      return false;
    }
    // check name length
    else if (CommonUtil.getByte(name.trim()) > 150) {
      // set valid message
      return false;
    }
    // TODO check 특수문자
    return true;
  }

  /**
   * Set rename in field
   * @param {Field[]} fieldList
   * @param {Field} targetField
   * @param {string} name
   */
  public setRenameInField(fieldList: Field[], targetField: Field, name: string): void {
    fieldList.forEach((field) => {
      // if GEO field use target field
      if (field.derived && field.logicalType === LogicalType.GEO_POINT) {
        // if same latField
        if (field.derivationRule.latField === targetField.name) {
          field.derivationRule.latField = name;
        }
        // if sname lonField
        else if (field.derivationRule.lonField === targetField.name) {
          field.derivationRule.lonField = name;
        }
      }
    });
    // set rename target field
    targetField.name = name;
  }
}
