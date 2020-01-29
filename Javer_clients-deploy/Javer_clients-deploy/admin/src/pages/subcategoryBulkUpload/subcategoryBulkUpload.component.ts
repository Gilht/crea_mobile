import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../util/AppConfig';
import * as _ from 'underscore';
import { SharedHouseService, message, ServiceUtil } from '../../clientsSharedModule/sharedmodule';
import { MyToastyService, SubcategoryPrototypeService, CategoryService, PrototypeService, SubdivisionService, ResidentService } from '../../services/services';
import * as download from 'downloadjs';
import { debug } from 'util';
import { DeleteComponentContext, DeleteComponent } from '../../modals/deletemodal/deletemodal.component';
import { Modal, BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { overlayConfigFactory } from 'angular2-modal';

@Component({
    selector: 'subcategoryBulkUpload',
    templateUrl: ('./subcategoryBulkUpload.component.html'),
    styleUrls: ['./subcategoryBulkUpload.component.css'],
    providers: [SharedHouseService, MyToastyService, PrototypeService, SubcategoryPrototypeService, SubdivisionService, ResidentService]
})
export class SubcategoryBulkUploadComponent {
    switchPagination: boolean;
    dataToShow: any = [];
    filter: any = {
        subcategory: "",
        proyecto: "",
        frente: "",
        conjunto: "",
        prototipo: ""
    };
    prototipos: any = [];
    showPrototipos: any = [];
    conjuntos: any = [];
    frentes: any = [];
    projects: any = [];
    _originalData: any = [];
    subcategories: any = [];
    loading = true;
    currentPage: number = 1;
    itemsPerPage: number = 20;
    AppConfig = AppConfig;
    form = new FormData();
    projectName = '';
    access = localStorage.getItem('access');
    writeFlag: any;
    deleteFlag: any;
    readFlag: any;

    constructor(
        public modal: Modal,
        private route: ActivatedRoute,
        private subdivisionService: SubdivisionService,
        private router: Router,
        private subcategoryPrototypeService: SubcategoryPrototypeService,
        private prototypeService: PrototypeService,
        private sharedHouseService: SharedHouseService,
        private vcRef: ViewContainerRef,
        private toastService: MyToastyService,
        private residentService: ResidentService
    ) {

        modal.overlay.defaultViewContainer = vcRef;
    }

    ngOnInit() {
        this.getSubdivisions();
        this.getPrototipo();
        this.verifyAccess('CARGA_MASIVA_WRITE');
        this.verifyAccess('CARGA_MASIVA_DELETE');
    }


    configureNewSubcategory() {
        this.router.navigateByUrl('/app/subcategory/create');
    }


    cleanFilters() {
        this.filter = {
            subcategory: "",
            proyecto: "",
            prototipo: ""
        };
        this.filterSubcategories();
    }

    filterSubcategories() {
        this.dataToShow = this._originalData;
        if (this.filter.subcategory && this.filter.subcategory.length) {
            this.dataToShow = this.dataToShow
                .filter(x => x.subcategory.name.toLowerCase().indexOf(this.filter.subcategory.toLowerCase()) > -1);
        }
        this.pageChanged({page: 1, itemsPerPage: this.itemsPerPage});
        this.currentPage = 1;
        this.switchPagination = !this.switchPagination;
    }

    getSubcategoryPrototype() {
        this.loading = true;
        this.prototypeService.getSubcategoriesPrototype(this.filter).subscribe(
            result => {
                this.loading = false;
                this._originalData = result;
                this.dataToShow = result;
                this.pageChanged({page: 1, itemsPerPage: this.itemsPerPage});
                this.currentPage = 1;
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                this.toastService.addToast("Ha ocurrido un problema al pedir los proyectos.", this.toastService.toastyType.error)
            }
        );
    }


    public pageChanged(evt) {
        let page = evt.page - 1;
        this.subcategories = this.dataToShow.slice(page * 20, page * 20 + evt.itemsPerPage)
    }

    downloadPDF(subcategory) {
        if (subcategory.id && subcategory.srv_hasPdf) {
          this.prototypeService.getFileUrl(subcategory.id)
          .subscribe(
            dataUrlString => {
              download(dataUrlString, subcategory.subcategory.name + "-" + this.filter.prototipo.value + ".pdf");
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
              this.toastService.addToast("Error en el archivo PDF.", this.toastService.toastyType.error);
            }
          );
        } else {
            this.toastService.addToast("Error en el archivo PDF.", this.toastService.toastyType.error);
        }
    }

    viewPDF(subcategory) {
        if (subcategory.file) {
            this.genPDFLink(subcategory);
        } else if (subcategory.srv_hasPdf) {
          this.prototypeService.getFileUrl(subcategory.id)
          .subscribe(
            dataUrlString => {
              subcategory.file = dataUrlString;
              this.genPDFLink(subcategory);
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
              this.toastService.addToast("Error en el archivo PDF.", this.toastService.toastyType.error);
            }
          );
        } else {
            this.toastService.addToast("Error en el archivo PDF.", this.toastService.toastyType.error);
        }
    }

    genPDFLink(subcategory) {
      var a: HTMLAnchorElement = document.createElement('a');
      a.href = URL.createObjectURL(this.b64toBlob(subcategory.file.split(',')[1], 'application/pdf'));
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
    }

    b64toBlob(b64Data: string, contentType: string) {
        var byteCharacters = atob(b64Data);
        var byteNumbers = new Array(byteCharacters.length);
        for (var i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        var byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: contentType });
    }

    removeFile(subcategory) {
        if (subcategory.srv_hasPdf || subcategory.file) {
            subcategory.toUpdate = true;
            subcategory.file = "";
            subcategory.srv_hasPdf = 0;
        } else {
            this.toastService.addToast("Error en el archivo PDF.", this.toastService.toastyType.error);
        }
    }

    clickInputFile(subcategory) {
        document.getElementById(subcategory.id).click()
    }

    changeListener($event, subcategory): void {
        if ($event.target.files[0].size > 3000000) {
            this.toastService.addToast("El archivo pesa más de 3MB.", this.toastService.toastyType.error);
            return;
        }else if($event.target.files[0].type != 'application/pdf' &&
            ServiceUtil.removeDiacritics($event.target.files[0].name.split('.').pop()) != 'pdf'){
            this.toastService.addToast("La extensión del archivo debe de ser PDF.", this.toastService.toastyType.error);
            return;
        }
        this.readThis($event.target, subcategory);
    }

    readThis(inputValue: any, subcategory): void {
        var file: File = inputValue.files[0];
        var myReader: FileReader = new FileReader();

        myReader.onloadend = (e) => {
            subcategory.file = myReader.result;
            subcategory.toUpdate = true;
            subcategory.srv_hasPdf = 1;
        }
        myReader.readAsDataURL(file);
    }

    save() {
        var subproto = this._originalData.filter(x => x.toUpdate);
        var count = 0;
        if (subproto.length == 0) {
            this.toastService.addToast("No se ha modificado ningun registro.", this.toastService.toastyType.info);
            return;
        }
        this.loading = true;

        subproto.forEach(sub => {
            this.subcategoryPrototypeService.saveSubcategories([sub]).subscribe(
                result => {
                    this.residentService.sendNotification(
                        {
                            id: this.filter.proyecto,
                            name: this.projectName,
                            subcategoryName: sub.subcategory.name,
                            categoryName: sub.subcategory.category.name,
                            prototypeName: this.filter.prototipo.value,
                            resident: ServiceUtil.getCurrentUserName()
                        }
                    ).subscribe();
                    count++;
                    if (count == subproto.length) {
                        this.toastService.addToast("Se han guardado las modificaciones correctamente.", this.toastService.toastyType.success);
                        this.getSubcategoryPrototype();
                    }
                },
                error => {
                    if(error.statusText = 'Method Not Allowed')
                        this.toastService.addToast(error.error, this.toastService.toastyType.error);
                    else
                    this.toastService.addToast("Error de conexión al adjuntar el pdf.", this.toastService.toastyType.error);
                }
            );
        });

    }

    getSubdivisions() {
        this.subdivisionService.getAllowedSubdivisions().subscribe(
            result => {
                this.loading = false;
                this.projects = result;
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                this.toastService.addToast("Ha ocurrido un problema al pedir los proyectos.", this.toastService.toastyType.error)
            }
        );
    }
    getPrototipo() {
        this.sharedHouseService.getPrototipo2().subscribe(
            result => {
                if (result.length == 0) {
                    this.toastService.addToast("No se han encontrado registros.", this.toastService.toastyType.error)
                }
                this.prototipos = result;
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                this.toastService.addToast("Ha ocurrido un problema al pedir los proyectos.", this.toastService.toastyType.error)
            }
        );
    }
    filterPrototypes() {
        if (!_.isEmpty(this.filter.projecto)) {
          let project = this.projects.find(x => x.externalId == this.filter.proyecto);
          if (project) {
            this.projectName = project.name;
          } else {
            this.projectName = '';
          }
        }

        this.showPrototipos = this.prototipos.filter(x => x.idProject === this.filter.proyecto);
        this.currentPage = 1;
    }

    deleteCategoryModal(subcategoryPrototype) {
        let context = new DeleteComponentContext();
        this.modal.overlay.defaultViewContainer = this.vcRef;
        var that = this;
        this.modal.open(DeleteComponent, overlayConfigFactory({
            msj: 'Seguro que deseas eliminar el prototipo ' + '"'
                + subcategoryPrototype.subcategory.name + '" en ' + '"' + subcategoryPrototype.subcategory.category.name + '"' + '?'
        }, BSModalContext))
            .then(function (x) {
                var those = that;
                x.result
                    .then(function (result) {
                        if (result) {
                            that.removeFile(subcategoryPrototype);
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
