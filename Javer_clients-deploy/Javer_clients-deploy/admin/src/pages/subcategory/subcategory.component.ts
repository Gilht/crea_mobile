import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../util/AppConfig';
import * as _ from 'underscore';
import { Overlay, overlayConfigFactory } from 'angular2-modal';
import { BSModalContext, Modal } from 'angular2-modal/plugins/bootstrap';
import { DeleteComponentContext, DeleteComponent } from '../../modals/deletemodal/deletemodal.component';
import { MyToastyService, SubcategoryService, CategoryService } from '../../services/services';

@Component({
    selector: 'subcategory',
    templateUrl: ('./subcategory.component.html'),
    styleUrls: ['./subcategory.component.css'],
    providers: [SubcategoryService, CategoryService, MyToastyService]
})
export class SubcategoryComponent {
    switchPagination: boolean;
    categories: any = [];
    dataToShow: any;
    filter: any = {
        subcategory: "",
        category: ""
    };
    _originalData: any = [];
    subcategories: any = [];
    loading = true;
    currentPage: number = 1;
    access = localStorage.getItem('access');
    writeFlag: any;
    deleteFlag: any;
    AppConfig = AppConfig;
    constructor(private route: ActivatedRoute, private router: Router, private subcategoryService: SubcategoryService, public modal: Modal, private categoryService: CategoryService, private vcRef: ViewContainerRef, private toastService: MyToastyService) {
        modal.overlay.defaultViewContainer = vcRef;
    }

    ngOnInit() {
        this.getCategories();
        this.getSubcategories();
        this.verifyAccess('SUBCATEGORIAS_WRITE');
        this.verifyAccess('SUBCATEGORIAS_DELETE');
    }

    getSubcategories() {
        this.subcategoryService.getSubcategories().subscribe(
            result => {
                this.loading = false;
                // Clean null categories
                this._originalData = (_.isArray(result) ? result.filter(s => s.categoryId != null) : []);
                this.dataToShow = _.sortBy(this._originalData, sub => sub.category.name.toLowerCase());
                this.pageChanged({ page: 1, itemsPerPage: 20 });
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                this.toastService.addToast("Ha ocurrido un problema al pedir las subcategorias.", this.toastService.toastyType.error)
            }
        );
    }

    deleteSubcategory(subcategory) {
        this.subcategoryService.deleteSubcategory(subcategory.id).subscribe(
            result => {
                this.toastService.addToast("la subcategoría " + subcategory.name + " ha sido borrada correctamente.", this.toastService.toastyType.success)
                this.getSubcategories();
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                this.toastService.addToast("Ha ocurrido un problema al pedir las subcategorias.", this.toastService.toastyType.error)
            }
        );
    }

    configureNewSubcategory() {
        this.router.navigateByUrl('/app/subcategory/create');
    }


    cleanFilters() {
        this.filter = {
            subcategory: "",
            category: ""
        };
        this.filterSubcategories();
    }

    filterSubcategories() {
        this.dataToShow = this._originalData;
        if (this.filter.subcategory && this.filter.subcategory.length) {
            this.dataToShow = this.dataToShow
                .filter(x => x.name.toLowerCase().indexOf(this.filter.subcategory.toLowerCase()) > -1);
        }
        this.pageChanged({ page: 1, itemsPerPage: 20 });
        this.switchPagination = !this.switchPagination;
    }

    filterCategories() {
        this.dataToShow = this._originalData;
        if (this.filter.subcategory != null && this.filter.category != "") {
            this.dataToShow = this.dataToShow.filter(x => x.category.name == this.filter.category.name);
        }
        this.pageChanged({ page: 1, itemsPerPage: 20 });
        this.switchPagination = !this.switchPagination;
    }

    public pageChanged(evt) {
        let page = evt.page - 1;
        this.subcategories = this.dataToShow.slice(page * 20, page * 20 + evt.itemsPerPage);
        this.subcategories = _.sortBy(this.subcategories, function (cat) { return cat.name.toLowerCase(); });
        this.subcategories = _.sortBy(this.subcategories, function (sub) { return sub.category.name.toLowerCase(); });
    }
    getCategories() {
        this.categoryService.getCategories().subscribe(
            result => {
                this.loading = false;
                this.categories = result;
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                this.toastService.addToast("Ha ocurrido un problema al pedir las subcategorias.", this.toastService.toastyType.error)
            }
        );
    }

    deleteSubCategoryModal(subcategory) {
        let context = new DeleteComponentContext();
        this.modal.overlay.defaultViewContainer = this.vcRef;
        var that = this;
        this.modal.open(DeleteComponent, overlayConfigFactory({ msj: 'Seguro que deseas eliminar la subcategoria ' + '"' + subcategory.name + '"' + '?' }, BSModalContext))
            .then(function (x) {
                var those = that;
                x.result
                    .then(function (result) {
                        if (result) {
                            that.deleteSubcategory(subcategory);
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
