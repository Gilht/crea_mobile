import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EmailValidator } from '@angular/forms';
import { AppConfig } from '../../util/AppConfig';
import * as _ from 'underscore';
import { message } from '../../clientsSharedModule/sharedmodule';
import { ResidentService, ContactControlService, MyToastyService, SubdivisionService, ContactControlSubdivisionService, ContactNotifySubdivisionService, ContactNotifyService } from '../../services/services';


@Component({
    selector: 'controlAssignment',
    templateUrl: ('./siteControlAssignment.component.html'),
    styleUrls: ['./siteControlAssignment.component.css'],
    providers: [MyToastyService, ResidentService, ContactControlService, ContactControlSubdivisionService, SubdivisionService, ContactNotifySubdivisionService, ContactNotifyService]
})
export class SiteControlAssignmentComponent {
    switchPagination: boolean;
    dataToShow: any;
    users: any;
    _originalData: any;
    projects: any;
    loading = true;
    currentPage: number = 1;
    AppConfig = AppConfig;
    showScreen = 'assignment';
    controlAssign: any = {};
    sub: any;
    contacts = [];
    contactsNotify = [];
    newContact: any = {};
    newContactNotify: any = {};
    access = localStorage.getItem('access');
    writeFlag: any;
    readFlag: any;
    deleteFlag: any;
    constructor(private route: ActivatedRoute, private router: Router, private residentService: ResidentService,
        vcRef: ViewContainerRef, private toastService: MyToastyService,
        private contactControlService: ContactControlService, private contactControlSubdivisionService: ContactControlSubdivisionService,
        private subdivisionService: SubdivisionService, private contactNotifySubdivisionService: ContactNotifySubdivisionService,
        private contactNotifyService: ContactNotifyService) {
    }

    ngOnInit() {
        this.getSubdivisions();
        this.getResidents();
        this.verifyAccess('CONTROL_OBRA_WRITE');
    }

    getSubdivisions() {
        this.sub = this.route.queryParams.subscribe(params => {
            this.projects = JSON.parse(params['newSubdivisions']);
        });
        this.contactControlService.projectContacts(this.projects).subscribe(
            result => {
                this.contacts = result;
                if (this.projects.length > 1)
                    this.toastService.addToast(message.proyect.selectOne, this.toastService.toastyType.info);
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                this.toastService.addToast(message.error, this.toastService.toastyType.error)
            }
        );
        this.contactNotifyService.projectContacts(this.projects).subscribe(
            result => {
                this.contactsNotify = result;
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
    isValidAsingnContactNotify() {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return this.newContactNotify.name && this.newContactNotify.email && re.test(this.newContactNotify.email.toLowerCase());
    }

    asingnContact() {
        this.loading = true;
        var body = {
            "subdivisions": this.projects,
            "contactControl": this.newContact
        }
        this.contactControlSubdivisionService.createContact(body).subscribe(
            response => {
                this.contacts.push(response.contactControl);
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
    asingnContactNotify() {
        this.loading = true;
        var body = {
            "subdivisions": this.projects,
            "contactNotify": this.newContactNotify
        }
        this.contactNotifySubdivisionService.createContact(body).subscribe(
            response => {
                this.contactsNotify.push(response.contactNotify);
                this.loading = false;
                this.toastService.addToast(this.newContactNotify.name + " ha sido agregado correctamente.", this.toastService.toastyType.success);
                this.newContactNotify = {};
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
        this.contactControlService.deleteContact(contact.id, this.projects).subscribe(
            response => {
                this.loading = false;
                this.contacts = _.without(this.contacts, contact);
                this.toastService.addToast(contact.name + " ha sido eliminado correctamente.", this.toastService.toastyType.success);
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                this.toastService.addToast(message.error, this.toastService.toastyType.error)
            }
        );
    }

    deleteContactNotify(contact) {
        this.loading = true;
        this.contactNotifyService.deleteContact(contact.id, this.projects).subscribe(
            response => {
                this.loading = false;
                this.contactsNotify = _.without(this.contactsNotify, contact);
                this.toastService.addToast(contact.name + " ha sido eliminado correctamente.", this.toastService.toastyType.success);
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
        return this.controlAssign.resident && this.controlAssign.email && re.test(this.controlAssign.email.toLowerCase());
    }

    asingnControl() {
        this.loading = true;
        var x = {
            "subdivisions": this.projects,
            "controlAssign": this.controlAssign
        }
        this.subdivisionService.asingnControl(x).subscribe(
            prjs => {
                this.loading = false;
                this.projects = prjs
                this.projects.forEach(project => {
                    project.controlAgent = this.controlAssign.resident;
                });
                this.toastService.addToast(this.controlAssign.resident.workName + " ha sido asignado correctamente.", this.toastService.toastyType.success);
                this.controlAssign = {};
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                this.toastService.addToast(message.error, this.toastService.toastyType.error);
                this.loading = false;
            }
        );
    }

    public pageChanged(evt) {
        let page = evt.page - 1;
        this.projects = this.dataToShow.slice(page * 20, page * 20 + evt.itemsPerPage)
    }

    populateResidentEmail() {
        this.controlAssign.email = this.controlAssign.resident.login.toLowerCase() + '@javer.com.mx';
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
