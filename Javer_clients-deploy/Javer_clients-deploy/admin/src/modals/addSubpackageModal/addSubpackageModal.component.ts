import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { DialogRef, ModalComponent } from 'angular2-modal';
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import * as _ from 'underscore';
import { SubpackageService, MyToastyService } from '../../services/services';
import { message } from '../../clientsSharedModule/sharedmodule';
import { ServiceUtil } from '../../clientsSharedModule/ServiceUtil'

export class AddSubpackageComponentContext extends BSModalContext {
    public package: any;
    constructor() { super(); }
}

@Component({
    selector: 'addSubpackage-modal',
    templateUrl: './addSubpackageModal.component.html',
    styleUrls: ['addSubpackageModal.component.css'],
    providers: [SubpackageService]
})

export class AddSubpackageComponent implements ModalComponent<AddSubpackageComponentContext> {
    context: AddSubpackageComponentContext;
    subpackages: any = [];
    newSubpackage: any = {};
    showNew: boolean = false;
    constructor(public dialog: DialogRef<AddSubpackageComponentContext>, private subpackageService: SubpackageService, private toastService: MyToastyService) {
        this.context = dialog.context;
        this.context.keyboard = null;
        this.context.showClose = true;

    }
    ngOnInit() {
        this.getSubpackages();
    }


    getSubpackages() {
        this.subpackageService.getSubpackages().subscribe(
            result => {
                this.subpackages = result;

                this.subpackages = this.subpackages.filter(x => (!(this.context.package.subpackages.some(y => x.id == y.subpackageId))) && x.packageId == this.context.package.packageId && x.main == true);
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                    this.toastService.addToast(message.subpackage.list.error, this.toastService.toastyType.error);
            }
        )
    }
    addNewSubpackage() {
        this.newSubpackage.packageId = this.context.package.packageId;
        this.subpackageService.createSubpackage(this.newSubpackage).subscribe(
            result => {
                _.extend(this.newSubpackage, result);
                this.dialog.close(this.newSubpackage);
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                    this.toastService.addToast(message.subpackage.create.error, this.toastService.toastyType.error);
            }
        );


    }
    selectSubpackage(subpackage) {
        this.dialog.close(subpackage);
    }

    closeModal() {
        this.dialog.close();
    }

    validateNumber = ServiceUtil.validateNumber;
}
