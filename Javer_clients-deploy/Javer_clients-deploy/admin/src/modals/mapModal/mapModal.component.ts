import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { DialogRef, ModalComponent } from 'angular2-modal';
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import * as _ from 'underscore';
import { DomSanitizer } from '@angular/platform-browser';

export class MapComponentContext extends BSModalContext {
    public latitude: any = "";
    public longitude: any = "";
    constructor() { super(); }
}

@Component({
    selector: 'map-modal',
    templateUrl: './mapModal.component.html',
    styleUrls: ['./mapModal.component.css'],
})

export class MapComponent implements ModalComponent<MapComponentContext> {
    context: MapComponentContext;
    map: any;
    constructor(public dialog: DialogRef<MapComponentContext>, public sanitizer: DomSanitizer) {
        this.context = dialog.context;
        this.context.keyboard = null;
        this.context.showClose = true;
        this.map = this.sanitizer.bypassSecurityTrustResourceUrl("https://www.google.com/maps/embed/v1/place?q=" + this.context.latitude +
            "+" + this.context.longitude + "&key=AIzaSyD_FBHdh8IjoS-TL4Jc3Qh-Mqu_wKuJoLw");
    }
    closeOk() {
        this.dialog.close(true);
    }
}


