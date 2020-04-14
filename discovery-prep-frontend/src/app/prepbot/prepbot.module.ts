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

import { NgModule } from '@angular/core';
import { PrepbotComponent } from './prepbot.component';
import { PrepbotGuard } from './prepbot.guard';
import { PrepbotService } from './service/prepbot.service';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '../common/common.module';
import {DatasetComponent} from "./dataset/dataset.component";
import {CreateSnapshotPopup} from "./component/create-snapshot-popup.component";
import {DatasetSummaryComponent} from "./component/dataset-summary.component";
import {LongUpdatePopupComponent} from "./component/long-update-popup.component";
import {RadioSelectDatasetComponent} from "./component/radio-select-dataset.component";
import {SnapshotLoadingComponent} from "./component/snapshot-loading.component";
import {DataSnapshotComponent} from "./data-snapshot/data-snapshot.component";
import {DataSnapshotDetailComponent} from "./data-snapshot/data-snapshot-detail.component";
import {DataflowComponent} from "./dataflow/dataflow.component";
import {CreateDataflowNameDescComponent} from "./dataflow/create-dataflow-name-desc.component";
import {DatasetDetailComponent} from "./dataset/dataset-detail.component";
import {CreateDatasetComponent} from "./dataset/create-dataset/create-dataset.component";
import {CreateDatasetDataTypeComponent} from "./dataset/create-dataset/create-dataset-datatype.component";
import {CreateDatasetDbQueryComponent} from "./dataset/create-dataset/create-dataset-db-query.component";
import {CreateDatasetDbSelectComponent} from "./dataset/create-dataset/create-dataset-db-select.component";
import {CreateDatasetNameComponent} from "./dataset/create-dataset/create-dataset-name.component";
import {CreateDatasetSelectfileComponent} from "./dataset/create-dataset/create-dataset-selectfile.component";
import {CreateDatasetSelectsheetComponent} from "./dataset/create-dataset/create-dataset-selectsheet.component";
import {CreateDatasetSelecturlComponent} from "./dataset/create-dataset/create-dataset-selecturl.component";
import {CreateDatasetStagingSelectdataComponent} from "./dataset/create-dataset/create-dataset-staging-selectdata.component";
import {DatasetInfoPopupComponent} from "./dataflow/dataflow-detail/component/dataset-info-popup/dataset-info-popup.component";
import {DataflowDetailComponent} from "./dataflow/dataflow-detail/dataflow-detail.component";
import {DataflowDetail2Component} from "./dataflow/dataflow-detail/dataflow-detail2.component";
import {RuleListComponent} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/rule-list.component";
import {RuleContextMenuComponent} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/rule-context-menu.component";
import {MultipleRenamePopupComponent} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/multiple-rename-popup.component";
import {ExtendInputFormulaComponent} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/extend-input-formula.component";
import {EditDataflowRule2Component} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/edit-dataflow-rule-2.component";
import {EditRuleGridComponent} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule-grid/edit-rule-grid.component";
import {ScrollLoadingGridComponent} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule-grid/scroll-loading-grid.component";
import {RuleJoinPopupComponent} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/rule-join-popup/rule-join-popup.component";
import {RuleUnionPopupComponent} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/rule-union-popup/rule-union-popup.component";
import {UnionAddDatasetsComponent} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/rule-union-popup/union-add-datasets/union-add-datasets.component";
import {EditRuleAggregateComponent} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-aggregate.component";
import {EditRuleCountpatternComponent} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-countpattern.component";
import {EditRuleDeleteComponent} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-delete.component";
import {EditRuleDeriveComponent} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-derive.component";
import {EditRuleDropComponent} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-drop.component";
import {EditRuleExtractComponent} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-extract.component";
import {EditRuleFieldComboComponent} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-field-combo.component";
import {EditRuleFlattenComponent} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-flatten.component";
import {EditRuleHeaderComponent} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-header.component";
import {EditRuleKeepComponent} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-keep.component";
import {EditRuleMergeComponent} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-merge.component";
import {EditRuleMoveComponent} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-move.component";
import {EditRuleNestComponent} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-nest.component";
import {EditRulePivotComponent} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-pivot.component";
import {EditRuleRenameComponent} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-rename.component";
import {EditRuleReplaceComponent} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-replace.component";
import {EditRuleSetComponent} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-set.component";
import {EditRuleSetformatComponent} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-setformat.component";
import {EditRuleSettypeComponent} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-settype.component";
import {EditRuleSortComponent} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-sort.component";
import {EditRuleSplitComponent} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-split.component";
import {EditRuleUnnestComponent} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-unnest.component";
import {EditRuleUnpivotComponent} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-unpivot.component";
import {EditRuleWindowComponent} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-window.component";
import {RuleConditionInputComponent} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/rule-condition-input.component";
import {RuleSuggestInputComponent} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/rule-suggest-input.component";
import {PrepSelectBoxComponent} from "./util/prep-select-box.component";
import {PrepSelectBoxCustomComponent} from "./util/prep-select-box-custom.component";
import {AddDatasetDataflowComponent} from "./dataset/add-dataset-dataflow.component";
import {PrepListComponent} from "./prep/prep-list.component";
import {EditorComponent} from "./component/editor.component";
import {DatasetService} from './prep/service/dataset.service';
import {DataflowService} from './prep/service/dataflow.service';
import {DataflowModelService} from "./prep/service/dataflow.model.service";
import {PrepDetailComponent} from "./prep/prep-detail.component";
import {PrepDatasetDetailComponent} from "./prep/prep-dataset-detail.component";
import {PrepPopCreateComponent} from "./prep/create-dataset/prep-pop-create.component";
import {PrepPopTypeComponent} from "./prep/create-dataset/prep-pop-type.component";
import {PrepPopCreateDatasetNameComponent} from "./prep/create-dataset/prep-pop-create-dataset-name.component";
import {PrepPopDBCreateComponent} from "./prep/create-dataset/prep-pop-db-create.component";
import {PrepPopDBQueryComponent} from "./prep/create-dataset/prep-pop-db-query.component";
import {PrepPopFileUploadCreateComponent} from "./prep/create-dataset/prep-pop-file-upload-create.component";
import {PrepPopFileSelectsheetComponent} from "./prep/create-dataset/prep-pop-file-selectsheet.component";
import {PrepPopFlowCreateComponent} from "./prep/create-dataflow/prep-pop-flow-create.component";
import {PrepPopDataflowNameComponent} from "./prep/create-dataflow/prep-pop-dataflow-name.component";
import {PrepPopDatasetListComponent} from "./prep/create-dataflow/prep-pop-dataset-list.component";
import {PrepPopConnectionCreateComponent} from "./prep/create-connection/prep-pop-connection-create.component";
import {PrepPopConnectionInfoComponent} from "./prep/create-connection/prep-pop-connection-info.component";
import {PrepPopConnectionNameComponent} from "./prep/create-connection/prep-pop-connection-name.component";
import {PrepPopConnectionUpdateComponent} from "./prep/update-connection/prep-pop-connection-update.component";
import {PrConnectionService} from "./prep/service/connection.service"
import {PrepRnbRuleComponent} from "./prep/component/prep-rnb-rule.component";
import {PrepRnbRuleListComponent} from "./prep/component/prep-rnb-rule-list.component";
import {PrepRnbRecommendComponent} from "./prep/component/prep-rnb-recommend.component";
import {SnapshotService} from "./prep/service/snapshot.service";
import {StorageService} from "../data-storage/service/storage.service";
import {DataconnectionService} from "../dataconnection/service/dataconnection.service";
import {PrepNormalDetailDatasetComponent} from "./prep/detail-dataset/prep-normal-detail-dataset.component";
import {PrepPopDetailDatasetComponent} from './prep/detail-dataset/prep-pop-detail-dataset.component';
import {PrepPopResultCreateComponent} from './prep/create-dataresult/prep-pop-result-create.component';
import {PrepNormalDetailDataresultComponent} from './prep/detail-dataresult/prep-normal-detail-dataresult.component';
import {PrepPopDetailDataresultComponent} from './prep/detail-dataresult/prep-pop-detail-dataresult.component';
import {PrepDetailLnbComponent} from './prep/component/prep-detail-lnb.component';
import {PrepRnbResultListComponent} from './prep/component/prep-rnb-result-list.component';

