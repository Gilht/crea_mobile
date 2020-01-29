import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MainMenuPage } from './main-menu';

@NgModule({
  declarations: [
    MainMenuPage,
  ],
  imports: [
    IonicPageModule.forChild(MainMenuPage),
  ],
  entryComponents: [
    MainMenuPage,
  ],
})
export class MainMenuPageModule { }
