import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../util/AppConfig';
import * as _ from 'underscore';
import { MyToastyService, SubpackageService, PackageService } from '../../services/services';
import { message } from '../../clientsSharedModule/sharedmodule';

@Component({
    selector: 'subpackageForm',
    templateUrl: ('./subpackageForm.component.html'),
    styleUrls: ['./subpackageForm.component.css'],
    providers: [SubpackageService, PackageService, MyToastyService]
})
export class SubpackageFormComponent {
    subpackageId: any;
    subpackage: any = {};
    package: any = [];
    filter: any = {
        subpackage: ""
    };
    _originalData: any;
    loading = true;
    access = localStorage.getItem('access');
    AppConfig = AppConfig;
    constructor(private route: ActivatedRoute, private router: Router,
        private packageService: PackageService,
        private subpackageservice: SubpackageService,
        vcRef: ViewContainerRef, private toastService: MyToastyService) {
        this.subpackageId = route.snapshot.params['id'];

    }

    ngOnInit() {
        this.getSubpackage(this.subpackageId);
        this.getPackage();
    }

    getSubpackage(id) {
        this.subpackageservice.getSubpackage(id).subscribe(
            result => {
                this.subpackage = result || {};
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                this.toastService.addToast(message.subpackage.one.error, this.toastService.toastyType.error)
            }
        );
    }

    getPackage() {
        this.packageService.getPackages().subscribe(
            result => {
                this.package = result;
                this.loading = false;
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                this.toastService.addToast("Ha ocurrido un problema al pedir los paquetes.", this.toastService.toastyType.error)
            }
        );
    }

    saveSubpackage(subpackage) {
        if (subpackage.id) {
            this.subpackageservice.editSubpackage(subpackage).subscribe(
                result => {
                    this.toastService.addToast(message.subpackage.create.success, this.toastService.toastyType.success)
                    this.router.navigateByUrl('/app/subpackage');
                },
                error => {
                    if(error.statusText = 'Method Not Allowed')
                        this.toastService.addToast(error.error, this.toastService.toastyType.error);
                    else
                    this.toastService.addToast(message.subpackage.create.error, this.toastService.toastyType.error)
                }
            );
        } else {
            if (this.package.find(x => x.id == this.subpackage.packageId).subpackages.some(subpack => subpack.name == this.subpackage.name)) {
                this.toastService.addToast("Este subpaquete ya existe dentro de este paquete.", this.toastService.toastyType.error)
                return;
            }
            this.subpackageservice.createSubpackage(subpackage).subscribe(
                result => {
                    this.toastService.addToast(message.subpackage.create.success, this.toastService.toastyType.success)
                    this.router.navigateByUrl('/app/subpackage');
                },
                error => {
                    if(error.statusText = 'Method Not Allowed')
                        this.toastService.addToast(error.error, this.toastService.toastyType.error);
                    else
                    this.toastService.addToast(message.subpackage.create.error, this.toastService.toastyType.error)
                }
            );
        }

    }
}