const dataPreparationRoutes: Routes = [
    { path: '', component: PrepListComponent },
    { path: 'dataflow', component: PrepListComponent },
    { path: 'dataflow/:id', component: PrepDetailComponent },
    { path: 'dataflow/:dfId/dataset/:dsId', component: PrepDatasetDetailComponent },
    { path: 'dataset/:id', component: PrepDatasetDetailComponent },
    //{ path: 'dataflow/:id', component: DataflowDetail2Component },
    { path: 'dataflow/:dfId/rule/:dsId', component: EditDataflowRule2Component},
    // { path: 'dataset', component: DatasetComponent },
    { path: 'dataset/new', component: DatasetComponent },
    { path: 'datasetdetail/:dsId', component: PrepNormalDetailDatasetComponent },
    { path: 'datasnapshot', component: DataSnapshotComponent },
    { path: 'dataresultdetail/:ssId', component: PrepNormalDetailDataresultComponent },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(dataPreparationRoutes)
  ],
  declarations: [
      EditorComponent,
      PrepbotComponent,
      RuleListComponent,
      RuleContextMenuComponent ,
      MultipleRenamePopupComponent,
      ExtendInputFormulaComponent,
      EditDataflowRule2Component,
      EditRuleGridComponent,
      ScrollLoadingGridComponent,
      RuleJoinPopupComponent,
      RuleUnionPopupComponent,
      UnionAddDatasetsComponent,
      EditRuleAggregateComponent,
      EditRuleCountpatternComponent,
      EditRuleDeleteComponent,
      EditRuleDeriveComponent,
      EditRuleDropComponent,
      EditRuleExtractComponent,
      EditRuleFieldComboComponent,
      EditRuleFlattenComponent,
      EditRuleHeaderComponent,
      EditRuleKeepComponent,
      EditRuleMergeComponent,
      EditRuleMoveComponent,
      EditRuleNestComponent,
      EditRulePivotComponent,
      EditRuleRenameComponent,
      EditRuleReplaceComponent,
      EditRuleSetComponent,
      EditRuleSetformatComponent,
      EditRuleSettypeComponent,
      EditRuleSortComponent,
      EditRuleSplitComponent,
      EditRuleUnnestComponent,
      EditRuleUnpivotComponent,
      EditRuleWindowComponent,
      RuleConditionInputComponent,
      RuleSuggestInputComponent,
      DatasetSummaryComponent,
      LongUpdatePopupComponent,
      RadioSelectDatasetComponent,
      SnapshotLoadingComponent,

      DataSnapshotComponent,
      DataSnapshotDetailComponent,
      DataflowComponent,
      DatasetComponent,
      DatasetDetailComponent,
      CreateDatasetComponent,
      CreateDatasetDataTypeComponent,
      CreateDatasetDbQueryComponent,
      CreateDatasetDbSelectComponent,
      CreateDatasetNameComponent,
      CreateDatasetSelectfileComponent,
      CreateDatasetSelectsheetComponent,
      CreateDatasetSelecturlComponent,
      CreateDataflowNameDescComponent,
      CreateDatasetStagingSelectdataComponent,
      DatasetInfoPopupComponent,
      DataflowDetailComponent,
      DataflowDetail2Component,
      PrepSelectBoxComponent,
      PrepSelectBoxCustomComponent,
      AddDatasetDataflowComponent,
      PrepListComponent,
      PrepDetailComponent,
      PrepDatasetDetailComponent,
      PrepPopCreateComponent,
      PrepPopCreateDatasetNameComponent,
      PrepPopTypeComponent,
      PrepPopDBCreateComponent,
      PrepPopDBQueryComponent,
      PrepPopFileUploadCreateComponent,
      PrepPopFileSelectsheetComponent,
      PrepPopFlowCreateComponent,
      PrepPopDatasetListComponent,
      PrepPopDataflowNameComponent,
      PrepPopConnectionCreateComponent,
      PrepPopConnectionInfoComponent,
      PrepPopConnectionNameComponent,
      PrepPopConnectionUpdateComponent,
      CreateSnapshotPopup,
      PrepRnbRuleComponent,
      PrepRnbRuleListComponent,
      PrepRnbRecommendComponent,
      PrepNormalDetailDatasetComponent,
      PrepPopDetailDatasetComponent,
      PrepPopResultCreateComponent,
      PrepNormalDetailDataresultComponent,
      PrepPopDetailDataresultComponent,
      PrepDetailLnbComponent,
      PrepRnbResultListComponent
  ],
  providers: [
      PrepPopCreateComponent,
      PrepPopFlowCreateComponent,
      PrepPopConnectionCreateComponent,
      PrepbotService,
      PrConnectionService,
      DataflowService,
      DatasetService,
      PrepbotGuard,
      DataflowModelService,
      DataconnectionService,
      StorageService,
      SnapshotService
  ],
  exports: [
  ]
})
export class PrepbotModule { }
