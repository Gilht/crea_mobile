import { Component, ViewContainerRef } from '@angular/core';
import { Location } from '@angular/common';
import { Estimate, ServiceUtil, message, SharedEstimateService } from '../../clientsSharedModule/sharedmodule';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { Modal } from 'angular2-modal';
import { MyToastyService, EstimateService } from '../../services/services';
import * as html2canvas from 'html2canvas';
// Saved Response for testing purposes
// import { default as checkEstimateResponse } from './checkEstimateResponse.json';

@Component({
    selector: 'estimateEdit',
    templateUrl: ('./estimateEdit.component.html'),
    styleUrls: ['./estimateEdit.component.css'],
    providers: [Estimate, EstimateService, SharedEstimateService, MyToastyService]
})
export class EstimateEditComponent {
    houseSize = 0;
    subpackageSize = 0;
    estimateId: any;
    coloredView: any = [];
    image = "";
    estimate: any;
    selectedSubpackage = "";
    resident: any = {};
    currentUser = "";
    subpackagesToShow = [];
    filteredSubpackages: Array<any> = [];
    showSubtotal = false;
    disableEditIsFinalEstimate = false;
    modified = false;
    loading = false;
    access = localStorage.getItem('access');

    rating = {
        availableElements: []
    };

    pagination = {
        currentPage: 0,
        list: [],
        numSections: 0,
        numSubpackages: 0,
        packagesPerPage: 3,
        numPages: 0,
    };

    filters = {
        showAvailable: true,
        toggleUnitCost: false
    };

    constructor(private route: ActivatedRoute, private router: Router,
        private estimateService: EstimateService, public modal: Modal, private sharedEstimateService: SharedEstimateService, public location: Location,
        public vcRef: ViewContainerRef, private toastService: MyToastyService) {
        this.currentUser = localStorage.getItem('CurrentUser') || "";
        this.estimateId = route.snapshot.params['id'];
        this.rating.availableElements = this.range(1,10).reverse();
        this.getEstimateById();
        // this.testResponse();
        this.resident = ServiceUtil.getCurrentUser();
    }

    testResponse() {
        this.loading = false;
        // this.estimate = checkEstimateResponse;
        this.applyFilters();
    }

    applyFilters() {
        this.pagination.currentPage = 0;
        this.filteredSubpackages = this.filterSubpackages(this.estimate.subpackages);
        this.genPagination(this.estimate.sections.length, this.filteredSubpackages.length);
        this.setSubpackagesToShow(this.filteredSubpackages, this.getMinPaginationBorder(this.pagination.currentPage), this.getMaxPaginationBorder(this.pagination.currentPage));
    }

    // Generate Pagination Options
    genPagination(numSections, numSubpackages) {
        this.pagination.numSections = (numSections > 0 ? numSections : 1);
        this.pagination.numSubpackages = numSubpackages;
        // max cells to display divided by number of sections
        this.pagination.packagesPerPage = Math.floor(500 / this.pagination.numSections);
        this.pagination.numPages = Math.ceil(this.pagination.numSubpackages / this.pagination.packagesPerPage);

        // Set page list
        this.genPagesList();
    }

    // Generate page list for the select component
    genPagesList() {
        this.pagination.list = [];
        for(let i = 1; i <= this.pagination.numPages; i++) {
            let minBorder = (this.getMinPaginationBorder(i) + 1);
            let maxBorder = this.getMaxPaginationBorder(i);
            maxBorder = (i == this.pagination.numPages ? (maxBorder != this.pagination.numSubpackages ? this.pagination.numSubpackages : maxBorder) : maxBorder);

            this.pagination.list.push(minBorder + ' - ' +  maxBorder);
        }

        if (this.pagination.numPages == 0) {
            this.pagination.list.push('0 - 0');
        }

        this.pagination.currentPage = 0;
    }

    getMinPaginationBorder(pageNumber) {
        if(pageNumber <= 0) return 0;
        let minBorder = (pageNumber * this.pagination.packagesPerPage - this.pagination.packagesPerPage);
        return minBorder;
    }

    getMaxPaginationBorder(pageNumber) {
        if(!pageNumber) return this.pagination.packagesPerPage;
        let maxBorder = (pageNumber * this.pagination.packagesPerPage);
        return maxBorder;
    }

