import { Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';

import { environment } from '../../environments/environment';

import { PaymentMethodComponent } from '../payment-method/payment-method';

/**
 * Generated class for the DriversComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'drivers',
  templateUrl: 'drivers.html'
})
export class DriversComponent implements OnChanges{

  @Input() data: Array<any>;
  @Input() payments: Array<any>;
  @Output() select: EventEmitter<any> = new EventEmitter<any>();
  payment: any;
  
  public route = environment.documents;

  constructor(public modalCtrl: ModalController) {
    
  }

  ngOnChanges() {
    console.log(this.data)
    if (this.payments.length) {
      this.payment = this.payments[0];
    }
  }

  selectDriver(driver){
    this.select.emit(driver);
  }

  goPayments(){
    let modal = this.modalCtrl.create(PaymentMethodComponent);
    modal.present();
    modal.onDidDismiss((method) => {
      if (method) {
        this.payment = method;
      }
    })
  }

}
