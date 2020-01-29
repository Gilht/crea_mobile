import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { DialogRef, ModalComponent } from 'angular2-modal';
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import * as _ from 'underscore';

export class DeleteComponentContext extends BSModalContext {
    public msj: string;
    constructor() { super(); }
}

@Component({
    selector: 'delete-modal',
    templateUrl: './deletemodal.component.html'
    //providers: [SelectService]
})

export class DeleteComponent implements ModalComponent<DeleteComponentContext> {
    context: DeleteComponentContext;

    constructor(public dialog: DialogRef<DeleteComponentContext>) {
        this.context = dialog.context;
        this.context.keyboard = null;
        this.context.showClose = true;
    }

    closeNot() {
        this.dialog.close(false);
    }

    closeOk() {
        this.dialog.close(true);
    }
}