    getPaginationBeforeNextString(getNextString) {
        if( this.pagination.numSubpackages == 0 ||
           (this.pagination.currentPage == 0 && !getNextString) ||
           (this.pagination.currentPage == this.pagination.numPages - 1 && getNextString)
        ) {
          return (getNextString ? 'Siguiente' : 'Anterior');
        } else {
          let str = (getNextString ? 'Siguientes ' : 'Anteriores ');
          return (str + this.pagination.packagesPerPage);
        }
    }

    changePage(goNext) {
        if(goNext && this.pagination.currentPage < this.pagination.numPages - 1) {
          this.pagination.currentPage += 1;
          this.setCurrentPage(this.pagination.currentPage);
      } else if (!goNext && this.pagination.currentPage > 0) {
          this.pagination.currentPage -= 1;
          this.setCurrentPage(this.pagination.currentPage);
      }
    }

    setCurrentPage(page) {
        page += 1;
        this.setSubpackagesToShow(this.filteredSubpackages, this.getMinPaginationBorder(page), this.getMaxPaginationBorder(page) + 1);
    }

    setSubpackagesToShow(spkgs, bottom, top) {
        this.subpackagesToShow = spkgs.slice(bottom, top);
        this.subpackageSize = 65 * (this.subpackagesToShow.length) + 40;
        this.getSubpackageMatrix();
    }

    filterSubpackages(spkgs) {
        let finalSubpackages = this.estimate.subpackages;
        if (this.selectedSubpackage.length) finalSubpackages = this.filterByName(spkgs);
        if (this.filters.showAvailable) finalSubpackages = this.filterByAvailable(finalSubpackages);
        return finalSubpackages;
    }

    filterByAvailable(spkgs) {
        return spkgs.filter(sp => {
          return this.getPendingSections(sp) > 0;
      });
    }

    filterByName(spkgs) {
        return spkgs.filter(sp => (sp.subpackageName.toLowerCase().indexOf(this.selectedSubpackage.toLowerCase()) != -1));
    }

    getEstimateById() {
        this.loading = true;
        this.estimateService.getEstimateById(this.estimateId).subscribe(
            result => {
                this.loading = false;
                this.estimate = result;
                this.disableEditIsFinalEstimate = !this.estimate.isFinal;
                this.applyFilters();
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                    this.toastService.addToast(message.error, this.toastService.toastyType.error);
            }
        );
    }

    getSubpackageTotal() {
        var total = 0;
        this.estimate.sections.forEach(section => {
            section.subpackages.forEach(subpackage => {
                if (subpackage.estimateNumberModified == this.estimate.estimateNumber && subpackage.toEstimateModified) {
                    (total += subpackage.cost * 100);
                }
            });
        });
        return (total / 100);
    }
    getSubpackageRowTotal(sp) {
        var total = 0;
        this.estimate.sections.forEach(section => {
            let subpackage = section.subpackages.find(x => x.subpackageCode == sp.subpackageCode && sp.cost == x.cost);
            try {
                if (subpackage.estimateNumberModified == this.estimate.estimateNumber && subpackage.toEstimateModified) {
                    total++;
                }
            } catch (error) {

            }
        });
        return total;
    }

    getSubpackageSections(sp) {
        var total = 0;
        this.estimate.sections.forEach(section => {
            let subpackage = section.subpackages.find(x => x.subpackageCode == sp.subpackageCode && sp.cost == x.cost);
            try {
                if (subpackage.cost) {
                    total++;
                }
            } catch (error) {

            }
        });
        return total;
    }

    getPendingSections(sp) {
        return this.getSubpackageSections(sp) - this.getSectionsDone(sp);
    }

    getSectionsDone(sp) {
        var total = 0;
        this.estimate.sections.forEach(section => {
            let subpackage = section.subpackages.find(x => x.subpackageCode == sp.subpackageCode && sp.cost == x.cost);
            try {
                if (subpackage.pendingQuantity == 0) {
                    total++;
                }
            } catch (error) {

            }
        });
        return total;
    }


