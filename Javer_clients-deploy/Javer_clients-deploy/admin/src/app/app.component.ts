import { Component, ViewContainerRef } from '@angular/core';
import { Router, NavigationExtras} from '@angular/router';
import { SharedService } from '../services/shared.service';
import { SessionStatus } from '../clientsSharedModule/Enums'

import { Overlay, overlayConfigFactory } from 'angular2-modal';
import { Modal, BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { ExpiredSessionComponent, ExpiredSessionContext } from '../modals/expiredSessionModal/expiredSessionModal.component';

import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [Modal]
})
export class AppComponent {
  title = 'app';
  isActiveExpiredSessionDialog: boolean = false;
  sessionStatus: SessionStatus;
  sessionStatusSubscription: Subscription;

  constructor(
    private sharedService: SharedService,
    private modal: Modal,
    private vcRef: ViewContainerRef,
    private router: Router
  ) {
    this.modal.overlay.defaultViewContainer = this.vcRef;
  }

  ngOnInit() {
    this.sessionStatusSubscription = this.sharedService.sessionStatusObs$.subscribe(
      status => {
        this.sessionStatus = status;

        if (status == SessionStatus.Expired) {
          this.showExpiredSessionDialog();
        }
      }
    );
  }

  showExpiredSessionDialog() {
    if (!this.isActiveExpiredSessionDialog) {
      this.modal.open(ExpiredSessionComponent, overlayConfigFactory({}, ExpiredSessionContext))
      .then((dref) => dref.result)
      .then((result) => {
        this.isActiveExpiredSessionDialog = false;

        localStorage.clear();

        let navigationExtras: NavigationExtras = { replaceUrl: true };
        this.router.navigate(['/login'], navigationExtras);
      });

      this.isActiveExpiredSessionDialog = true;
    }
  }


}
