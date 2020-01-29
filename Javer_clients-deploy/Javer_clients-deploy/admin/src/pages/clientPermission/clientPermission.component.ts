import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Optional } from "@angular/core";
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../util/AppConfig';
import * as _ from 'underscore';
import { ToastOptions, ToastyService } from 'ng2-toasty';
import { Overlay, overlayConfigFactory } from 'angular2-modal';
import { BSModalContext, Modal } from 'angular2-modal/plugins/bootstrap';
import { DeleteComponentContext, DeleteComponent } from '../../modals/deletemodal/deletemodal.component';
import { ClientPermissionService, MyToastyService } from '../../services/services';

@Component({
    selector: 'clientPermission',
    templateUrl: ('./clientPermission.component.html'),
    styleUrls: ['./clientPermission.component.css'],
    providers: [ClientPermissionService, MyToastyService]
})
export class ClientPermissionComponent {
    switchPagination: boolean;
    dataToShow: any;
    filter: any = {
        clientPermission: ""
    };
    _originalData: any;
    clientPermissions: any;
    loading = true;
    currentPage: number = 1;
    access = localStorage.getItem('access');
    AppConfig = AppConfig;
    constructor(private route: ActivatedRoute, private router: Router, private clientPermissionService: ClientPermissionService, public modal: Modal, private vcRef: ViewContainerRef, private toastService: MyToastyService) {
        modal.overlay.defaultViewContainer = vcRef;
    }

    ngOnInit() {
        this.getClientPermissions();
    }

    getClientPermissions() {
        this.clientPermissionService.getClientPermissions().subscribe(
            result => {
                this.loading = false;
                this._originalData = result;
                this.dataToShow = result;
                this.dataToShow = _.sortBy(this.dataToShow, function (cli) { return cli.name.toLowerCase(); });
                this.pageChanged({ page: 1, itemsPerPage: 20 });
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                    this.toastService.addToast("Ha ocurrido un problema al pedir los permisos.", this.toastService.toastyType.error)
            }
        );
    }

    deleteClientPermission(clientPermission) {
        this.clientPermissionService.deleteClientPermission(clientPermission.id).subscribe(
            result => {
                this.toastService.addToast("la categoría " + clientPermission.name + " ha sido borrada correctamente.", this.toastService.toastyType.success)
                this.getClientPermissions();
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                    this.toastService.addToast("Ha ocurrido un problema al eliminar los permisos.", this.toastService.toastyType.error)
            }
        );
    }

    configureNewClientPermission() {
        this.router.navigateByUrl('/app/clientPermission/create');
    }


    cleanFilters() {
        this.filter = {
            clientPermission: ""
        };
        this.filterClientPermissions();
    }

    filterClientPermissions() {
        this.dataToShow = this._originalData;
        if (this.filter.clientPermission && this.filter.clientPermission.length) {
            this.dataToShow = this.dataToShow
                .filter(x => x.name.toLowerCase().indexOf(this.filter.clientPermission.toLowerCase()) > -1);
        }
        this.pageChanged({ page: 1, itemsPerPage: 20 });
        this.switchPagination = !this.switchPagination;
    }


    public pageChanged(evt) {
        let page = evt.page - 1;
        this.clientPermissions = this.dataToShow.slice(page * 20, page * 20 + evt.itemsPerPage);
    }

    deleteClientPermissionModal(clientPermission) {
        let context = new DeleteComponentContext();
        this.modal.overlay.defaultViewContainer = this.vcRef;
        var that = this;
        this.modal.open(DeleteComponent, overlayConfigFactory({ msj: 'Seguro que deseas eliminar el permiso ' + '"' + clientPermission.name + '"' + '?' }, BSModalContext))
            .then(function (x) {
                var those = that;
                x.result
                    .then(function (result) {
                        if (result) {
                            that.deleteClientPermission(clientPermission);
                        }
                    });
            });

    }
}
