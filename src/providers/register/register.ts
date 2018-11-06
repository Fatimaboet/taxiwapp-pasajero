import { HttpClient } from '@angular/common/http';
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
export class RegisterProvider {
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
    return this.http.post(`${environment.api}/bl_usuarios_inserta`, data);
  }

  insertDocument(document: any, idUsuario: any,  idTipoDocumento = 1): Observable<any>{
    const data = {
      "idTipoDocumento": idTipoDocumento,
      "numeroDocumento": idTipoDocumento,
      "Vigencia": new Date(),
      "Observaciones": '',
      "documento": document,
      "idUsuario": idUsuario,
      "Idioma": this.getLang(),
    }
    return this.http.post(`${environment.api}/bl_personasDocumentos_insertar`, data);
  }

  getGender(): Observable<any>{
    const data = {
      "idUsuario": 1,
      "Idioma": this.getLang(),
    }
    return this.http.post(`${environment.api}/st_generos_consulta`, data);
  }

  getCountryCode(): Observable<any> {
    const data = {
      "idUsuario": 1,
      "Idioma": this.getLang(),
    }
    return this.http.post(`${environment.api}/st_paisesCodigosTelefonicos`, data);
  }

  setConfigSegurity(config: Object, idUser: number): Observable<any>{
    const data = {
      ...config,
      "idUsuario": idUser,
      "Idioma": this.getLang()
    }
    return this.http.post(`${environment.api}/st_usuariosConfiguracionSeguridad_insertar`, data);
  }

  setTemsConditions(idUser: number): Observable<any>{
    const data = {
      "fechaHora": moment().format('YYYY-MM-DD HH:mm:ss'),
      "DireccionIP": this.ip || "192.168.10.1",
      "idUsuario": idUser,
      "Idioma": this.getLang()
    }
    return this.http.post(`${environment.api}/st_usuariosAceptacionCondiciones_insertar`, data);
  }

  

}
