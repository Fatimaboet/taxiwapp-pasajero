import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { LoginPage } from '../login/login';
import { RegisterPage } from '../register/register';


import { AuthProvider } from '../../providers/auth/auth'; 

/**
 * Generated class for the AuthPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-auth',
  templateUrl: 'auth.html',
})
export class AuthPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, private authService: AuthProvider) {
  }

  ionViewDidLoad() {
  }

  ionViewCanEnter() {
    return !!this.authService.guardNotAuthenticated();
  }

  login() {
  	this.navCtrl.push(LoginPage);
  }

  register() {
  	this.navCtrl.push(RegisterPage);
  }

  loginGoogle() {
  	this.authService.loginGoogle().then(res => console.log(res)).catch(err => console.error(err));
  }

}
