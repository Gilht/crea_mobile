import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../util/AppConfig';
import * as _ from 'underscore';
import { ToastOptions, ToastyService } from 'ng2-toasty';
import { CategoryService, MyToastyService } from '../../services/services';

@Component({
    selector: 'categoryForm',
    templateUrl: ('./categoryForm.component.html'),
    styleUrls: ['./categoryForm.component.css'],
    providers: [CategoryService]
})
export class CategoryFormComponent {
    hasCategory = false;
    categoryId: any;
    category: any = {};
    categories: any[];
    access = localStorage.getItem('access');
    filter: any = {
        category: ""
    };
    _originalData: any;
    loading = true;
    AppConfig = AppConfig;

    constructor(private route: ActivatedRoute, private router: Router, private categoryService: CategoryService, vcRef: ViewContainerRef, private toastService: MyToastyService) {
        this.categoryId = route.snapshot.params['id'];

    }

    ngOnInit() {
        this.getCategory(this.categoryId);
        this.getCategories();
    }

    getCategory(id) {
        this.categoryService.getCategory(id).subscribe(
            result => {
                this.loading = false;
                this.category = result;
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
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                    this.toastService.addToast("Ha ocurrido un problema al pedir los proyectos.", this.toastService.toastyType.error)
            }
        );
    }

    saveCategory(category) {
        this.hasCategory = false;
        this.hasCategoryCheck(category);
        if (category.id && !this.hasCategory) {
            this.categoryService.editCategory(category).subscribe(
                result => {
                    this.toastService.addToast("Se ha guardado exitosamente", this.toastService.toastyType.success)
                    this.router.navigateByUrl('/app/category');
                },
                error => {
                    if(error.statusText = 'Method Not Allowed')
                        this.toastService.addToast(error.error, this.toastService.toastyType.error);
                    else
                        this.toastService.addToast("Ha ocurrido un guardar la categoría.", this.toastService.toastyType.error)
                }
            );
        } else if (!this.hasCategory) {
            this.categoryService.createCategory(category).subscribe(
                result => {
                    this.toastService.addToast("Se ha guardado exitosamente", this.toastService.toastyType.success)
                    this.router.navigateByUrl('/app/category');
                },
                error => {
                    if(error.statusText = 'Method Not Allowed')
                        this.toastService.addToast(error.error, this.toastService.toastyType.error);
                    else
                        this.toastService.addToast("Ha ocurrido un guardar la categoría.", this.toastService.toastyType.error)
                }
            );
        }

    }
    hasCategoryCheck(category) {
        for (let i = 0; i < this.categories.length; i++) {
            if (this.categories[i].name == category.name && this.categories[i].id != category.id) {
                this.toastService.addToast("Esta categoria ya existe", this.toastService.toastyType.error)
                this.hasCategory = true;
                break;
            }
        }
    }
}
