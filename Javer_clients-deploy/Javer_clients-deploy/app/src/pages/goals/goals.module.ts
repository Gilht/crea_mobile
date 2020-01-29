import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GoalsPage } from './goals';

@NgModule({
  declarations: [
    GoalsPage,
  ],
  imports: [
    IonicPageModule.forChild(GoalsPage),
  ],
  entryComponents: [
    GoalsPage,
  ],
})
export class GoalsPageModule { }
