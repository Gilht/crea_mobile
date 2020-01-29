import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../util/AppConfig';
import * as _ from 'underscore';
import { SubdivisionService, MyToastyService, TemplateService } from '../../services/services';
import { ImageViewModalComponentContext, ImageViewModalComponent } from '../../modals/imageViewModal/imageViewModal.component';
import { Overlay, overlayConfigFactory } from 'angular2-modal';
import { BSModalContext, Modal } from 'angular2-modal/plugins/bootstrap';
import { ReportService } from '../../services/report.service';
import { MapComponentContext, MapComponent } from '../../modals/mapModal/mapModal.component';

@Component({
    selector: 'templateSectionAdvance',
    templateUrl: ('./templateSectionAdvance.component.html'),
    styleUrls: ['./templateSectionAdvance.component.css'],
    providers: [SubdivisionService, TemplateService, ReportService, MyToastyService]
})
export class TemplateSectionAdvanceComponent {
    type: any;
    sectionId: any;
    report: any = {};
    loading = true;
    access = localStorage.getItem('access');
    constructor(private route: ActivatedRoute, public modal: Modal, public reportService: ReportService,
        private templateService: TemplateService, private router: Router, public vcRef: ViewContainerRef, private toastService: MyToastyService) {
        this.sectionId = route.snapshot.params['id'];
        this.type = route.snapshot.params['type'];
    }

    ngOnInit() {
        this.getSection();
    }

    getSection() {
        this.templateService.getSectionAdvance(this.sectionId).subscribe(
            result => {
                this.loading = false;
                this.report = result;
                var that = this;
                this.report.sectionHouseTPS = _.filter(result.sectionHouseTPS, function (num) {
                    return num.tPS.templatePackage.template.type == that.type;
                });
                this.report.sectionHouseTPS = _.sortBy(result.sectionHouseTPS, function (num) {
                    return num.tPS.templatePackage.packageOrder;
                });
                this.report.sectionHouseTPS = this.report.sectionHouseTPS.sort((a, b) => {
                    if (a.tPS.templatePackage.packageOrder > b.tPS.templatePackage.packageOrder) {
                        return 1;
                    }
                    else if (a.tPS.templatePackage.packageOrder < b.tPS.templatePackage.packageOrder) {
                        return -1
                    }
                    else {
                        if (a.tPS.order > b.tPS.order) {
                            return 1
                        }
                        if (a.tPS.order < b.tPS.order) {
                            return -1
                        }
                    }
                    return 0;
                })
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                this.toastService.addToast("Ha ocurrido un problema al pedir los proyectos.", this.toastService.toastyType.error)
            }
        );

        this.loading = false;
    }

    getPercent(packageId) {
        let filteredSubpackages = this.report.sectionHouseTPS.filter(x => x.tPS.subpackage.packageId == packageId);
        var total = 0;
        filteredSubpackages.forEach(sectionTPS => {
            if (sectionTPS.subpackageStatus > 1) {
                total += sectionTPS.tPS.subpackageEffortWeight;
            }
        });
        return total;
    }

    viewSpecificData(sub, type) {
        this.reportService.getSectionHouseTPS(sub.id).subscribe(
            result => {
                let context = new ImageViewModalComponentContext();
                this.modal.overlay.defaultViewContainer = this.vcRef;
                var that = this;
                if (!result.file && type == "image") {
                    this.toastService.addToast("No hay imagen para mostrar.", this.toastService.toastyType.error);
                    return;
                }
                if (!result.comments && type == "comments") {
                    this.toastService.addToast("No hay comentarios para mostrar.", this.toastService.toastyType.error);
                    return;
                }
                this.modal.open(ImageViewModalComponent, overlayConfigFactory({ subpackage: result, type: type }, BSModalContext));
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                this.toastService.addToast("Ha ocurrido un problema al pedir la información.", this.toastService.toastyType.error)
            }
        );
    }

    packageFatherName(packageFatherId) {
        if (packageFatherId) {
            var father = this.report.sectionHouseTPS
                .find(subpackage => subpackage.tPS.templatePackage.packageId === packageFatherId)
            if (father) {
                return father.tPS.templatePackage.package.name
            }
        }
        return ""
    }

    mapModal(x) {
        if (!x.latitude || !x.longitude) {
            this.toastService.addToast("No se encuentra registrada la ubicación", this.toastService.toastyType.error);
            return;
        }
        let context = new MapComponentContext();
        this.modal.overlay.defaultViewContainer = this.vcRef;
        var that = this;
        this.modal.open(MapComponent, overlayConfigFactory({ latitude: x.latitude, longitude: x.longitude }, BSModalContext))
            .then(function (x) { });

    }

}
