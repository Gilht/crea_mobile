import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { SessionStatus } from '../clientsSharedModule/Enums';

@Injectable()
export class SharedService {
    static instance: SharedService;
    private sessionSubject = new BehaviorSubject<number>(SessionStatus.Invalid);
    private sessionStatus = SessionStatus.Invalid;
    // To avoid service consumers using the subject API, when you subscribe to this
    // it works as a getter the "$" sign is a convention
    public sessionStatusObs$ = this.sessionSubject.asObservable();

    constructor() {
        if (!SharedService.instance)
            SharedService.instance = this;
        return SharedService.instance;
    }

    setSessionStatus(status: SessionStatus) {
        this.sessionStatus = status;
        this.sessionSubject.next(status);
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
