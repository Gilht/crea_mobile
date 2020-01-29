import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChecklistSectionsPage } from './checklistSections';

// Dependent Services
import { SharedHouseService } from '../../clientsSharedModule/sharedmodule';
import { HouseService } from '../../services/services';

@NgModule({
  declarations: [
    ChecklistSectionsPage,
  ],
  imports: [
    IonicPageModule.forChild(ChecklistSectionsPage),
  ],
  providers: [
    SharedHouseService, HouseService
  ],
  entryComponents: [
    ChecklistSectionsPage,
  ],
})
export class ChecklistSectionsPageModule { }
