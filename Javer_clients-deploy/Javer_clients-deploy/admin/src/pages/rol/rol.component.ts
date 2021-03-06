import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Optional } from "@angular/core";
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../util/AppConfig';
import * as _ from 'underscore';
import { ToastOptions, ToastyService } from 'ng2-toasty';
import { Overlay, overlayConfigFactory } from 'angular2-modal';
import { BSModalContext, Modal } from 'angular2-modal/plugins/bootstrap';
import { DeleteComponentContext, DeleteComponent } from '../../modals/deletemodal/deletemodal.component';
import { RolService, MyToastyService } from '../../services/services';

@Component({
    selector: 'roles',
    templateUrl: ('./rol.component.html'),
    styleUrls: ['./rol.component.css'],
    providers: [RolService, MyToastyService]
})
export class RolComponent {
    switchPagination: boolean;
    dataToShow: any;
    filter: any = {
        role: ""
    };
    _originalData: any;
    roles: any;
    loading = true;
    currentPage: number = 1;
    access = localStorage.getItem('access');
    AppConfig = AppConfig;
    constructor(private route: ActivatedRoute, private router: Router, private rolService: RolService, public modal: Modal, private vcRef: ViewContainerRef, private toastService: MyToastyService) {
        modal.overlay.defaultViewContainer = vcRef;
    }

    ngOnInit() {
        this.getRoles();
    }

    getRoles() {
        this.rolService.getRoles().subscribe(
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
                    this.toastService.addToast("Ha ocurrido un problema al pedir los roles.", this.toastService.toastyType.error)
            }
        );
    }

    deleteRoles(roles) {
        this.rolService.deleteRoles(roles.id).subscribe(
            result => {
                this.toastService.addToast("El rol " + roles.name + " ha sido borrado correctamente.", this.toastService.toastyType.success)
                this.getRoles();
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                    this.toastService.addToast("Ha ocurrido un problema al pedir los roles.", this.toastService.toastyType.error)
            }
        );
    }

    configureNewRol() {
        this.router.navigateByUrl('/app/rol/create');
    }


    cleanFilters() {
        this.filter = {
            role: ""
        };
        this.filterRoles();
    }

    filterRoles() {
        this.dataToShow = this._originalData;
        if (this.filter.role && this.filter.role.length) {
            this.dataToShow = this.dataToShow
                .filter(x => x.name.toLowerCase().indexOf(this.filter.role.toLowerCase()) > -1);
        }
        this.pageChanged({ page: 1, itemsPerPage: 20 });
        this.switchPagination = !this.switchPagination;
    }


    public pageChanged(evt) {
        let page = evt.page - 1;
        this.roles = this.dataToShow.slice(page * 20, page * 20 + evt.itemsPerPage);
    }

    deleteRolModal(roles) {
        let context = new DeleteComponentContext();
        this.modal.overlay.defaultViewContainer = this.vcRef;
        var that = this;
        this.modal.open(DeleteComponent, overlayConfigFactory({ msj: 'Seguro que deseas eliminar el rol ' + '"' + roles.name + '"' + '?' }, BSModalContext))
            .then(function (x) {
                var those = that;
                x.result
                    .then(function (result) {
                        if (result) {
                            that.deleteRoles(roles);
                        }
                    });
            });

    }
}
