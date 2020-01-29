import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EmailValidator } from '@angular/forms';
import { AppConfig } from '../../util/AppConfig';
import * as _ from 'underscore';
import { message } from '../../clientsSharedModule/sharedmodule';
import { ResidentService, ContactService, MyToastyService, SubdivisionService, ContactSubdivisionService } from '../../services/services';


@Component({
    selector: 'purchaseAssignment',
    templateUrl: ('./purchaseAssignment.component.html'),
    styleUrls: ['./purchaseAssignment.component.css'],
    providers: [MyToastyService, ResidentService, ContactService, ContactSubdivisionService, SubdivisionService]
})
export class PurchaseAssignmentComponent {
    switchPagination: boolean;
    dataToShow: any;
    users: any;
    _originalData: any;
    projects: any;
    loading = true;
    currentPage: number = 1;
    AppConfig = AppConfig;
    showScreen = 'assignment';
    purchaseAssign: any = {};
    sub: any;
    contacts = [];
    newContact: any = {};
    access = localStorage.getItem('access');
    writeFlag: any;
    Flag: any;
    deleteFlag: any;
    constructor(private route: ActivatedRoute, private router: Router, private residentService: ResidentService,
        vcRef: ViewContainerRef, private toastService: MyToastyService,
        private contactService: ContactService, private contactSubdivisionService: ContactSubdivisionService,
        private subdivisionService: SubdivisionService) {



    }

    ngOnInit() {
        this.getSubdivisions();
        this.getResidents();
        this.verifyAccess('COMPRAS_WRITE');
    }

    getSubdivisions() {
        this.sub = this.route.queryParams.subscribe(params => {
            this.projects = JSON.parse(params['newSubdivisions']);
        });
        this.contactService.projectContacts(this.projects).subscribe(
            result => {
                this.loading = false;
                this.contacts = result;
                if (this.projects.length > 1)
                    this.toastService.addToast(message.proyect.selectOne, this.toastService.toastyType.info)
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                    this.toastService.addToast(message.error, this.toastService.toastyType.error)
            }
        );
    }

    getResidents() {
        this.residentService.getResidentUsers().subscribe(
            result => {
                this.users = result;
                this.loading = false;
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                    this.toastService.addToast(message.error, this.toastService.toastyType.error)
            }
        );
    }

    isValidAsingnContact() {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return this.newContact.name && this.newContact.email && re.test(this.newContact.email.toLowerCase());
    }

    asingnContact() {
        this.loading = true;
        var body = {
            "subdivisions": this.projects,
            "contact": this.newContact
        }
        this.contactSubdivisionService.createContact(body).subscribe(
            response => {
                this.contacts.push(response.contact);
                this.loading = false;
                this.toastService.addToast(this.newContact.name + " ha sido agregado correctamente.", this.toastService.toastyType.success);
                this.newContact = {};
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                    this.toastService.addToast(message.error, this.toastService.toastyType.error)
            }
        );
    }

    deleteContact(contact) {
        this.loading = true;
        this.contactService.deleteContact(contact.id, this.projects).subscribe(
            response => {
                this.loading = false;
                this.contacts = _.without(this.contacts, contact);
                this.toastService.addToast(contact.name + " ha sido borrado correctamente.", this.toastService.toastyType.success);
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                    this.toastService.addToast(message.error, this.toastService.toastyType.error)
            }
        );
    }
    isValidAsingnPurchase() {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return this.purchaseAssign.resident && this.purchaseAssign.email && re.test(this.purchaseAssign.email.toLowerCase());
    }

    asingnPurchase() {
        this.loading = true;
        var x = {
            "subdivisions": this.projects,
            "purchaseAssign": this.purchaseAssign
        }
        this.subdivisionService.asingnPurchase(x).subscribe(
            prjs => {
                this.loading = false;
                this.projects = prjs
                this.projects.forEach(project => {
                    project.purchasingAgent = this.purchaseAssign.resident;
                });
                this.toastService.addToast(this.purchaseAssign.resident.workName + " ha sido asignado correctamente.", this.toastService.toastyType.success);
                this.purchaseAssign = {};
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                    this.toastService.addToast(message.error, this.toastService.toastyType.error)
                this.loading = false;
            }
        );
    }

    public pageChanged(evt) {
        let page = evt.page - 1;
        this.projects = this.dataToShow.slice(page * 20, page * 20 + evt.itemsPerPage)
    }

    populateResidentEmail() {
        this.purchaseAssign.email = this.purchaseAssign.resident.login.toLowerCase() + '@javer.com.mx';
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    verifyAccess(permission){
        if(permission.indexOf('WRITE')+1)
        if(this.access.includes(permission)) this.writeFlag = true;

        if(permission.indexOf('DELETE')+1)
        if(this.access.includes(permission)) this.deleteFlag = true;
    }
}
