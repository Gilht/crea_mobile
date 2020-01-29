import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AssignedResidencyPage } from './assigned-residency';

// Dependent Services
import { SharedHouseService } from '../../clientsSharedModule/sharedmodule';
import { HouseService } from '../../services/services';

@NgModule({
  declarations: [
    AssignedResidencyPage,
  ],
  imports: [
    IonicPageModule.forChild(AssignedResidencyPage)
  ],
  providers: [
    SharedHouseService, HouseService
  ],
  entryComponents: [
    AssignedResidencyPage
  ],
})
export class AssignedResidencyPageModule { }
