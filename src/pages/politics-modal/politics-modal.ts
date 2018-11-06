import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';
import { PoliticsPage } from '../politics/politics';
/**
 * Generated class for the PoliticsModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-politics-modal',
  templateUrl: 'politics-modal.html',
})
export class PoliticsModalPage {

	public type: number = 1;
	public urlPolitics: string = 'https://drive.google.com/file/d/1vWBl1QTvTi4kxTiq0czTIShhOGkdhH5_/preview';
	public urlTerms: string = 'https://drive.google.com/file/d/1xlXGld93v56dvN_zB9BKRatBopqk2FrN/preview';
	public urlShow: any;
	public title: string = '';

  constructor(public navCtrl: NavController, public navParams: NavParams, public sanitizer: DomSanitizer,public viewCtrl: ViewController) {
  	this.type = navParams.get('typeS');
  	if (this.type == 1) {
    	this.urlShow = this.sanityUrl(this.urlTerms);
    	this.title = 'Términos y condiciones';
    } else {
    	this.urlShow = this.sanityUrl(this.urlPolitics);
    	this.title = 'Políticas de privacidad';
    }
  }

  sanityUrl(url){
  	return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  goBack(){
  	this.viewCtrl.dismiss();
  }

}
