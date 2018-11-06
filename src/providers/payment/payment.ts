import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
/*
  Generated class for the PaymentProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class PaymentProvider {

  constructor(public http: HttpClient) {
  }

  getLang(){
    return localStorage.getItem('lang')=='es'?'esp':"ing";
  }

  addPaymentMethod(config: Object, idUsuario: number): Observable<any>{
    const data = {
      ...config,
      "idUsuario": idUsuario,
      "Idioma": this.getLang()
    }
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    headers = headers.set('authorization', localStorage.getItem('TokenTWP'));
    return this.http.post(`${environment.api}/bl_usuariosMetodoPago_insertar`, data, {
      headers: headers
    });
  }

  getPaymentMethod(idUsuario?: number): Observable<any>{
    let id = idUsuario? idUsuario: localStorage.getItem('idUsuario');
  	const data = {
      "idUsuario": id,
      "Idioma": this.getLang()
    }
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    headers = headers.set('authorization', localStorage.getItem('TokenTWP'));
    return this.http.post(`${environment.api}/st_usuariosMetodoPago_consulta`, data, {
      headers: headers
    });
  }

}
