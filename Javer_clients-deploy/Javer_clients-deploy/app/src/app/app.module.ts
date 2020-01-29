import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';
import { httpInterceptorProviders } from '../http-interceptors'
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SharedModule } from './shared.module';
import { InputModalPage } from '../modals/inputModal/inputModal';
import { CameraModalPage } from '../modals/cameraModal/cameraModal';
import { SignatureModalPage } from '../modals/signatureModal/signatureModal';
import { ExpiredSessionModalPage } from '../modals/expiredSessionModal/expiredSessionModal';
import { SignaturePadModule } from 'angular2-signaturepad';
import { IonicStorageModule } from '@ionic/storage';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MailModalPage } from '../modals/mailModal/mailModal';
import { NotificationModalPage } from '../modals/notificationModal/notificationModal';
import { PolicyAgreementModalPage } from '../modals/policyAgreementModal/policyAgreementModal';
import { ToastService } from '../services/toast.service';
import { SharedService } from '../services/shared.service'
import { SynchroController, HouseController, TemplateController, EstimateController } from '../offlinecontrollers/offlineControllers';
import { ConfirmModalPage } from '../modals/confirmModal/confirmModal';
import { ListModalPage } from '../modals/listModal/listModal';
import { UploadModalPage } from '../modals/uploadModal/uploadModal';
import { AlertModalPage } from '../modals/alertModal/alertModal';
import { LivingPlaceTypeModalPage } from '../modals/livingPlaceTypeModal/livingPlaceTypeModal';
import { SectionHousesSyncErrorModalPage } from '../modals/sectionHousesSyncErrorModal/sectionHousesSyncErrorModal';

@NgModule({
  declarations: [
    MyApp,
    InputModalPage,
    CameraModalPage,
    NotificationModalPage,
    PolicyAgreementModalPage,
    MailModalPage,
    ListModalPage,
    ConfirmModalPage,
    SignatureModalPage,
    UploadModalPage,
    AlertModalPage,
    ExpiredSessionModalPage,
    LivingPlaceTypeModalPage,
    SectionHousesSyncErrorModalPage
  ],
  imports: [
    BrowserModule,
    SharedModule,
    SignaturePadModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    InputModalPage,
    CameraModalPage,
    UploadModalPage,
    NotificationModalPage,
    PolicyAgreementModalPage,
    MailModalPage,
    ListModalPage,
    ConfirmModalPage,
    SignatureModalPage,
    AlertModalPage,
    ExpiredSessionModalPage,
    LivingPlaceTypeModalPage,
    SectionHousesSyncErrorModalPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    Push,
    SynchroController,
    TemplateController,
    HouseController,
    EstimateController,
    ToastService,
    // "httpInterceptorProviders" has a dependency on "SharedService" so the order is important
    SharedService,
    httpInterceptorProviders
  ]
})
export class AppModule { }
