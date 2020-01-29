import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { DialogRef, ModalComponent } from 'angular2-modal';
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import * as _ from 'underscore';

export class ImageViewModalComponentContext extends BSModalContext {
    public msj: string;
    public type: any;
    constructor() { super(); }
}

@Component({
    selector: 'image-view-modal',
    templateUrl: './imageViewModal.component.html',
    styleUrls: ['./imageViewModal.component.css'],
})

export class ImageViewModalComponent implements ModalComponent<ImageViewModalComponentContext> {
    context: ImageViewModalComponentContext;

    constructor(public dialog: DialogRef<ImageViewModalComponentContext>) {
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


