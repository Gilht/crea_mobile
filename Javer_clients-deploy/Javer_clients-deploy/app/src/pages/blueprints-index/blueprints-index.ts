import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AppConfig } from '../../util/AppConfig';
import * as download from 'downloadjs';
import { CorePage } from '../core/core';
import { ServiceUtil, message } from '../../clientsSharedModule/sharedmodule';
import { ToastService, BlueprintsService } from '../../services/services';
import { DocumentViewer, DocumentViewerOptions } from '@ionic-native/document-viewer';
import { FileOpener } from '@ionic-native/file-opener';
import { File } from '@ionic-native/file';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { SynchroController } from '../../offlinecontrollers/offlineControllers';
@IonicPage()
@Component({
    selector: 'page-blueprints-index',
    templateUrl: 'blueprints-index.html',
    providers: [BlueprintsService, DocumentViewer, FileOpener, File]
})
export class BlueprintsIndexPage {
    filterPrototipo: string = '';
    filterProject: any = '';
    isImageVisible = false;
    isMenuOptionsVisible: boolean = false;
    subCategoryObject: any;
    options: DocumentViewerOptions = { title: 'myPDF' };
    loading: boolean = true;
    selectedfile: any;
    subCategoryName: string = ""
    categoryName: string = "";
    prototypeName: string = "";
    residentPrototypes: any = [];
    dataToShow: any = [];
    subcategories: any = [];
    prototipos: any = [];
    AppConfig = AppConfig;
    subcateroriesName: any;
    collapseable = [];
    ionicButtonColor = 'lightdark';
    resident: any = ServiceUtil.getResident();
    projects = [];
    subcategoryPrototypeId: string = "";


    constructor(public navCtrl: NavController, public navParams: NavParams, private file: File, private fileOpener: FileOpener, public documentViewer: DocumentViewer, public blueprintsService: BlueprintsService, public toastService: ToastService, private synchroController: SynchroController) {
        this.synchroController.get(this.synchroController.models.resident).then(res => {
            this.resident = res || [];
            this.getHousePrototype();
        });
    }

    getHousePrototype() {

        this.blueprintsService.getHousePrototype(this.resident.id).subscribe(
            result => {
                if (result) {
                    this.residentPrototypes = result.prototypes;
                    this.projects = result.projects;
                    this.collapseable = new Array(this.residentPrototypes.length).fill(false);
                    this.sortResidentPrototypes();
                } else {
                    this.toastService.presentToast(message.config, this.toastService.types.warning);
                }
                this.loading = false;
            },
            error => {
                this.toastService.presentToast(message.error, this.toastService.types.error);
            }
        );
    }
    onSalirClick() {
        this.navCtrl.setRoot(CorePage);
    }
    filterPrototypes() {
        if (this.filterProject != '')
            this.dataToShow = this.residentPrototypes.filter(x => this.filterProject.ids.some(y => y == x.projectId));
        else
            this.dataToShow = [];
    }

    onSubCategoryClick(subcategory, prototype) {
        this.isMenuOptionsVisible = true;
        this.subcategoryPrototypeId = subcategory.id;
        this.subCategoryObject = subcategory;
        this.prototypeName = prototype.name;
        this.categoryName = subcategory.subcategory.category.name;
        this.subCategoryName = subcategory.subcategory.name;
    }

    downloadPDF() {
        var filename = this.filterProject.name + '-' + this.prototypeName + '-' + this.categoryName + '-' + this.subCategoryName;
        filename = filename.substring(0, filename.length >= 46 ? 46 : filename.length);
        filename += '.pdf';
        this.loading = true;
        this.blueprintsService.getFile(this.subcategoryPrototypeId).subscribe(
            result => {
                this.loading = false;
                if (result.length || result.length > 0) {
                    this.file.writeFile(this.file.externalApplicationStorageDirectory, filename, this.b64toBlob(result.split(",")[1], "aplication/pdf"), { replace: true }).then(res => {
                        this.fileOpener.open(
                            res.toInternalURL(),
                            'application/pdf'
                        ).then((res) => {

                        });
                    })
                }
            },
            error => {
                this.toastService.presentToast(message.error, this.toastService.types.error);
            }
        );


    }

    sortResidentPrototypes() {
        if (this.residentPrototypes.length != 0) {
            this.residentPrototypes.forEach(prototype => {
                prototype.subcategories.sort((a, b) => {
                    if (a.subcategory.category.name > b.subcategory.category.name) {
                        return 1;
                    }
                    else if (a.subcategory.category.name < b.subcategory.category.name) {
                        return -1;
                    }
                    else {
                        return 0;
                    }
                });
            });
        }
    }

    isSameCategory(i, prototype) {
        if (i == 0) {
            return true;
        }
        else if (prototype.subcategories[i].subcategory.categoryId != prototype.subcategories[i - 1].subcategory.categoryId) {
            return true;
        }
        else {
            return false;
        }

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

}