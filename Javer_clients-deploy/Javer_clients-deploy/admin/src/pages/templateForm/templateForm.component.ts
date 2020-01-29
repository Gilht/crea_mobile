import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../util/AppConfig';
import * as _ from 'underscore';
import { Overlay, overlayConfigFactory } from 'angular2-modal';
import { BSModalContext, Modal } from 'angular2-modal/plugins/bootstrap';
import { AddSubpackageComponentContext, AddSubpackageComponent } from '../../modals/addSubpackageModal/addSubpackageModal.component';
import { TemplateService, MyToastyService, PrototypeService, PackageService, SubpackageService } from '../../services/services';
import { ServiceUtil, message } from '../../clientsSharedModule/sharedmodule';
import { DeleteComponentContext, DeleteComponent } from '../../modals/deletemodal/deletemodal.component';
@Component({
    selector: 'templateForm',
    templateUrl: ('./templateForm.component.html'),
    styleUrls: ['./templateForm.component.css'],
    providers: [ TemplateService, PackageService, PrototypeService, SubpackageService, MyToastyService]
})
export class TemplateFormComponent {
    isDisabled: false;
    templateId: any;
    selectedPackage: any = "";
    porcActualPackage: any = "";
    subpackages: any = {};
    types: any = [];
    alreadyCopy = false;
    modified = false;
    template: any = {
        type: 0,
        packages: [],
    };
    prototypes: any = [];
    package: any = [];
    posiblePackage: any = [];
    filter: any = {
        template: ""
    };
    _originalData: any;
    loading = true;
    access = localStorage.getItem('access');
    writeFlag: any;
    writeAddPaqFlag: any;
    writeDeletePaqFlag: any;
    writePorcPaqFlag: any;
    writePorcSubPaqFlag: any;
    deleteFlag: any;
    readFlag: any;
    createFlag: any;
    AppConfig = AppConfig;
    constructor(private route: ActivatedRoute, private router: Router,
        private packageService: PackageService, public modal: Modal, private subpackageService: SubpackageService,
        private templateService: TemplateService,
        private prototypeService: PrototypeService,
        public vcRef: ViewContainerRef, private toastService: MyToastyService) {
        modal.overlay.defaultViewContainer = vcRef;
        this.templateId = route.snapshot.params['id'];
    }

    ngOnInit() {
        if (this.templateId) {
            this.getTemplate(this.templateId);
        } else {
            this.template.initialPackageId = null;
            this.template.finalPackageId = null;
            this.template.externalId = null;
        }
        this.getPackages();
        this.getTemplateTypes();
        this.getPrototypes();
        if(this.templateId) {
          this.verifyAccess('PLANTILLAS_WRITE');
          this.verifyAccess('PLANTILLAS_WRITE_ADD_PAQ');
          this.verifyAccess('PLANTILLAS_WRITE_DELETE_PAQ');
          this.verifyAccess('PLANTILLAS_WRITE_PORC_PAQ');
          this.verifyAccess('PLANTILLAS_WRITE_PORC_SUBPAQ');
          this.verifyAccess('PLANTILLAS_CREATE');
        } else {
          this.verifyAccess('PLANTILLAS_CREATE');
        }
        this.verifyAccess('PLANTILLAS_READ');
    }
    myCheck() {
        this.modified = true;
    }

    getTemplate(id) {
        this.templateService.getTemplatePackages(id).subscribe(
            result => {
                this.template = result;
                this.addPosiblePackages();
                this.calcPorcPackage();
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                this.toastService.addToast("Ha ocurrido un problema al pedir los paquetes.", this.toastService.toastyType.error)
            }
        );
    }
    getTemplateTypes() {
        this.templateService.getTemplateTypes().subscribe(
            result => {
                this.types = result;
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                this.toastService.addToast("Ha ocurrido un problema al pedir los paquetes.", this.toastService.toastyType.error)
            }
        );
    }

    getPackages() {
        this.packageService.getPackages().subscribe(
            result => {
                this.package = result;
                this.loading = false
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                this.toastService.addToast("Ha ocurrido un problema al pedir los paquetes.", this.toastService.toastyType.error)
            }
        );
    }