    getSubpackageMatrix() {
        this.coloredView = Array(this.estimate.sections.length)
            .fill(Array(this.subpackagesToShow.length).fill(0));
    }
    paintCell(i: number, j: number) {
        try {
            let sectionSubpackage = this.estimate.sections[i].subpackages
                .find(x => x.subpackageCode == this.subpackagesToShow[j].subpackageCode && this.subpackagesToShow[j].sections.some(x => x == this.estimate.sections[i].sectionCode) && this.subpackagesToShow[j].cost == x.cost);
            if (sectionSubpackage.pendingQuantity == 0) {
                return "#3D7445";
            }
            else if (sectionSubpackage.estimateNumberModified != null && sectionSubpackage.estimateNumberModified != this.estimate.estimateNumber) {
                return "#2eb82e";
            }
            else if (sectionSubpackage.toEstimateModified == true) {
                return "#efd32d";
            }
            else {
                return "white";
            }
        } catch (error) {
            return "#a5a5a5";
        }
    }

    getCellNumber(i: number, j: number) {
        try {
            let sectionSubpackage = this.estimate.sections[i].subpackages
                .find(x => x.subpackageCode == this.subpackagesToShow[j].subpackageCode && this.subpackagesToShow[j].sections.some(x => x == this.estimate.sections[i].sectionCode) && this.subpackagesToShow[j].cost == x.cost);

            return sectionSubpackage.estimateNumberModified ? sectionSubpackage.estimateNumberModified : "";
        } catch (error) {
            return "";
        }
    }

    toEstimate(i: number, j: number) {
        try {
            let sectionSubpackage = this.estimate.sections[i].subpackages
                .find(x => x.subpackageCode == this.subpackagesToShow[j].subpackageCode && this.subpackagesToShow[j].sections.some(x => x == this.estimate.sections[i].sectionCode) && this.subpackagesToShow[j].cost == x.cost);
            if (sectionSubpackage.pendingQuantity != 0 && (sectionSubpackage.estimateNumberModified == null || sectionSubpackage.estimateNumberModified == this.estimate.estimateNumber)) {
                sectionSubpackage.toEstimateModified = !sectionSubpackage.toEstimateModified;
                this.modified = true;
                if (sectionSubpackage.toEstimateModified) {
                    sectionSubpackage.estimateNumberModified = this.estimate.estimateNumber;
                } else {
                    sectionSubpackage.estimateNumberModified = null;
                }
            }
        } catch (error) {
            // Do nothing here .....
        }
    }

    save() {
        this.loading = true;

        this.updateEstimate()
        .then(result => {
            this.loading = false;
            if (this.estimate.status == 1) {
                this.toastService.addToast(message.save, this.toastService.toastyType.success);
            }

            this.location.back();
        }).catch(error => {
            this.loading = false;
            if(error.statusText = 'Method Not Allowed')
                this.toastService.addToast(error.error, this.toastService.toastyType.error);
            else
                this.toastService.addToast(message.error, this.toastService.toastyType.error);
        });
    }

    send() {
        this.loading = true;

        this.estimate.status = 2;

        this.updateEstimate()
        .then(result => {
            this.sendSiteControlMail()
            .then(result => {
                this.loading = false;
                this.toastService.addToast("Guardado y envío exitoso.", this.toastService.toastyType.success);

                let navigationExtras: NavigationExtras = {
                    replaceUrl: true
                };
                this.router.navigate(['/app/estimate'], navigationExtras);
            }).catch(error => {
                this.loading = false;
                console.info(error);
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                    this.toastService.addToast(message.error, this.toastService.toastyType.error);
            });
        }).catch(error => {
            this.loading = false;
            console.info(error);
            if(error.statusText = 'Method Not Allowed')
                this.toastService.addToast(error.error, this.toastService.toastyType.error);
            else
                this.toastService.addToast(message.error, this.toastService.toastyType.error);
        });
    }

    getSectionWidth(section) {
        let result = ((this.estimate.sections.filter(x => x.element == section.element).length) * 45);
        return result > 90 ? result : 135;
    }

    getColSize(section) {
        let sectionLength = this.estimate.sections.filter(x => x.element == section.element).length;
        return sectionLength > 2 ? 45 : (135 / sectionLength);
    }

    range(start, end) {
        return (new Array(end - start + 1)).fill(undefined).map((_, i) => i + start);
    }

    updateEstimate() {
        return this.sharedEstimateService.updateEstimateTP(this.estimate);
    }

    sendSiteControlMail() {
        this.loading = true;
        return this.estimateService.sendSiteControlMailTP({
            estimateId: this.estimate.id,
            resident: (this.resident ? {
                username: this.resident.login,
                fullName: this.resident.workName + ' ' + this.resident.lastName + ' ' + this.resident.lastNameMother
            } : this.currentUser)
        });
    }

}
