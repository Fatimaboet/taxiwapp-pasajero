import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

/**
 * Generated class for the FinishServiceComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'finish-service',
  templateUrl: 'finish-service.html'
})
export class FinishServiceComponent {

  propine: number;

  constructor(public viewCtrl: ViewController ,public params: NavParams,) {
    console.log('Hello FinishServiceComponent Component');
    this.propine = params.get('propine');
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