    saveTemplate(template, copy) {
        let user = JSON.parse(localStorage.getItem('user'));
        template.initialPackageId = template.initialPackageId == 'null' ? null : template.initialPackageId;
        template.finalPackageId = template.finalPackageId == 'null' ? null : template.finalPackageId;
        template.externalId = template.externalId == 'null' ? null : template.externalId;

        if (!copy && user.id != this.template.userId && !user.isAdmin && template.id) {
            this.toastService.addToast("No tienes permiso para editar esta plantilla.", this.toastService.toastyType.error);
            return;
        }
        if (template.packages.length == 0) {
            this.toastService.addToast("No hay paquetes en la plantilla por lo tanto no puede continuar con la configuración.", this.toastService.toastyType.error);
            return;
        }
        if (template.packages.some(x => this.getSubpackageTotal(x) != 100)) {
            this.toastService.addToast("El peso de esfuerzo de un subpaquete no suma 100% por lo tanto no puede continuar con la configuración.", this.toastService.toastyType.error);
            return;
        }
        if (this.getPackageTotal(template) != 100) {
            this.toastService.addToast("El peso de esfuerzo de un paquete no suma 100% por lo tanto no puede continuar con la configuración.", this.toastService.toastyType.error);
            return;
        }
        if (template.packages.some(x => x.subpackages.length == 0)) {
            this.toastService.addToast("Un paquete no tiene subpaquetes", this.toastService.toastyType.error);
            return;
        }
        if (!template.name) {
            this.toastService.addToast("Falta llenar el nombre de la plantilla", this.toastService.toastyType.error);
            return;
        }
        if (template.packages.some(x => x.packageOrder == "" || x.packageDuration == "" || x.packageWeighing == "")) {
            this.toastService.addToast("Falta llenar datos.", this.toastService.toastyType.error);
            return;
        }
        if (template.packages.some(x => x.subpackages.some(y => !y.order))) {
            this.toastService.addToast("Falta llenar datos.", this.toastService.toastyType.error);
            return;
        }
        if (template.type == 0) {
            this.toastService.addToast("Debe seleccionar un tipo de plantilla.", this.toastService.toastyType.error);
            return;
        }
        if (template.initialPackageId == null || template.finalPackageId == null) {
            this.toastService.addToast("Debe seleccionar un paquete inicial y un paquete final", this.toastService.toastyType.error);
            return;
        }
        if (template.copy && template.externalId == null) {
          this.toastService.addToast("El protipo es obligatorio", this.toastService.toastyType.error);
          return;
        }

        if(copy) {
          this.alreadyCopy = true;
        } else {
          this.alreadyCopy = false;
        }

        if (template.id) {
            if (copy) {
                delete this.template.name;
                delete this.template.id;
                this.template.copy = true;
                this.template.userId = ServiceUtil.getCurrentUserId();

                this.template.packages.forEach(pack => {
                    delete pack.templateId;
                    delete pack.id;

                    pack.subpackages.forEach(subpack => {
                        delete subpack.templatePackageId;
                        delete subpack.id;
                    });
                });
                this.toastService.addToast("La plantilla ha sido copiada correctamente.", this.toastService.toastyType.success)
                return;
            }
            this.saveModal();
        } else {
            template.userId = ServiceUtil.getCurrentUserId();
            this.loading = true;
            this.templateService.createTemplate(template).subscribe(
                result => {
                    this.loading = false;
                    if (!copy) {
                        var that = this;
                        this.toastService.addToast("La plantilla ha sido agregada correctamente.", that.toastService.toastyType.success);
                        setTimeout(function () {
                            that.router.navigateByUrl('/app/template');
                        }, 2000);
                    }
                    else {
                        this.copyTemplate();
                    }
                },
                error => {
                    if (error.statusText = 'Method Not Allowed') {
                        this.toastService.addToast(error.error, this.toastService.toastyType.error);
                    } else if (error.status == 406) {
                        this.toastService.addToast("El usuario ya ha creado una plantilla con ese nombre.", this.toastService.toastyType.error)
                    } else {
                        this.toastService.addToast(message.error, this.toastService.toastyType.error)
                    }

                    this.loading = false;
                }
            );
        }
    }

    copyTemplate() {
        delete this.template.id;
        delete this.template.name;
        //delete this.template.type;
    }

    dependingOrder(order1, order2) {
        if (order1 != "" && order2 != "") {
            return Number(order1) > Number(order2);
        } else {
            return true;
        }
    }

    addPosiblePackages() {
        this.posiblePackage = [];
        for(var i = 0; i < this.template.packages.length; i++) {
          this.posiblePackage.push(this.template.packages[i].package);
        }
    }

    getPrototypes(){
      this.prototypeService.getPrototypesFilter().subscribe(
          result => {
              this.prototypes = result;
          },
          error => {
              console.log(error);
              if(error.statusText = 'Method Not Allowed')
                  this.toastService.addToast(error.error, this.toastService.toastyType.error);
              else
                  this.toastService.addToast("Ha ocurrido un problema al pedir los paquetes.", this.toastService.toastyType.error)
          }
      );
    }

