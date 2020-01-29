import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DoChecklistPage } from './doChecklist';

// Dependent Services
import { SharedHouseService } from '../../clientsSharedModule/sharedmodule';
import { HouseService } from '../../services/services';

@NgModule({
  declarations: [
    DoChecklistPage
  ],
  imports: [
    IonicPageModule.forChild(DoChecklistPage)
  ],
  providers: [
    SharedHouseService, HouseService
  ],
  entryComponents: [
    DoChecklistPage
  ],
})
export class DoChecklistPageModule { }
