import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { SessionStatus } from '../clientsSharedModule/Enums';
import { Storage } from '@ionic/storage';

@Injectable()
export class SharedService {
    private responseSource = new BehaviorSubject<boolean>(false);
    public online = false;
    static instance: SharedService;
    // To avoid service consumers using the subject API
    response$ = this.responseSource.asObservable();

    private sessionSubject = new BehaviorSubject<number>(SessionStatus.Invalid);
    private sessionStatus = SessionStatus.Invalid;
    public sessionStatusObs$ = this.sessionSubject.asObservable();

    private sectionHousesSyncErrorSubject = new BehaviorSubject<any>({hasError: false, response: {}});
    private sectionHousesSyncError = {hasError: false, response: {}};
    public sectionHousesSyncError$ = this.sectionHousesSyncErrorSubject.asObservable();


    constructor(private storage: Storage) {
        if (!SharedService.instance)
            SharedService.instance = this;
        return SharedService.instance;
    }

    response(conn: boolean) {
        this.online = conn;
        this.responseSource.next(conn);
    }

    getOnline() {
        return this.online;
    }

    setSessionStatus(status: SessionStatus) {
        this.sessionStatus = status;
        this.sessionSubject.next(status);
    }

    // This might be unnecessary
    getSessionStatus(): SessionStatus {
        return this.sessionStatus;
    }

    setSectionHousesSyncError(errorResponse: { hasError?: boolean, response?: any }) {
        let { hasError = false, response = {} } = errorResponse; // Default values
        const finalObj = { hasError, response };
        this.sectionHousesSyncError = finalObj;
        this.sectionHousesSyncErrorSubject.next(finalObj);
    }

    getSectionHousesSyncError(): any {
        return this.sectionHousesSyncError;
    }

    isValidSession(): boolean {
        let isValid: boolean = (this.sessionStatus == SessionStatus.Valid);

        if (isValid) {
            return isValid;
        } else {
            // The session is commonly marked as expired when the interceptor receive a 401 http code
            // Expired means the user had a token and is not valid anymore
            if (this.sessionStatus != SessionStatus.Expired) {
                // If a token is found set as valid
                let token = localStorage.getItem('token');
                return (token != null);
            } else {
                return false;
            }
        }
    }

}