    addPackage(pack) {
        pack = pack.find(x => x.id == this.selectedPackage);
        if(pack == undefined) { return false; }
        if (!(this.template.packages.some(x => x.packageId === pack.id))) {
            pack.subpackages = _.sortBy(pack.subpackages.filter(x => x.main === true), x => x.name);
            var subpackages = _.map(pack.subpackages, y => {
                return {
                    templatePackageId: "",
                    subpackageId: y.id,
                    subpackageEffortWeight: 0,
                    subpackageStatus: false,
                    subpackage: y,
                }
            });

            var x = {
                packageDuration: "",
                packageWeighing: "",
                packageOrder: "",
                packageFatherId: "",
                packageId: pack.id,
                templateId: "",
                package: pack,
                subpackages: subpackages
            };
            this.template.packages.push(x);
            this.addPosiblePackages();
        } else {
            this.toastService.addToast("Este paquete ya fue agregado a esta plantilla", this.toastService.toastyType.error);
        }
    }
    addSubpackage(pack, i) {
        this.modified = true;
        this.addSubPackageModal(pack, i);
    }
    deletePackage(pack) {
        this.modified = true;
        this.template.packages.splice(this.template.packages.indexOf(pack), 1);
        this.addPosiblePackages();
    }
    deleteSubpackage(pack, subpack) {
        this.modified = true;
        var packIndex = this.template.packages.indexOf(pack);
        this.template.packages[packIndex].subpackages.splice(this.template.packages[packIndex].subpackages.indexOf(subpack), 1);
    }
    calcPorcPackage(){
      this.porcActualPackage = 0;
      for(var i = 0; i < this.template.packages.length; i++ ) {
        this.porcActualPackage += this.template.packages[i].packageWeighing;
      }
    }
    addSubPackageModal(pack, i) {
        let context = new AddSubpackageComponentContext();
        this.modal.overlay.defaultViewContainer = this.vcRef;
        var that = this;
        this.modal.open(AddSubpackageComponent, overlayConfigFactory({ package: pack }, BSModalContext))
            .then(function (x) {
                var those = that;
                x.result
                    .then(function (result) {

                        if (result) {
                            that.modified = true;
                            var subpackage = result;
                            var templateSubpackage = {
                                templatePackageId: "",
                                subpackageId: subpackage.id,
                                subpackageEffortWeight: 0,
                                subpackageStatus: false,
                                subpackage: subpackage,
                                order: subpackage.order
                            }

                            those.template.packages.find(x => x.packageId == pack.packageId).subpackages.push(templateSubpackage);
                        }
                    });
            });
    }
    getSubpackageTotal(pack) {
        var total = 0;
        if (pack.subpackages) {
            pack.subpackages.forEach(subpackage => {
                total += subpackage.subpackageEffortWeight * 100;
            });
        }
        return total / 100;
    }
    getPackageTotal(template) {
        var total = 0;
        if (template.packages) {
            template.packages.forEach(pack => {
                total += pack.packageWeighing * 100;
            });
        }
        return total / 100;
    }
    checkSubpackageOrderNegative(subpackage) {
        if (subpackage.order < 0 || subpackage.order % 1 != 0) {
            subpackage.order = undefined;
        }
    }

    checkPackageOrderNegative(pack) {
        if (pack.packageOrder < 0 || pack.packageOrder % 1 != 0) {
            pack.packageOrder = undefined;
        }
    }

    saveModal() {
        let context = new DeleteComponentContext();
        this.modal.overlay.defaultViewContainer = this.vcRef;
        var that = this;
        this.modal.open(DeleteComponent, overlayConfigFactory({ msj: 'Al editar la plantilla, se borrará esta plantilla de todas las secciones en donde se ha asignado y sus avances, ¿desea continuar?' }, BSModalContext))
            .then(function (x) {
                var those = that;
                x.result
                    .then(function (result) {
                        if (result) {
                            those.loading = true;
                            those.templateService.editTemplate(those.template).subscribe(
                                result => {
                                    those.loading = false;
                                    those.toastService.addToast("La plantilla ha sido guardada correctamente.", those.toastService.toastyType.success)
                                    those.router.navigateByUrl('/app/template');
                                },
                                error => {
                                    those.loading = false;
                                    if(error.statusText = 'Method Not Allowed')
                                        those.toastService.addToast(error.error, those.toastService.toastyType.error);
                                    else
                                    if (error.status == 406) {
                                        those.toastService.addToast("Esta plantilla no se puede editar, tiene avances registrados en una vivienda.", those.toastService.toastyType.error)
                                    } else if (error.status == 400) {
                                        those.toastService.addToast('El usuario ya ha creado una plantilla con ese nombre.', those.toastService.toastyType.error);
                                    } else {
                                        those.toastService.addToast(message.error, those.toastService.toastyType.error)
                                    }
                                }
                            );
                        }
                    });
            });
    }

    verifyAccess(permission){
        if(permission.indexOf('WRITE') != -1)
        if(this.access.includes(permission)) this.writeFlag = true;

        if(permission.indexOf('DELETE') != -1)
        if(this.access.includes(permission)) this.deleteFlag = true;

        if(permission.indexOf('READ') != -1)
        if(this.access.includes(permission)) this.readFlag = true;

        if(permission.indexOf('CREATE') != -1)
        if(this.access.includes(permission)) this.createFlag = true;

        if(permission.indexOf('PLANTILLAS_WRITE_ADD_PAQ') != -1)
        if(this.access.includes(permission)) this.writeAddPaqFlag = true;

        if(permission.indexOf('PLANTILLAS_WRITE_DELETE_PAQ') != -1)
        if(this.access.includes(permission)) this.writeDeletePaqFlag = true;

        if(permission.indexOf('PLANTILLAS_WRITE_PORC_PAQ') != -1)
        if(this.access.includes(permission)) this.writePorcPaqFlag = true;

        if(permission.indexOf('PLANTILLAS_WRITE_PORC_SUBPAQ') != -1)
        if(this.access.includes(permission)) this.writePorcSubPaqFlag = true;
    }
}
