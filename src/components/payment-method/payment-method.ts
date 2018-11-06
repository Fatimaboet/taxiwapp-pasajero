import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ModalController, ViewController } from 'ionic-angular';

import { BaseProvider } from '../../providers/base/base';
import { PaymentProvider } from '../../providers/payment/payment';

import { MethodCheckoutComponent } from '../../components/method-checkout/method-checkout';

/**
 * Generated class for the PaymentMethodComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'payment-method',
  templateUrl: 'payment-method.html'
})
export class PaymentMethodComponent {

  @Input() paymentMethod: Array<any>;
  @Output() method: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    public viewCtrl: ViewController,
    private baseService: BaseProvider,
    private paymentService: PaymentProvider,
    private modalCtrl: ModalController
  ) {
    this.getMethod();
  }

  getMethod(){
    this.baseService.startLoading();
    this.paymentService.getPaymentMethod().toPromise().then(
      resp => {
        this.baseService.stopLoading();
        console.log(resp);
        this.paymentMethod = resp.recordset;
      },
      error => {
        this.baseService.stopLoading();
        console.log(error)
      }
    )
  }

  addMethod(){
    let modal = this.modalCtrl.create(MethodCheckoutComponent, { user:  localStorage.getItem('idUsuario') });
    modal.present();
    modal.onDidDismiss(() => {
      this.getMethod();
    })
  }

  selectMethod(method){
    this.method.emit(method);
    this.viewCtrl.dismiss(method);
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
