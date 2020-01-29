
import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { MenuController } from 'ionic-angular/components/app/menu-controller';
import { AssignedResidencyPage } from '../assigned-residency/assigned-residency';
import { EstimationsPage } from '../estimations/estimations';
import { BlueprintsIndexPage } from '../blueprints-index/blueprints-index';
import { ActivityrecordPage } from '../activityrecord/activityrecord';
import { ConcreteschedulePage } from '../concreteschedule/concreteschedule';
import { GoalsPage } from '../goals/goals';
import { SharedService } from '../../services/services';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { LoginService, ToastService } from '../../services/services';
import { ServiceUtil } from '../../clientsSharedModule/ServiceUtil';
import { Resident, message, SessionStatus } from '../../clientsSharedModule/sharedmodule';
import { NotificationModalPage } from '../../modals/notificationModal/notificationModal';
import { ExpiredSessionModalPage } from '../../modals/expiredSessionModal/expiredSessionModal';
import { SynchroController } from '../../offlinecontrollers/offlineControllers';
import { ConfirmModalPage } from '../../modals/confirmModal/confirmModal';
import * as _ from "lodash";
import { UploadModalPage } from '../../modals/uploadModal/uploadModal';
import { SectionHousesSyncErrorModalPage } from '../../modals/sectionHousesSyncErrorModal/sectionHousesSyncErrorModal';

