import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../util/AppConfig';
import * as _ from 'lodash';
import { MyToastyService, CategoryService, SubcategoryService } from '../../services/services';


@Component({
    selector: 'subcategoryForm',
    templateUrl: ('./subcategoryForm.component.html'),
    styleUrls: ['./subcategoryForm.component.css'],
    providers: [SubcategoryService, CategoryService]
})
export class SubcategoryFormComponent {
    hasSubcategory = false;
    subcategoryId: any;
    subcategory: any = {};
    categories: any = [];
    subcategories: any = [];
    filter: any = {
        subcategory: ""
    };
    _originalData: any;
    loading = true;
    access = localStorage.getItem('access');
    AppConfig = AppConfig;
    constructor(private subcategoryService: SubcategoryService,
        private route: ActivatedRoute, private router: Router,
        private categoryService: CategoryService,
        vcRef: ViewContainerRef, private toastService: MyToastyService) {
        this.subcategoryId = route.snapshot.params['id'];
    }

    ngOnInit() {
        this.getSubcategory(this.subcategoryId);
        this.getCategories();
        this.getSubcategories();
    }

    getSubcategory(id) {
        this.subcategoryService.getSubcategory(id).subscribe(
            result => {
                this.subcategory = result || {};
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                this.toastService.addToast("Ha ocurrido un problema al pedir los proyectos.", this.toastService.toastyType.error)
            }
        );
    }

    getCategories() {
        this.categoryService.getCategories().subscribe(
            result => {
                this.categories = result;
                this.loading = false;
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                this.toastService.addToast("Ha ocurrido un problema al pedir los proyectos.", this.toastService.toastyType.error)
            }
        );
    }

    getSubcategories() {
        this.subcategoryService.getSubcategories().subscribe(
            result => {
                this.subcategories = result;
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                this.toastService.addToast("Ha ocurrido un problema al pedir los proyectos.", this.toastService.toastyType.error)
            }
        );
    }

    saveSubcategory(subcategory) {
        this.hasSubcategory = false;
        this.hasSubCategory(subcategory);

        if (subcategory.id && !this.hasSubcategory) {
            this.subcategoryService.editSubcategory(subcategory).subscribe(
                result => {
                    this.toastService.addToast("Se ha guardado exitosamente", this.toastService.toastyType.success)
                    this.router.navigateByUrl('/app/subcategory');
                },
                error => {
                    if(error.statusText = 'Method Not Allowed')
                        this.toastService.addToast(error.error, this.toastService.toastyType.error);
                    else
                        this.toastService.addToast("Ha ocurrido un guardar la subcategoría.", this.toastService.toastyType.error)
                }
                );
        } else if (!this.hasSubcategory) {
            this.subcategoryService.createSubcategory(subcategory).subscribe(
                result => {
                    this.toastService.addToast("Se ha guardado exitosamente", this.toastService.toastyType.success)
                    this.router.navigateByUrl('/app/subcategory');
                },
                error => {
                    if(error.statusText = 'Method Not Allowed')
                        this.toastService.addToast(error.error, this.toastService.toastyType.error);
                    else
                        this.toastService.addToast("Ha ocurrido un guardar la subcategoría.", this.toastService.toastyType.error)
                }
            );
        }

    }
    hasSubCategory(subcategory) {
        for (let i = 0; i < this.subcategories.length; i++) {
            for (let x = 0; x < this.subcategories[i].name.length; x++) {
                if (subcategory.name == this.subcategories[i].name
                    && subcategory.categoryId == this.subcategories[i].categoryId
                    && subcategory.id != this.subcategories[i].id
                ) {
                    this.hasSubcategory = true;
                    this.toastService.addToast("Esta subcategoria ya existe", this.toastService.toastyType.error)
                    break;
                }
            }
        }
    }
}
