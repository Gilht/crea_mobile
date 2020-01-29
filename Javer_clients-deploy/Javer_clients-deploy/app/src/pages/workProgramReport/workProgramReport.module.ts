import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WorkProgramReportPage } from './workProgramReport';
import { TooltipsModule } from 'ionic-tooltips';
@NgModule({
    declarations: [
        WorkProgramReportPage,
    ],
    imports: [
        IonicPageModule.forChild(WorkProgramReportPage),
        TooltipsModule
    ],
    entryComponents: [
        WorkProgramReportPage,
    ],
})
export class WorkProgramReportPageModule { }
