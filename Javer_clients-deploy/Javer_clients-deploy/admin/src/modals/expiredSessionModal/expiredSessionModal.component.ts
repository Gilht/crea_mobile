import { Component } from '@angular/core';
import { DialogRef, ModalComponent, CloseGuard } from 'angular2-modal';
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import * as _ from 'underscore';
import { DomSanitizer } from '@angular/platform-browser';
import { message } from '../../clientsSharedModule/Messages'

export class ExpiredSessionContext extends BSModalContext {
    title: string = 'Sesión No Válida';
    message: string = message.token.expired;

    constructor() {
        super();
    }
}

@Component({
    selector: 'expired-session-modal',
    templateUrl: './expiredSessionModal.component.html',
    styleUrls: ['./expiredSessionModal.component.css'],
})
export class ExpiredSessionComponent implements ModalComponent<ExpiredSessionContext>, CloseGuard {
    context: ExpiredSessionContext;

    constructor(public dialog: DialogRef<ExpiredSessionContext>, public sanitizer: DomSanitizer) {
        this.context = dialog.context;
        dialog.setCloseGuard(this);
    }

    accept() {
        this.dialog.close(true);
    }

    beforeDismiss(): boolean {
        return true;
    }

    beforeClose(): boolean {
        return false;
    }
}


