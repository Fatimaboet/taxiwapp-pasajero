import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

import { FormGroup, FormControl, Validators } from '@angular/forms';

import { BaseProvider } from '../../providers/base/base';
import { PaymentProvider } from '../../providers/payment/payment';

import * as moment from 'moment';


@Component({
  selector: 'method-checkout',
  templateUrl: 'method-checkout.html'
})
export class MethodCheckoutComponent {

  text: string;
  default: boolean = false;
  public form: FormGroup;
  public methods: Array<any>;
  public submitted: boolean;
  public idUser: number;

  constructor(
    public viewCtrl: ViewController,
    public params: NavParams,
    public baseService: BaseProvider,
    public paymentService: PaymentProvider
  ) {
    this.idUser = params.get('user');
    console.log(this.idUser);
    this.methods = [
      {idMetodoPago: 5, esEfectivo: 0, Predeterminado: 0, metodo: 'Credito'},
      {idMetodoPago: 2, esEfectivo: 1, Predeterminado: 1, metodo: 'Efectivo'},
      {idMetodoPago: 2, esEfectivo: 1, Predeterminado: 1, metodo: 'Debito'},
    ];
    this.submitted = false;
    this.form = new FormGroup({
      "method": new FormControl('', Validators.compose([Validators.required])),
      "default": new FormControl(true),
      "owner": new FormControl('', Validators.compose([Validators.required])),
      "numberCard": new FormControl('', Validators.compose([Validators.required, Validators.pattern('^(?:4[0-9]{12}(?:[0-9]{3})?|[25][1-7][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$')])),
      "date": new FormControl('', Validators.compose([Validators.required])),
      "cvv": new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[0-9]{3}$')])),
    });
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  validate(control: string) {
    return this.form.controls[control].errors && (this.form.controls[control].touched || this.submitted);
  }

  add(){
    if (!this.form.valid && this.form.value.method.idMetodoPago !== 5) {
      this.baseService.showToast('completeFields')
    } else {
      const date = moment(this.form.value.date, 'YYYY-MM');
      const data = {
        "idMetodoPago": this.form.value.method.idMetodoPago,
        "Habilitada": 1,
        "Predeterminada": this.form.value.default? 1 : 0,
        "titularTarjeta": this.form.value.owner,
        "numeroTarjeta": this.form.value.numberCard,
        "mesCaducidad": date.format('MM'),
        "anioCaducidad": date.format('YY'),
        "CCV": this.form.value.cvv,
      }
      this.baseService.startLoading();
      this.paymentService.addPaymentMethod(data, this.idUser).toPromise().then(
        resp => {
          console.log(resp);
          this.baseService.stopLoading();
          this.baseService.showToast('paymentmethodSuccess')
          this.dismiss();
        },
        error => {
          this.baseService.stopLoading();
          console.log(error)
          if (error.error.description) {
            this.baseService.showToast(error.error.description)
          } else {
            this.baseService.showToast('errorpaymentMethod')
          }
        }
      )
    }
  }

}
