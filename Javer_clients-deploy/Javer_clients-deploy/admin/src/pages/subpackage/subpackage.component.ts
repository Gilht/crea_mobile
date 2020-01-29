import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';;
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../util/AppConfig';
import * as _ from 'underscore';
import { Overlay, overlayConfigFactory } from 'angular2-modal';
import { BSModalContext, Modal } from 'angular2-modal/plugins/bootstrap';
import { DeleteComponentContext, DeleteComponent } from '../../modals/deletemodal/deletemodal.component';
import { MyToastyService, SubpackageService, PackageService } from '../../services/services';
@Component({
    selector: 'subpackage',
    templateUrl: ('./subpackage.component.html'),
    styleUrls: ['./subpackage.component.css'],
    providers: [SubpackageService, PackageService, MyToastyService]
})
export class SubpackageComponent {
    switchPagination: boolean;
    packages: any = [];
    dataToShow: any;
    filter: any = {
        subpackage: "",
        package: ""
    };
    _originalData: any = [];
    subpackage: any = [];
    loading = true;
    currentPage: number = 1;
    access = localStorage.getItem('access');
    writeFlag: any;
    deleteFlag: any;
    AppConfig = AppConfig;
    constructor(private route: ActivatedRoute, private router: Router, private subpackageService: SubpackageService, public modal: Modal, private packageService: PackageService, public vcRef: ViewContainerRef, private toastService: MyToastyService) {
        modal.overlay.defaultViewContainer = vcRef;
    }

    ngOnInit() {
        this.getSubpackages();
        this.getPackages();
        this.verifyAccess('SUBPAQUETES_WRITE');
        this.verifyAccess('SUBPAQUETES_DELETE');
    }

    getSubpackages() {
        this.subpackageService.getSubpackages().subscribe(
            result => {
                this.loading = false;
                this._originalData = result;
                this.dataToShow = result;
                this.dataToShow = _.sortBy(this.dataToShow, function (sub) { return sub.package.name.toLowerCase(); });
                this.pageChanged({ page: 1, itemsPerPage: 20 });
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                this.toastService.addToast("Ha ocurrido un problema al pedir los subpaquetes.", this.toastService.toastyType.error)
            }
        );
    }

    getPackages() {
        this.packageService.getPackages().subscribe(
            result => {
                this.packages = result;
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                this.toastService.addToast("Ha ocurrido un problema al pedir los paquetes.", this.toastService.toastyType.error)
            }
        );
    }


    deleteSubpackage(subpackage) {
        this.subpackageService.deleteSubpackage(subpackage.id).subscribe(
            result => {
                this.toastService.addToast("el subpaquete " + subpackage.name + " ha sido borrado correctamente.", this.toastService.toastyType.success)
                this.getSubpackages();
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                this.toastService.addToast("Ha ocurrido un problema al pedir los subpaquetes.", this.toastService.toastyType.error)
            }
        );
    }

    configureNewSubpackage() {
        this.router.navigateByUrl('/app/subpackage/create');
    }


    cleanFilters() {
        this.filter = {
            subpackage: "",
            package: ""
        };
        this.filterSubpackage();
    }

    filterSubpackage() {
        this.dataToShow = this._originalData;
        if (this.filter.subpackage.length > 0) {
            this.dataToShow = this.dataToShow
                .filter(x => x.name.toLowerCase().indexOf(this.filter.subpackage.toLowerCase()) !== -1);
        }
        if (this.filter.package != "") {
            this.dataToShow = this.dataToShow.filter(x => x.package.name == this.filter.package.name);
        }
        this.dataToShow.sort((a, b) => {
            if (a.package.name > b.package.name) {
                return 1;
            }
            else if (a.package.name > b.package.name) {
                return -1;
            }
            else {
                if (a.name > b.name) {
                    return 1;
                }
                if (a.name < b.name) {
                    return -1;
                }
                return 0;
            }
        });
        this.pageChanged({ page: 1, itemsPerPage: 20 });
        this.switchPagination = !this.switchPagination;
    }


    filterPackage() {
        this.dataToShow = this._originalData;
        if (this.filter.package != "") {
            this.dataToShow = this.dataToShow.filter(x => x.package.name == this.filter.package.name);
        }
        this.pageChanged({ page: 1, itemsPerPage: 20 });
        this.switchPagination = !this.switchPagination;
    }

    public pageChanged(evt) {
        let page = evt.page - 1;
        this.subpackage = this.dataToShow.slice(page * 20, page * 20 + evt.itemsPerPage);
        this.subpackage = _.sortBy(this.subpackage, function (pack) { return pack.name.toLowerCase(); });
        this.subpackage = _.sortBy(this.subpackage, function (sub) { return sub.package.name.toLowerCase(); });

    }

    deleteSubPackageModal(subpackage) {
        let context = new DeleteComponentContext();
        this.modal.overlay.defaultViewContainer = this.vcRef;
        var that = this;
        this.modal.open(DeleteComponent, overlayConfigFactory({ msj: 'Seguro que deseas eliminar el subpaquete ' + '"' + subpackage.name + '"' + '?' }, BSModalContext))
            .then(function (x) {
                var those = that;
                x.result
                    .then(function (result) {
                        if (result) {
                            that.deleteSubpackage(subpackage);
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
