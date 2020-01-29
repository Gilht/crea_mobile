import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EstimationsPage } from './estimations';
import { TooltipsModule } from 'ionic-tooltips';
@NgModule({
  declarations: [
    EstimationsPage,
  ],
  imports: [
    IonicPageModule.forChild(EstimationsPage),
    TooltipsModule
  ],
  entryComponents: [
    EstimationsPage,
  ],
})
export class EstimationsPageModule { }
