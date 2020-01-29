import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WorkProgramReportListPage } from './workProgramReportList';
import { TooltipsModule } from 'ionic-tooltips';
@NgModule({
    declarations: [
        WorkProgramReportListPage,
    ],
    imports: [
        IonicPageModule.forChild(WorkProgramReportListPage),
        TooltipsModule
    ],
    entryComponents: [
        WorkProgramReportListPage,
    ],
})
export class WorkProgramReportListPageModule { }
