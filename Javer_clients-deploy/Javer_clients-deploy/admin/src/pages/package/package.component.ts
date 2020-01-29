import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../util/AppConfig';
import * as _ from 'underscore';
import { Overlay, overlayConfigFactory } from 'angular2-modal';
import { BSModalContext, Modal } from 'angular2-modal/plugins/bootstrap';
import { DeleteComponentContext, DeleteComponent } from '../../modals/deletemodal/deletemodal.component';
import { PackageService, MyToastyService } from '../../services/services'
@Component({
    selector: 'packages',
    templateUrl: ('./package.component.html'),
    styleUrls: ['./package.component.css'],
    providers: [PackageService, MyToastyService]
})
export class PackageComponent {
    switchPagination: boolean;
    dataToShow: any = [];
    filter: any = {
        package: ""
    };
    _originalData: any = [];
    packages: any = [];
    loading = true;
    currentPage: number = 1;
    access = localStorage.getItem('access');
    writeFlag: any;
    deleteFlag: any;
    AppConfig = AppConfig;
    constructor(public modal: Modal, private route: ActivatedRoute, private router: Router, private packageService: PackageService, private vcRef: ViewContainerRef, private toastService: MyToastyService) {
        modal.overlay.defaultViewContainer = vcRef;
    }

    ngOnInit() {
        this.getPackages();
        this.verifyAccess('PAQUETES_WRITE');
        this.verifyAccess('PAQUETES_DELETE');
    }

    getPackages() {
        this.packageService.getPackages().subscribe(
            result => {
                this.loading = false;
                this._originalData = result;
                this.dataToShow = result;
                this.dataToShow = _.sortBy(this.dataToShow, function (cat) { return cat.name.toLowerCase(); });
                this.pageChanged({ page: 1, itemsPerPage: 20 });
            },
            error => {
                if(error.statusText == 'Method Not Allowed') {
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                } else {
                    this.toastService.addToast("Ha ocurrido un problema al pedir los paquetes.", this.toastService.toastyType.error)
                }
            }
        );
    }

    deletePackage(packages) {
        this.packageService.deletePackage(packages.id).subscribe(
            result => {
                this.toastService.addToast("el paquete " + packages.name + " ha sido borrado correctamente.", this.toastService.toastyType.success)
                this.getPackages();
            },
            error => {
                if(error.statusText == 'Method Not Allowed') {
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                } else {
                    this.toastService.addToast("Ha ocurrido un problema al pedir los paquetes.", this.toastService.toastyType.error)
                }
            }
        );
    }

    configureNewPackage() {
        this.router.navigateByUrl('/app/package/create');
    }


    cleanFilters() {
        this.filter = {
            package: ""
        };
        this.filterPackage();
    }

    filterPackage() {
        this.dataToShow = this._originalData;
        if (this.filter.package && this.filter.package.length) {
            this.dataToShow = this.dataToShow
                .filter(x => x.name.toLowerCase().indexOf(this.filter.package.toLowerCase()) > -1);
        }
        this.pageChanged({ page: 1, itemsPerPage: 20 });
        this.switchPagination = !this.switchPagination;
    }

    public pageChanged(evt) {
        let page = evt.page - 1;
        this.packages = this.dataToShow.slice(page * 20, page * 20 + evt.itemsPerPage)
    }

    deletePackageModal(packages) {
        if (packages.subpackages.length) {
            this.toastService.addToast("No es posible eliminar un paquete con subpaquetes asignados.", this.toastService.toastyType.error);
            return;
        }

        let context = new DeleteComponentContext();
        this.modal.overlay.defaultViewContainer = this.vcRef;
        var that = this;
        this.modal.open(DeleteComponent, overlayConfigFactory({ msj: 'Seguro que deseas eliminar el paquete ' + '"' + packages.name + '"' + '?' }, BSModalContext))
            .then(function (x) {
                var those = that;
                x.result
                    .then(function (result) {
                        if (result) {
                            that.deletePackage(packages);
                        }
                    });
            });

    }

    verifyAccess(permission){
        if(permission.indexOf('WRITE')+1)
        if(this.access.includes(permission)) this.writeFlag = true;

        if(permission.indexOf('DELETE')+1)
        if(this.access.includes(permission)) this.deleteFlag = true;
    }
}
