import { Component } from '@angular/core';
import { DialogRef, ModalComponent, CloseGuard } from 'angular2-modal';
import { BSModalContext, BootstrapModalSize } from 'angular2-modal/plugins/bootstrap';
import * as _ from 'underscore';
import { DomSanitizer } from '@angular/platform-browser';
import { message } from '../../clientsSharedModule/Messages'

export class SectionHousesSyncErrorContext extends BSModalContext {
    size: BootstrapModalSize = 'lg';
    sectionHouses: Array<Object> = [];

    constructor() {
        super();
    }
}

@Component({
    selector: 'section-houses-sync-error-modal',
    templateUrl: './sectionHousesSyncErrorModal.component.html',
    styleUrls: ['./sectionHousesSyncErrorModal.component.css'],
})
export class SectionHousesSyncErrorComponent implements ModalComponent<SectionHousesSyncErrorContext>, CloseGuard {
    sectionHouses: any;
    context: SectionHousesSyncErrorContext;

    constructor(public dialog: DialogRef<SectionHousesSyncErrorContext>, public sanitizer: DomSanitizer) {
        this.context = dialog.context;
        dialog.setCloseGuard(this);

        // Init vars
        this.sectionHouses = (_.isEmpty(this.context.sectionHouses) ? [] : this.context.sectionHouses);
    }

    dismiss() {
        this.dialog.close();
    }

    beforeDismiss(): boolean {
        return true;
    }

    beforeClose(): boolean {
        return false;
    }
}
