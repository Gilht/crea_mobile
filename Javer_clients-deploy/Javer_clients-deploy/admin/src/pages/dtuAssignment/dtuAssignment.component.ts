import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EmailValidator } from '@angular/forms';
import { AppConfig } from '../../util/AppConfig';
import * as _ from 'underscore';
import { ToastOptions, ToastyService } from 'ng2-toasty';
import { debug } from 'util';
import { message } from '../../clientsSharedModule/sharedmodule'
import { SubdivisionService, ContactService, ContactDtuSubdivisionService, ContactDtuService, ResidentService, MyToastyService } from '../../services/services';
@Component({
    selector: 'dtuAssignment',
    templateUrl: ('./dtuAssignment.component.html'),
    styleUrls: ['./dtuAssignment.component.css'],
    providers: [SubdivisionService, ContactService, ContactDtuSubdivisionService, ContactDtuService, ResidentService, MyToastyService]
})
export class DtuAssignmentComponent {
    emailAlertError: any;
    switchPagination: boolean;
    dataToShow: any;
    users: any;
    _originalData: any;
    projects: any;
    sub: any;
    loading = true;
    currentPage: number = 1;
    AppConfig = AppConfig;
    showScreen = 'assignment';
    dtuAssign: any = {};
    contacts = [];
    newContact: any = {};
    alerts: any = {};
    allowAlerts: any = {};
    access = localStorage.getItem('access');
    writeFlag: any;
    readFlag: any;
    deleteFlag: any;

    constructor(private route: ActivatedRoute, private router: Router,
        private residentService: ResidentService,
        private contactService: ContactService,
        private subdivisionService: SubdivisionService,
        private contactDtuSubdivisionService: ContactDtuSubdivisionService,
        private contactDtuService: ContactDtuService,
        vcRef: ViewContainerRef, private toastService: MyToastyService) {
    }

    ngOnInit() {
        this.getSubdivisions();
        this.getResidents();
        this.verifyAccess('DTU_WRITE');
    }

    getSubdivisions() {
        this.sub = this.route.queryParams.subscribe(params => {
            this.projects = JSON.parse(params['newSubdivisions']);
        });
        if (this.projects.length == 1) {
            var readyToValidateEmail = this.projects[0].readyToValidateEmail || "";
            var alreadyValidatedEmail = this.projects[0].alreadyValidatedEmail || "";
            var rejectedEmail = this.projects[0].rejectedEmail || "";
            var acceptedDtuEmail = this.projects[0].acceptedDtuEmail || "";
            this.allowAlerts.readyToValidate = this.projects[0].readyToValidate;
            this.allowAlerts.readyToValidateEmail = readyToValidateEmail;
            this.allowAlerts.alreadyValidated = this.projects[0].alreadyValidated;
            this.allowAlerts.alreadyValidatedEmail = alreadyValidatedEmail;
            this.allowAlerts.rejected = this.projects[0].rejected;
            this.allowAlerts.rejectedEmail = rejectedEmail;
            this.allowAlerts.acceptedDtu = this.projects[0].acceptedDtu;
            this.allowAlerts.acceptedDtuEmail = acceptedDtuEmail;
        }
        this.contactDtuService.projectContacts(this.projects).subscribe(
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
        var body = {
            "subdivisions": this.projects,
            "contactDtu": this.newContact
        }
        this.contactDtuSubdivisionService.createContact(body).subscribe(
            response => {
                this.contacts.push(response.contactDtu);
                this.toastService.addToast(this.newContact.name + " ha sido agregado correctamente.", this.toastService.toastyType.success);
                this.newContact = {};
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                    this.toastService.addToast(message.error, this.toastService.toastyType.error);
            }
        );
    }

    deleteContact(contact) {
        this.contactDtuService.deleteContact(contact.id, this.projects).subscribe(
            response => {
                this.contacts = _.without(this.contacts, contact);
                this.toastService.addToast(contact.name + " ha sido eliminado correctamente de estos proyectos.", this.toastService.toastyType.success);
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                    this.toastService.addToast(message.error, this.toastService.toastyType.error)
            }
        );
    }
    isValidAsingnDtu() {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return this.dtuAssign.resident && this.dtuAssign.email && re.test(this.dtuAssign.email.toLowerCase());
    }

    asingnDtu() {
        this.loading = true;
        var x = {
            "subdivisions": this.projects,
            "dtuAssign": this.dtuAssign
        }
        this.subdivisionService.asingnDtu(x).subscribe(
            prjs => {
                this.loading = false;
                this.projects = prjs
                this.projects.forEach(project => {
                    project.dtuAgent = this.dtuAssign.resident;
                });
                this.toastService.addToast(this.dtuAssign.resident.workName + " ha sido asignado correctamente.", this.toastService.toastyType.success);
                this.dtuAssign = {};
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
    saveEmail() {
        this.loading = true;
        var x = {
            "subdivisions": this.projects,
            "alerts": this.allowAlerts
        }
        this.subdivisionService.saveEmail(x).subscribe(
            prjs => {
                this.loading = false;
                this.projects = prjs
                var readyToValidateEmail = _.uniq(this.projects.map(prj => prj.readyToValidateEmail)).filter(x => x && x.length > 0);
                var alreadyValidatedEmail = _.uniq(this.projects.map(prj => prj.alreadyValidatedEmail)).filter(x => x && x.length > 0);
                var rejectedEmail = _.uniq(this.projects.map(prj => prj.rejectedEmail)).filter(x => x && x.length > 0);
                var acceptedDtuEmail = _.uniq(this.projects.map(prj => prj.acceptedDtuEmail)).filter(x => x && x.length > 0);
                this.emailAlertError = _.some(
                    [readyToValidateEmail.length,
                    alreadyValidatedEmail.length,
                    rejectedEmail.length,
                    acceptedDtuEmail.length],
                    function (x) {
                        return x > 1
                    });
                this.toastService.addToast(message.save, this.toastService.toastyType.success);
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                    this.toastService.addToast(message.error, this.toastService.toastyType.error)
            }
        );
    }

    allowSaveEmail() {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return (this.allowAlerts.alreadyValidatedEmail || this.allowAlerts.readyToValidateEmail || this.allowAlerts.rejectedEmail || this.allowAlerts.acceptedDtuEmail) &&
            (!this.allowAlerts.readyToValidateEmail) &&
            (!this.allowAlerts.alreadyValidatedEmail) &&
            (!this.allowAlerts.rejectedEmail) &&
            (!this.allowAlerts.acceptedDtuEmail);
    }

    public pageChanged(evt) {
        let page = evt.page - 1;
        this.projects = this.dataToShow.slice(page * 20, page * 20 + evt.itemsPerPage)
    }

    populateResidentEmail() {
        this.dtuAssign.email = this.dtuAssign.resident.login.toLowerCase() + '@javer.com.mx';
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
