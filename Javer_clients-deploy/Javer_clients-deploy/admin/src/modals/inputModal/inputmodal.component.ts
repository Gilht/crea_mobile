import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { DialogRef, ModalComponent } from 'angular2-modal';
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import * as _ from 'underscore';

export class InputModalComponentContext extends BSModalContext {
    public msj: string;
    constructor() { super(); }
}

@Component({
    selector: 'input-modal',
    templateUrl: './inputmodal.component.html',
    styleUrls: ['./inputmodal.component.css']
    //providers: [SelectService]
})

export class InputModalComponent implements ModalComponent<InputModalComponentContext> {
    context: InputModalComponentContext;
    comment: string = ''
    constructor(public dialog: DialogRef<InputModalComponentContext>) {
        this.context = dialog.context;
        this.context.keyboard = null;
        this.context.showClose = true;
    }

    closeNot() {
        this.dialog.close(false);
    }

    closeOk() {
        this.dialog.close(this.comment);
    }
}


