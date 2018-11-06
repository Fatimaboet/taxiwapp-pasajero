import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { FormGroup, FormControl } from '@angular/forms';

import { ServiceProvider } from '../../providers/service/service';
import { BaseProvider } from '../../providers/base/base';

/**
 * Generated class for the SegurityComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'segurity',
  templateUrl: 'segurity.html'
})
export class Segurity1Component {

  public id: number;
  public form: FormGroup;

  constructor(
    public viewCtrl: ViewController,
    public params: NavParams,
    public service: ServiceProvider,
    public base: BaseProvider
  ) {
    this.id = params.get('id');
    console.log(this.id);
    this.form = new FormGroup({
      "compartirMiViaje": new FormControl(true),
      "avisarSiSOS": new FormControl(true),
      "solicitarmePin": new FormControl(true),
      "enviarSMSpinINcorrecto": new FormControl(true)
    });
  }

  setSegurity(){
    this.base.startLoading();
    this.service.setSegurity({id: this.id, ...this.form.value}).toPromise().then(
      resp => {
        this.base.stopLoading();
        if (resp.recordset) {
          this.base.showToast("seguridad agregada con exito!");
          setTimeout(() => {
            this.dismiss();
          }, 500);
        } else {
          this.base.showToast("No se ha podido configurar la seguridad");
        }
      },
      error => {
        this.base.stopLoading();
        this.base.showToast("No se ha podido configurar la seguridad");
        console.log(error)
      }
    );
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }


}
