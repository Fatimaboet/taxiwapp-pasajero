import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { NetworkInterface } from '@ionic-native/network-interface';


import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

import * as moment from 'moment';

/*
  Generated class for the RegisterProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ProfileProvider {
  private ip: string;

  constructor(public http: HttpClient, private networkInterface: NetworkInterface) {
    console.log('Hello RegisterProvider Provider');
    this.getIpAddress();
    this.networkInterface.getCarrierIPAddress()
    .then(address => console.info(`IP: ${address.ip}, Subnet: ${address.subnet}`))
    .catch(error => console.error(`Unable to get IP: ${error}`));
  }

  getIpAddress() {
    return this.http.get('http://api.ipify.org/?format=json')
      .toPromise()
      .then((response: any) => {
        this.ip = response.ip;
      });
  }

  getLang(){
    return localStorage.getItem('lang')=='es'?'esp':"ing";
  }

  register(data: any): Observable<any>{
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    headers = headers.set('authorization', localStorage.getItem('TokenTWP'));
    return this.http.post(`${environment.api}/bl_usuarios_inserta`, data, {
      headers: headers
    });
  }

  public getUser(): Observable<any>{
    const data = {
      "idUsuario": localStorage.getItem('idUsuario'),
      "Idioma": this.getLang()
    }
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    headers = headers.set('authorization', localStorage.getItem('TokenTWP'));
    return this.http.post(`${environment.api}/st_usuarioPerfil_consulta`, data, {
      headers: headers
    });
  }
  
  setInfo(info): Observable<any>{
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    headers = headers.set('authorization', localStorage.getItem('TokenTWP'));
    return this.http.post(`${environment.api}/st_usuarioPerfil_actualiza`, info, {
      headers: headers
    });
  }


  

}
