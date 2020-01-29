import { Component } from '@angular/core';
import { DialogRef, ModalComponent, CloseGuard } from 'angular2-modal';
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import * as _ from 'underscore';
import { DomSanitizer } from '@angular/platform-browser';
import { message } from '../../clientsSharedModule/Messages'

export class PolicyAgreementContext extends BSModalContext {
    policy: any = null;
    version: string = '';
    title: string = '';
    content: string = '';
    userStatement: string = '';
    accepted: boolean = false;

    constructor() {
        super();
    }
}

@Component({
    selector: 'policy-agreement-modal',
    templateUrl: './policyAgreementModal.component.html',
    styleUrls: ['./policyAgreementModal.component.css'],
})
export class PolicyAgreementComponent implements ModalComponent<PolicyAgreementContext>, CloseGuard {
    policy: any;
    context: PolicyAgreementContext;

    constructor(public dialog: DialogRef<PolicyAgreementContext>, public sanitizer: DomSanitizer) {
        this.context = dialog.context;
        dialog.setCloseGuard(this);

        // Init vars
        this.policy = (_.isEmpty(this.context.policy) ? null : this.context.policy);
        this.context.accepted = false;

        if (this.policy) {
          this.context.version = this.policy.version;
          this.context.title = this.policy.title;
          this.context.userStatement = this.policy.userStatement;
          this.context.content = this.policy.content;
        }
    }

    dismiss() {
        this.dialog.close({
            policyAccepted: this.context.accepted
        });
    }

    beforeDismiss(): boolean {
        return true;
    }

    beforeClose(): boolean {
        return false;
    }
}
