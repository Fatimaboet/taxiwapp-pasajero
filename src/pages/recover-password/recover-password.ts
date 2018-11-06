import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { FormGroup, FormControl, Validators } from '@angular/forms';

import { AuthProvider } from '../../providers/auth/auth';
import { BaseProvider } from '../../providers/base/base';

import { LoginPage } from '../login/login';

/**
 * Generated class for the RecoverPasswordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-recover-password',
  templateUrl: 'recover-password.html',
})
export class RecoverPasswordPage {

  public form: FormGroup;
  private submitted: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, public auth: AuthProvider, public base: BaseProvider) {
    this.form = new FormGroup({
      "email": new FormControl('', Validators.compose([Validators.required, Validators.email])),
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RecoverPasswordPage');
  }

  ionViewCanEnter() {
    return !!this.auth.guardNotAuthenticated();
  }

  validate(control: string) {
    return this.form.controls[control].errors && (this.form.controls[control].touched || this.submitted);
  }

  send() {
    console.log(this.form.value)
    if (this.form.valid) {
      this.submitted = true;
      this.base.startLoading();
      this.auth.recoverPassword(this.form.value.email).toPromise().then(
        resp => {
          console.log(resp);
          this.base.stopLoading();
          this.base.showToast("successRecoverPass");
        },
        error => {
          console.log(error);
          this.base.stopLoading();
          this.base.showToast("error", "alert");
        }
      )
    } else {
      this.base.showToast('completeFields');
    }
  }

  goBack() {
    this.navCtrl.setRoot(LoginPage);
  }

}
