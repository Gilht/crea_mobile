import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ViewController, NavParams } from 'ionic-angular';
import { AppConfig } from '../../util/AppConfig';
import * as _ from 'lodash';

@Component({
    selector: 'page-policyAgreementModal',
    templateUrl: 'policyAgreementModal.html',
})
export class PolicyAgreementModalPage {
  policy: any = null;
  version: string = '';
  title: string = '';
  content: string = '';
  userStatement: string = '';
  accepted: boolean = false;

  constructor(
    private viewCtrl: ViewController,
    private params: NavParams,
    private http: HttpClient
  ) {
    // Init vars
    this.policy = (_.isEmpty(this.params.get('policyObject')) ? null : this.params.get('policyObject'));
    this.accepted = false;

    if (this.policy) {
      this.version = this.policy.version;
      this.title = this.policy.title;
      this.userStatement = this.policy.userStatement;
      this.content = this.policy.content;
    } else {
    }
  }

  dismiss() {
    let response = {
      policyAccepted: this.accepted
    };

    this.viewCtrl.dismiss(response);
  }

}

