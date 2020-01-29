import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ConcreteschedulePage } from './concreteschedule';
import { TextMaskModule } from 'angular2-text-mask';
@NgModule({
  declarations: [
    ConcreteschedulePage,
  ],
  imports: [
    IonicPageModule.forChild(ConcreteschedulePage),
    TextMaskModule,
  ],
})
export class ConcreteschedulePageModule { }
