import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { FormGroup, FormControl } from '@angular/forms';

import { LanguageProvider } from '../../providers/language/language';

import { AuthProvider } from '../../providers/auth/auth';


import { AuthPage } from '../auth/auth';

/**
 * Generated class for the LanguageSelectPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-language-select',
  templateUrl: 'language-select.html',
})
export class LanguageSelectPage {

  lang;
  langForm: FormGroup;

  constructor(
    private languageProvider: LanguageProvider,
    public navCtrl: NavController,
    public navParams: NavParams,
    private auth: AuthProvider
  ) {
    this.langForm = new FormGroup({
      "lang": new FormControl({value: 'es', disabled: false})
    });
  }

  ionViewDidLoad() {
    if (localStorage.getItem('lang')) {
      this.goAuth();
    }
  }

  ionViewCanEnter() {
    return !!this.auth.guardNotAuthenticated();
  }

  doSubmit(event) {
    this.languageProvider.switchLanguage(this.langForm.value.lang);
    this.goAuth();
  }

  goAuth(){
    setTimeout(()=>{
      this.navCtrl.push(AuthPage)
    })
  }

}
