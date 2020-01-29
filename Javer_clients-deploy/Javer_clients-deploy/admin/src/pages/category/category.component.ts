import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Optional } from "@angular/core";
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../util/AppConfig';
import * as _ from 'underscore';
import { ToastOptions, ToastyService } from 'ng2-toasty';
import { Overlay, overlayConfigFactory } from 'angular2-modal';
import { BSModalContext, Modal } from 'angular2-modal/plugins/bootstrap';
import { DeleteComponentContext, DeleteComponent } from '../../modals/deletemodal/deletemodal.component';
import { CategoryService, MyToastyService } from '../../services/services';

@Component({
    selector: 'category',
    templateUrl: ('./category.component.html'),
    styleUrls: ['./category.component.css'],
    providers: [CategoryService, MyToastyService]
})
export class CategoryComponent {
    switchPagination: boolean;
    dataToShow: any;
    filter: any = {
        category: ""
    };
    _originalData: any;
    categories: any;
    loading = true;
    currentPage: number = 1;
    AppConfig = AppConfig;
    access = localStorage.getItem('access');
    writeFlag: any;
    deleteFlag: any;
    constructor(private route: ActivatedRoute, private router: Router, private categoryService: CategoryService, public modal: Modal, private vcRef: ViewContainerRef, private toastService: MyToastyService) {
        modal.overlay.defaultViewContainer = vcRef;
    }

    ngOnInit() {
        this.getCategories();
        this.verifyAccess('CATEGORIAS_WRITE');
        this.verifyAccess('CATEGORIAS_DELETE');
    }

    getCategories() {
        this.categoryService.getCategories().subscribe(
            result => {
                this.loading = false;
                this._originalData = result;
                this.dataToShow = result;
                this.dataToShow = _.sortBy(this.dataToShow, function (cat) { return cat.name.toLowerCase(); });
                this.pageChanged({ page: 1, itemsPerPage: 20 });
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                    this.toastService.addToast("Ha ocurrido un problema al pedir las categorias.", this.toastService.toastyType.error)
            }
        );
    }

    deleteCategory(category) {
        this.categoryService.deleteCategory(category.id).subscribe(
            result => {
                this.toastService.addToast("la categoría " + category.name + " ha sido borrada correctamente.", this.toastService.toastyType.success)
                this.getCategories();
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                    this.toastService.addToast("Ha ocurrido un problema al pedir las categorias.", this.toastService.toastyType.error)
            }
        );
    }

    configureNewCategory() {
        this.router.navigateByUrl('/app/category/create');
    }


    cleanFilters() {
        this.filter = {
            category: ""
        };
        this.filterCategories();
    }

    filterCategories() {
        this.dataToShow = this._originalData;
        if (this.filter.category && this.filter.category.length) {
            this.dataToShow = this.dataToShow
                .filter(x => x.name.toLowerCase().indexOf(this.filter.category.toLowerCase()) > -1);
        }
        this.pageChanged({ page: 1, itemsPerPage: 20 });
        this.switchPagination = !this.switchPagination;
    }


    public pageChanged(evt) {
        let page = evt.page - 1;
        this.categories = this.dataToShow.slice(page * 20, page * 20 + evt.itemsPerPage);
    }

    deleteCategoryModal(category) {
        let context = new DeleteComponentContext();
        this.modal.overlay.defaultViewContainer = this.vcRef;
        var that = this;
        this.modal.open(DeleteComponent, overlayConfigFactory({ msj: 'Seguro que deseas eliminar la categoria ' + '"' + category.name + '"' + '?' }, BSModalContext))
            .then(function (x) {
                var those = that;
                x.result
                    .then(function (result) {
                        if (result) {
                            that.deleteCategory(category);
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
