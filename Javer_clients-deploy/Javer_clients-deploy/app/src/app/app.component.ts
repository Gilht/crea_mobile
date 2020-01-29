import { Component, ViewChild, NgZone } from '@angular/core';
import { Nav, Platform, MenuController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { LoginPage } from '../pages/login/login';
import { CorePage } from '../pages/core/core';
import { AssignedResidencyPage } from '../pages/assigned-residency/assigned-residency';
import { BlueprintsIndexPage } from '../pages/blueprints-index/blueprints-index';
import { EstimationsPage } from '../pages/estimations/estimations';
import { ActivityrecordPage } from '../pages/activityrecord/activityrecord';
import { ConcreteschedulePage } from '../pages/concreteschedule/concreteschedule';
import { GoalsPage } from '../pages/goals/goals';
import { Keyboard } from '@ionic-native/keyboard';
import { Network } from '@ionic-native/network';
import { SharedService } from '../services/services';

@Component({
  templateUrl: 'app.html',
  providers: [Keyboard, Network, SharedService]
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = "LoginPage";

  pages: Array<{ title: string, icon: string, component: any }>;
  login: any = LoginPage;
  assignedResidencyPage: any = AssignedResidencyPage;
  blueprintsIndexPage: any = BlueprintsIndexPage;
  estimationsPage: any = EstimationsPage;
  activityrecordPage: any = ActivityrecordPage;
  concreteschedulePage: any = ConcreteschedulePage;
  goalsPage: any = GoalsPage;
  online = false;
  isValidSession: boolean = false;
  corePage: any = CorePage;
  disconnectSubscription: any;
  connectSubscription: any;
  unauthorizedSubscription: any;

  constructor(public platform: Platform, private zone: NgZone, private sharedService: SharedService, private keyboard: Keyboard, private network: Network, public statusBar: StatusBar, public splashScreen: SplashScreen, public menu: MenuController) {
    this.initializeApp();

    this.keyboard.hideKeyboardAccessoryBar(false);
    this.resizeMenu();
    this.isConnected();
    this.watchConnection();
    this.watchDisconnection();
  }
  resizeMenu() {
    if (!this.online) {
      this.pages = [
        { title: 'Viviendas Asignadas', icon: 'md-home', component: "AssignedResidencyPage" },
        { title: 'Estimaciones', icon: 'ios-calculator', component: "EstimateSearchPage" },
      ]
    }
    else {
      this.pages = [
        { title: 'Viviendas Asignadas', icon: 'md-home', component: "AssignedResidencyPage" },
        { title: 'Índice de Planos', icon: 'document', component: "BlueprintsIndexPage" },
        { title: 'Estimaciones', icon: 'ios-calculator', component: "EstimateSearchPage" },
        { title: 'Reporte de Programa de Obra', icon: 'md-book', component: "WorkProgramReportListPage" },
        { title: 'Programar Concretos', icon: 'md-calendar', component: "ConcreteschedulePage" },
      ];
    }
    this.zone.run(() => { });
  }

  watchConnection() {
    this.connectSubscription = this.network.onConnect().subscribe(() => {
      this.online = true;
      this.resizeMenu();
      this.sharedService.response(true);
    });
  }
  watchDisconnection() {
    this.disconnectSubscription = this.network.onDisconnect().subscribe(() => {
      this.online = false;
      this.resizeMenu();
      this.sharedService.response(false);
    });
  }
  isConnected() {
    if (this.network.type !== 'none') {
      this.online = true;
      this.resizeMenu();
      this.sharedService.response(true);
    }
    else {
      this.online = false;
      this.resizeMenu();
      this.sharedService.response(false);
    }
    this.resizeMenu();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.

      // Wait for angular to load
      window.setTimeout(() => {
          this.splashScreen.hide();
      }, 300);

      this.statusBar.styleDefault();
      this.isValidSession = this.sharedService.isValidSession();

    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  onGotoPage(option: string = null) {
    /*if (option == 'assignedResidencyPage') this.nav.push("AssignedResidencyPage");
    if (option == 'blueprintsIndexPage') this.nav.push("BlueprintsIndexPage");
    if (option == 'estimationsPage') this.nav.push("EstimateSearchPage");
    if (option == 'workProgramReportListPage') this.nav.push("WorkProgramReportListPage");
    if (option == 'concreteschedulePage') this.nav.push("ConcreteschedulePage");*/
    if (option == 'corePage') this.nav.setRoot("CorePage", { cameFromMenu: true });
    if (option == 'login') {
      this.menu.enable(false);
      this.nav.setRoot("LoginPage");
    }
  }
}