@IonicPage()
@Component({
  selector: 'page-core',
  templateUrl: 'core.html',
  providers: [LoginService, SharedService]
})
export class CorePage {
  assignedResidencyPage: any = AssignedResidencyPage;
  blueprintsIndexPage: any = BlueprintsIndexPage;
  estimationsPage: any = EstimationsPage;
  activityrecordPage: any = ActivityrecordPage;
  concreteschedulePage: any = ConcreteschedulePage;
  goalsPage: any = GoalsPage;
  sectionCounter = 0;
  sectionTotal = 0;
  mailCounter = 0;
  totalMails = 0;
  public loading = false;
  subscription: any;
  unauthorizedSubscription: any;
  sectionHousesSyncErrorSubscription: any;
  online = false;
  sessionStatus: SessionStatus;
  sectionHousesSyncError: any;
  lastOnlineStatus: boolean = false;
  displayingSyncModal: boolean = false;
  displayingSectionHousesSyncErrorModal: boolean = false;
  resident: any;
  options: PushOptions = {
    android: {},
    ios: {
      alert: 'true',
      badge: true,
      sound: 'false'
    },
    windows: {},
    browser: {
      pushServiceURL: 'http://push.api.phonegap.com/v1/push'
    }
  };
  pushObject: PushObject;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public menu: MenuController,
    private push: Push,
    private loginService: LoginService,
    private toastService: ToastService,
    public modalCtrl: ModalController,
    private sharedService: SharedService,
    private synchroController: SynchroController,
    private zone: NgZone
  ) {

    this.menu.enable(true);
    this.pushObject = this.push.init(this.options);

  }

  ionViewDidLoad() {
    this.menu.enable(true);
    this.menu.swipeEnable(true);
    this.online = this.sharedService.getOnline();
    this.sectionHousesSyncError = this.sharedService.getSectionHousesSyncError();

    this.unauthorizedSubscription = this.sharedService.sessionStatusObs$.subscribe(
      status => {
        this.sessionStatus = status;
        if (!this.sharedService.isValidSession()) {
          this.unauthorizedModal();
        }
      }
    );

    this.subscription = this.sharedService.response$.subscribe(
      conn => {
        this.lastOnlineStatus = (this.online != null ? this.online : false);
        this.online = conn;
        this.zone.run(() => { });

        if (this.sessionStatus == SessionStatus.Valid && !this.displayingSyncModal && this.online && (!this.lastOnlineStatus || this.navParams.get('cameFromLogin') || this.navParams.get('cameFromMenu'))) {
          // This variables are mean to contain a value only when this view enters
          // due to this modal shows up on every page in the ionic history, which is not good
          this.navParams.data['cameFromLogin'] = null;
          this.navParams.data['cameFromMenu'] = null;
          this.displayingSyncModal = true;
          this.syncModal();
        }
      }
    );

    this.sectionHousesSyncErrorSubscription = this.sharedService.sectionHousesSyncError$.subscribe(
      errorObj => {
        this.sectionHousesSyncError = errorObj;

        if (!this.displayingSectionHousesSyncErrorModal && this.sectionHousesSyncError.hasError) {
          this.zone.run(() => {
            this.displayingSectionHousesSyncErrorModal = true;
          });
          this.sectionHousesSyncErrorModal(this.sectionHousesSyncError.response);
        }
      }
    );

    this.synchroController.get(this.synchroController.models.resident).then(result => {
      this.resident = result;
      this.push.hasPermission()
        .then((res: any) => {
          if (res.isEnabled) {
            this.pushObject = this.push.init(this.options);
            // Notifications are allowed
            this.pushObject.on('notification').subscribe((notification: any) => {
              // Receiving Notifications
              if (notification.additionalData.foreground) {
                this.notificationModal(notification.title, notification.message);
              }
            });
            this.pushObject.on('registration').subscribe((registration: any) => this.setNotificationId(registration));
            this.pushObject.on('error').subscribe(error => {
              this.toastService.presentToast(message.notification.send.error, this.toastService.types.error);
            });
          } else {
            this.toastService.presentToast(message.notification.permission.error, this.toastService.types.error);
          }
        });
    }).catch(error => {
      this.toastService.presentToast(message.error, this.toastService.types.error);
    });

  }

  syncModal() {
    let modal = this.modalCtrl.create(ConfirmModalPage, { message: message.sync.question }, { cssClass: 'notification-modal' });

    modal.onDidDismiss(data => {
      if (data) {
        this.loading = true;
        this.synchroController.get(this.synchroController.models.resident).then(res => {
          this.loading = false;
          if (!res) {
            return;
          }
          this.uploadModal(res.login);
        })
      }

      this.displayingSyncModal = false;
    });
    modal.present();
  }

  uploadModal(login: string) {
    let modal = this.modalCtrl.create(UploadModalPage, { login: login }, { cssClass: 'upload-modal', enableBackdropDismiss: false });

    modal.onDidDismiss(data => {
      if (data) {
        this.downloadInfo(login);
      }
    });

    modal.present();
  }

  notificationModal(title: string, message: string) {
    let modal = this.modalCtrl.create(NotificationModalPage, { title: title, message: message }, { cssClass: 'notification-modal' });
    modal.present();
  }

  unauthorizedModal() {
    const modal = this.modalCtrl.create(ExpiredSessionModalPage, { title: 'Sesión No Válida', message: message.token.expired }, { cssClass: 'unauthorized-modal', enableBackdropDismiss: false });
    modal.onDidDismiss((data) => {
      this.menu.enable(false);
      this.navCtrl.setRoot("LoginPage");
    });
    modal.present();
  }

  sectionHousesSyncErrorModal(sectionHouses) {
    const modal = this.modalCtrl.create(SectionHousesSyncErrorModalPage, { sectionHouses }, {cssClass: 'section-houses-sync-error-modal-page'});
    modal.onDidDismiss((data) => {
      this.displayingSectionHousesSyncErrorModal = false;
    });
    modal.present();
  }

  // Page Selector
  onGoToPage(page: string) {
    if (page == 'assignedResidencyPage') { this.navCtrl.push("AssignedResidencyPage"); }
    if (page == 'blueprintsIndexPage') { this.navCtrl.push("BlueprintsIndexPage"); }
    if (page == 'estimationsPage') { this.navCtrl.push("EstimateSearchPage"); }
    if (page == 'workProgramReportListPage') { this.navCtrl.push("WorkProgramReportListPage"); }
    if (page == 'concreteschedulePage') { this.navCtrl.push("ConcreteschedulePage"); }

  }

  ionViewWillUnload() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    if (this.unauthorizedSubscription) {
      this.unauthorizedSubscription.unsubscribe();
    }

    if (this.sectionHousesSyncErrorSubscription) {
      this.sectionHousesSyncErrorSubscription.unsubscribe();
    }
  }
  setNotificationId(notificationId: any) {
    let data = {
      login: this.resident.login,
      notificationId: notificationId
    }
    this.loginService.setNotification(data).subscribe();
  }



  downloadInfo(login) {
    this.loading = true;
    this.synchroController.download(login).then(x => {
      this.loading = false;
      this.toastService.presentToast(message.download.success, this.toastService.types.success);
    }).catch(error => {
      this.toastService.presentToast(message.error, this.toastService.types.error);
      this.loading = false;
    });
  }

}
