import { Component } from '@angular/core';
import { App, ViewController, NavParams } from 'ionic-angular';
import { SynchroController } from '../../offlinecontrollers/synchroController';
import { ToastService, SharedService } from '../../services/services';
import { ApiErrorCodes } from '../../clientsSharedModule/sharedmodule';
import * as _ from "lodash";

@Component({
    selector: 'page-livingPlaceTypeModal',
    templateUrl: 'livingPlaceTypeModal.html'
})
export class LivingPlaceTypeModalPage {

    selectedType: string = 'DTU';

    constructor(
      public viewCtrl: ViewController,
    ) {

    }

    dismiss() {
      this.viewCtrl.dismiss(this.selectedType);
    }
}
