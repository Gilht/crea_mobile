import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BlueprintsIndexPage } from './blueprints-index';

@NgModule({
  declarations: [
    BlueprintsIndexPage,
  ],
  imports: [
    IonicPageModule.forChild(BlueprintsIndexPage),
  ],
  entryComponents: [
    BlueprintsIndexPage,
  ]
})
export class BlueprintsIndexPageModule { }
