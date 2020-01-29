import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Optional } from "@angular/core";
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../util/AppConfig';
import * as _ from 'underscore';
import { ToastOptions, ToastyService } from 'ng2-toasty';
import { Overlay, overlayConfigFactory } from 'angular2-modal';
import { BSModalContext, Modal } from 'angular2-modal/plugins/bootstrap';
import { DeleteComponentContext, DeleteComponent } from '../../modals/deletemodal/deletemodal.component';
import { ResourcePermissionService, MyToastyService } from '../../services/services';

@Component({
    selector: 'resourcePermission',
    templateUrl: ('./resourcePermission.component.html'),
    styleUrls: ['./resourcePermission.component.css'],
    providers: [ResourcePermissionService, MyToastyService]
})
export class ResourcePermissionComponent {
    switchPagination: boolean;
    dataToShow: any;
    filter: any = {
        resourcePermission: ""
    };
    _originalData: any;
    resourcePermissions: any;
    loading = true;
    currentPage: number = 1;
    access = localStorage.getItem('access');
    AppConfig = AppConfig;
    constructor(private route: ActivatedRoute, private router: Router, private resourcePermissionService: ResourcePermissionService, public modal: Modal, private vcRef: ViewContainerRef, private toastService: MyToastyService) {
        modal.overlay.defaultViewContainer = vcRef;
    }

    ngOnInit() {
        this.getResourcePermissions();
    }

    getResourcePermissions() {
        this.resourcePermissionService.getResourcePermissions().subscribe(
            result => {
                this.loading = false;
                this._originalData = result;
                this.dataToShow = result;
                this.dataToShow = _.sortBy(this.dataToShow, function (reso) { return reso.name.toLowerCase(); });
                this.pageChanged({ page: 1, itemsPerPage: 20 });
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                    this.toastService.addToast("Ha ocurrido un problema al pedir los recursos.", this.toastService.toastyType.error)
            }
        );
    }

    deleteResourcePermission(resourcePermission) {
        this.resourcePermissionService.deleteResourcePermission(resourcePermission.id).subscribe(
            result => {
                this.toastService.addToast("El recurso " + resourcePermission.name + " ha sido borrada correctamente.", this.toastService.toastyType.success)
                this.getResourcePermissions();
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                    this.toastService.addToast("Ha ocurrido un problema al pedir los recursos.", this.toastService.toastyType.error)
            }
        );
    }

    configureNewResourcePermission() {
        this.router.navigateByUrl('/app/resourcePermission/create');
    }


    cleanFilters() {
        this.filter = {
            resourcePermission: ""
        };
        this.filterResourcePermissions();
    }

    filterResourcePermissions() {
        this.dataToShow = this._originalData;
        if (this.filter.resourcePermission && this.filter.resourcePermission.length) {
            this.dataToShow = this.dataToShow
                .filter(x => x.name.toLowerCase().indexOf(this.filter.resourcePermission.toLowerCase()) > -1);
        }
        this.pageChanged({ page: 1, itemsPerPage: 20 });
        this.switchPagination = !this.switchPagination;
    }


    public pageChanged(evt) {
        let page = evt.page - 1;
        this.resourcePermissions = this.dataToShow.slice(page * 20, page * 20 + evt.itemsPerPage);
    }

    deleteResourcePermissionModal(resourcePermission) {
        let context = new DeleteComponentContext();
        this.modal.overlay.defaultViewContainer = this.vcRef;
        var that = this;
        this.modal.open(DeleteComponent, overlayConfigFactory({ msj: 'Seguro que deseas eliminar el recuerso ' + '"' + resourcePermission.name + '"' + '?' }, BSModalContext))
            .then(function (x) {
                var those = that;
                x.result
                    .then(function (result) {
                        if (result) {
                            that.deleteResourcePermission(resourcePermission);
                        }
                    });
            });

    }
}
