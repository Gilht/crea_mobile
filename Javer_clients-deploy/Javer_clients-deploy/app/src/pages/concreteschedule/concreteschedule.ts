import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Concrete, message, ServiceUtil } from '../../clientsSharedModule/sharedmodule';
import { ConcreteScheduleService, ToastService } from '../../services/services';
import { SynchroController } from '../../offlinecontrollers/offlineControllers';

@IonicPage()
@Component({
  selector: 'page-concreteschedule',
  templateUrl: 'concreteschedule.html',
  providers: [ConcreteScheduleService],
})
export class ConcreteschedulePage {
  resident: any = {};
  loading = false;
  public mask = ServiceUtil.masks.hour;
  subdivisionEmails = [];
  public concretOrder = {
    date: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString(),
    residentName: "",
    subdivision: null,
    concretes: []
  };
  constructor(public navCtrl: NavController, public navParams: NavParams, private concreteScheduleService: ConcreteScheduleService, private toastService: ToastService, private synchroController: SynchroController) {
    this.synchroController.get(this.synchroController.models.subdivisionEmail).then(res => {
      this.subdivisionEmails = res || [];
    });
    this.synchroController.get(this.synchroController.models.resident).then(res => {
      this.resident = res || [];
      this.concretOrder.residentName = (this.resident ? this.resident.workName + ' ' + this.resident.lastName + ' ' + this.resident.lastNameMother : localStorage.getItem('CurrentUser'));
    });
  }

  hasWritePermission() {
    return !ServiceUtil.getIsAuditor();
  }

  addRow() {
    var concrete = new Concrete();
    this.concretOrder.concretes.push(concrete);
  }

  deleteRow(i: number) {
    this.concretOrder.concretes.splice(i, 1);
  }

  sendReport() {

    if (!this.concretOrder.subdivision) {
      this.toastService.presentToast("Seleccione Fraccionamiento.", this.toastService.types.error);
      return;
    }
    this.loading = true;
    this.concreteScheduleService.setOrder(this.concretOrder)
      .subscribe(
        result => {
          this.loading = false;
          this.navCtrl.setRoot("CorePage");
          this.toastService.presentToast("El correo se ha enviado correctamente.", this.toastService.types.success);
        },
        error => {
          this.toastService.presentToast(message.error, this.toastService.types.error);
        });
  }
}
