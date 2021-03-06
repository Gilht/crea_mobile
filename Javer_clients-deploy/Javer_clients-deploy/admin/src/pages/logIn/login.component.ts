import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../util/AppConfig';
import { SharedUserService, message, ApiErrorCodes } from '../../clientsSharedModule/sharedmodule';
import { MyToastyService } from '../../services/services';

import * as _ from 'lodash';

import { Overlay, overlayConfigFactory } from 'angular2-modal';
import { Modal, BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { PolicyAgreementComponent, PolicyAgreementContext } from '../../modals/policyAgreementModal/policyAgreementModal.component';

@Component({
    selector: 'login',
    templateUrl: ('./login.component.html'),
    styleUrls: ['./login.component.css'],
    providers: [SharedUserService, MyToastyService]
})
export class LoginComponent {
    newUser: any = {};
    password: string;
    showPassword: boolean = false;
    passwordInputType: string = 'password';
    loading = false;
    AppConfig = AppConfig;
    serverVersion: string = AppConfig.desiredServerVersion;
    adminVersion: string = AppConfig.version;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private sharedUserService: SharedUserService,
        private vcRef: ViewContainerRef,
        private modal: Modal,
        private toastService: MyToastyService
    ) {
        this.modal.overlay.defaultViewContainer = this.vcRef;
    }

    login() {
        this.loading = true;

        // Server validations
        this.validateServerVersion().then(() => {
            // This version app version is compatible
            return this.validateLogin();
        }).then(response => {
            localStorage.setItem('token', response.token);
            localStorage.setItem('CurrentUser', this.newUser.userName);
            localStorage.setItem('UserName', response.userName);

            return this.checkPoliciesAgreements();
        }).then(() => {
            this.loading = false;
            this.router.navigateByUrl('/app');
        }).catch(customErrorWrapper => {
            this.handleServerClientErros(customErrorWrapper);
            this.loading = false;
        });
    }

    private handleServerClientErros(customErrorWrapper) {
        if (customErrorWrapper.type == 'server') {
            // Server Error Handlers
            if (customErrorWrapper.errorResponse.error.code) { // The error was generated by the server
                switch(customErrorWrapper.errorResponse.error.code) {
                    case ApiErrorCodes.USER_IS_NOT_REGISTERED:
                        this.toastService.addToast("El usuario aún no ha sido registrado en el portal.", this.toastService.toastyType.error);
                        break;
                    case ApiErrorCodes.USER_WRONG_USERNAME_PASSWORD:
                        this.toastService.addToast("El usuario o contraseña son incorrectos.", this.toastService.toastyType.error);
                        break;
                    case ApiErrorCodes.USER_NOT_ACCEPTED_PRIVACY_POLICY:
                        this.toastService.addToast("El usuario aún no ha aceptado el aviso de privacidad.", this.toastService.toastyType.error);
                        break;
                    case ApiErrorCodes.USER_NO_ASSIGNED_SECTION_HOUSES:
                        this.toastService.addToast("El usuario no tiene viviendas asignadas.", this.toastService.toastyType.error);
                        break;
                    case ApiErrorCodes.GENERAL_GENERATING_RESPONSE:
                        this.toastService.addToast("Error al generar la respuesta en el servidor.", this.toastService.toastyType.error);
                        break;
                    case ApiErrorCodes.GENERAL_CALLING_WEB_SERVICE:
                        this.toastService.addToast("Error al llamar al web service externo en el servidor.", this.toastService.toastyType.error);
                        break;
                    default:
                        console.error('Server error...', customErrorWrapper.errorResponse);
                        this.toastService.addToast(message.noInternet, this.toastService.toastyType.error);
                        break;
                }
            } else { // Other error (connection problem / crash / old server error)
                console.error('Unknown error...', customErrorWrapper);

                if (customErrorWrapper.errorResponse.status == 0) {
                    this.toastService.addToast(message.noInternet, this.toastService.toastyType.error);
                } else {
                    this.toastService.addToast(message.error, this.toastService.toastyType.error);
                }
            }
        } else {
            // App Error Handlers
            switch(customErrorWrapper.clientCode) {
                case 'CLIENT_VERSION_NOT_COMPATIBLE':
                    this.toastService.addToast(message.version.incompatiblePortal, this.toastService.toastyType.error);
                    break;
                case 'USER_WRONG_USERNAME_PASSWORD':
                    this.toastService.addToast(message.credentials, this.toastService.toastyType.warning);
                    break;
                case 'USER_DENIED_PRIVACY_POLICY':
                    this.toastService.addToast('Es necesario aceptar la política de privacidad para iniciar sesión.', this.toastService.toastyType.warning);
                    break;
                default:
                    this.toastService.addToast("Error de conexión.", this.toastService.toastyType.error);
                    console.info('This error was not handled...', customErrorWrapper);
                    break;
            }
        }
    }

    private validateServerVersion(): Promise<any> {
        // On success forward response
        return this.sharedUserService.checkServerVersion(this.adminVersion, this.serverVersion, false)
        .toPromise()
        .then(response => {
            if (!response.hasOwnProperty('isCompatible') || (response && !response.isCompatible)) {
                throw {
                    type: 'client',
                    clientCode: 'CLIENT_VERSION_NOT_COMPATIBLE'
                };
            }
        }).catch(error => {
            // Check if it's a user defined error
            if (error.hasOwnProperty('type') && error.type == 'client') {
                throw error;
            } else {
                throw {
                    type: 'server',
                    errorResponse: error
                };
            }
        });
    }

    private validateLogin(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (_.isEmpty(this.newUser.userName) || _.isEmpty(this.newUser.password)) {
                return reject({
                    type: 'client',
                    clientCode: 'USER_WRONG_USERNAME_PASSWORD'
                });
            } else {
                return resolve();
            }
        }).then(() => {
            return this.sharedUserService.login(this.newUser)
            .toPromise()
            .catch(error => {
                throw {
                    type: 'server',
                    errorResponse: error
                };
            });
        });
    }

    private checkPoliciesAgreements(): Promise<any> {
        return this.sharedUserService.checkPoliciesAgreements(this.newUser.userName)
        .toPromise()
        .catch(errorResponse => {

            const evalModal = (policiesErrors) => {
                let policyError = policiesErrors.shift();
                let promise = Promise.resolve();

                // Define how to handle each policy error
                if (policyError.code == ApiErrorCodes.USER_NOT_ACCEPTED_PRIVACY_POLICY) {
                    promise = this.showPrivacyPolicyModal();
                }

                if (policiesErrors.length == 0) {
                    return promise;
                } else {
                    return promise.then(() => {
                        return evalModal(policiesErrors);
                    });
                }
            }


            // The error is handled here to return the modal as an additional validation
            if (errorResponse.error.policiesErrors) {
                return evalModal(errorResponse.error.policiesErrors)
                .then(() => this.checkPoliciesAgreements());
            } else {
                // throw any other server error
                throw {
                    type: 'server',
                    errorResponse
                };
            }
        });
    }

    private showPrivacyPolicyModal() {
        return this.sharedUserService.getServicePolicy('privacyPolicy')
        .toPromise()
        .then(policy => {
            return this.modal.open(PolicyAgreementComponent, overlayConfigFactory({
                policy
            }, PolicyAgreementContext))
            .then((dref) => dref.result)
            .then(response => {
                if (response && response.policyAccepted == true) {
                    return;
                } else {
                    throw {
                        type: 'client',
                        clientCode: 'USER_DENIED_PRIVACY_POLICY'
                    };
                }
            });
        }).then(() => {
            // The policy was accepted in the modal so we
            // do an update on the server and validate again
            return this.sharedUserService.updateLatestAgreedServicePolicy(this.newUser.userName, 'privacyPolicy')
            .toPromise();
        });
    }

    doLogin() {
        this.sharedUserService.login(this.newUser)
        .subscribe(
            result => {
                localStorage.setItem('token', result.token);
                localStorage.setItem('CurrentUser', this.newUser.userName);
                localStorage.setItem('UserName', result.userName);
                this.router.navigateByUrl('/app');

                this.loading = false;
            },
            errorResponse => {
                if (errorResponse.statusText == 'Method Not Allowed') {
                    this.toastService.addToast(errorResponse.error, this.toastService.toastyType.error);
                } else {
                    switch(errorResponse.error.code) {
                        case ApiErrorCodes.USER_IS_NOT_REGISTERED:
                            this.toastService.addToast("El usuario aún no ha sido registrado en el portal.", this.toastService.toastyType.error);
                            break;
                        case ApiErrorCodes.USER_WRONG_USERNAME_PASSWORD:
                            this.toastService.addToast("El usuario o contraseña son incorrectos.", this.toastService.toastyType.error);
                            break;
                        case ApiErrorCodes.USER_NOT_ACCEPTED_PRIVACY_POLICY:
                            this.toastService.addToast("El usuario aún no ha aceptado el aviso de privacidad.", this.toastService.toastyType.error);
                            break;
                        case ApiErrorCodes.USER_NO_ASSIGNED_SECTION_HOUSES:
                            this.toastService.addToast("El usuario no tiene viviendas asignadas.", this.toastService.toastyType.error);
                            break;
                        case ApiErrorCodes.GENERAL_GENERATING_RESPONSE:
                            this.toastService.addToast("Error al generar la respuesta en el servidor.", this.toastService.toastyType.error);
                            break;
                        case ApiErrorCodes.GENERAL_CALLING_WEB_SERVICE:
                            this.toastService.addToast("Error al llamar al web service externo en el servidor.", this.toastService.toastyType.error);
                            break;
                        default:
                            this.toastService.addToast("Error de conexión.", this.toastService.toastyType.error);
                            break;
                    }
                }

                this.loading = false;
            }
        );
    }

    changePasswordInputType() {
        if (this.showPassword) {
            this.passwordInputType = "text";
        } else {
            this.passwordInputType = "password";
        }
    }

}
