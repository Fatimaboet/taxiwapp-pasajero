import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, Events } from 'ionic-angular';

import { FormGroup, FormControl, Validators } from '@angular/forms';

import { RecoverPasswordPage } from '../recover-password/recover-password';
import { HomePage } from '../home/home';

import { AuthProvider } from '../../providers/auth/auth';
import { BaseProvider } from '../../providers/base/base';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  public loginForm: FormGroup;
  private submitted: boolean = false;
  private pushPage = RecoverPasswordPage;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public auth: AuthProvider,
    private toast: ToastController,
    private baseService: BaseProvider,
    private events: Events
  ) {
    this.loginForm = new FormGroup({
      "email": new FormControl('', Validators.compose([Validators.required, Validators.email])),
      "pass": new FormControl('', Validators.compose([Validators.required, Validators.minLength(6)])),
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  ionViewCanEnter() {
    console.log(!!this.auth.guardNotAuthenticated())
    return !!this.auth.guardNotAuthenticated();
  }

  validate(control: string) {
    return this.loginForm.controls[control].errors && (this.loginForm.controls[control].touched || this.submitted);
  }

  login(){
    this.submitted = true;
    if (!this.loginForm.valid) {
      this.baseService.showToast('completeFields');
    } else {
      this.baseService.startLoading();
      this.auth.login(this.loginForm.value.email, this.loginForm.value.pass).subscribe(
        resp => {
          this.baseService.showToast('welcome');
          this.baseService.stopLoading();
          console.log(JSON.stringify(resp.recordset[0]))
          this.saveUserData(resp.recordset[0].idUsuario,resp.token);
        },
        error => {
          this.baseService.stopLoading();
          console.log(JSON.stringify(error.error))
          this.baseService.showToast('emailPassIncorrent');
        }
      );
    }
  }

  saveUserData(id: string, token?: string){
    console.log(id, token)
    localStorage.setItem('idUsuario', id);
    if (token) localStorage.setItem('TokenTWP', token);
    setTimeout(()=> this.events.publish('user:login'));
  }

}
