import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { AuthProvider } from '../auth/auth';


import { environment } from '../../environments/environment';

import * as moment from 'moment';

/*
  Generated class for the ServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ServiceProvider {

  currentUser: string;

  constructor(public http: HttpClient, public auth: AuthProvider) {
    this.currentUser = localStorage.getItem('idUsuario');
  }

  public getLang(){
    return localStorage.getItem('lang')=='es'?'esp':"ing";
  }

  public get(id: number) {
    const data = {
      "idViaje": id,
      "idUsuario": this.currentUser,
      "Idioma": this.getLang(),
    }
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    headers = headers.set('authorization', localStorage.getItem('TokenTWP'));
    return this.http.post(`${environment.api}/st_viajes_consulta`, data, {
      headers: headers
    });
  }

  public getStatus(id: number): Observable<any>{
    const data = {
      "idViaje": id,
      "idUsuario": this.currentUser,
      "Idioma": this.getLang(),
    }
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    headers = headers.set('authorization', localStorage.getItem('TokenTWP'));
    return this.http.post(`${environment.api}/st_estatusViaje_consulta`, data, {
      headers: headers
    });
  }

  public getLast(): Observable<any>{
    const data = {
      "idUsuario": this.currentUser,
      "Idioma": this.getLang(),
    }
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    headers = headers.set('authorization', localStorage.getItem('TokenTWP'));
    return this.http.post(`${environment.api}/st_viajes_Consulta_10`, data, {
      headers: headers
    });
  }

  public getTypeServices(): Observable<any>{
    const data = {
      "idUsuario": this.currentUser,
      "Idioma": this.getLang(),
    }
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    headers = headers.set('authorization', localStorage.getItem('TokenTWP'));
    return this.http.post(`${environment.api}/st_tipoServicios_consulta`, data, {
      headers: headers
    });
  }

  public addService(service: Object): Observable<any>{
    const data = {
      ...service,
      "idUsuario": this.currentUser,
      "Idioma": this.getLang(),
    }
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    headers = headers.set('authorization', localStorage.getItem('TokenTWP'));
    return this.http.post(`${environment.api}/st_viajes_insertar`, data, {
      headers: headers
    });
  }

  public getDrivers(idTypeService, cord): Observable<any>{
    const data = {
      "idtipoServicio": idTypeService,
      "idUsuario": this.currentUser,
      "posicion": cord,
      "Idioma": this.getLang(),
    }
    console.log(data);
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    headers = headers.set('authorization', localStorage.getItem('TokenTWP'));
    return this.http.post(`${environment.api}/st_conductoresCerca_consulta`, data, {
      headers: headers
    });
  }

  addFavorite(info): Observable<any>{
    const data = {
      "idUbicacionFavorita": 1,
      "Descripcion": info.Descripcion,
      "puntoGeografico": info.puntoGeografico,
      "Direccion": info.Direccion,
      "update_idu": this.currentUser,
      "update_date": moment().format('YYYY-MM-DD'),
      "idUsuario": this.currentUser,
      "Idioma": this.getLang(),
    }
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    headers = headers.set('authorization', localStorage.getItem('TokenTWP'));
    return this.http.post(`${environment.api}/st_usuariosUbicacionesFavoritas_insertar`, data, {
      headers: headers
    });
  }

  public getFavorites(): Observable<any>{
    const data = {
      "idUsuario": this.currentUser,
      "Idioma": this.getLang(),
    }
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    headers = headers.set('authorization', localStorage.getItem('TokenTWP'));
    return this.http.post(`${environment.api}/st_usuariosUbicacionesFavoritas_consultar`, data, {
      headers: headers
    });
  }

  public getMotiveCancel(): Observable<any> {
    const data = {
      "esParaPasajero": 1,
      "idUsuario": this.currentUser,
      "Idioma": this.getLang(),
    }
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    headers = headers.set('authorization', localStorage.getItem('TokenTWP'));
    return this.http.post(`${environment.api}/st_motivosDeCancelaciones_consulta`, data, {
      headers: headers
    });
  }

  public addMotiveCancel(id: number, motive: number): Observable<any>{
    const data = {
      "idViaje": id,
      "idMotivoCancelacion": motive,
      "quienCancela": 1,
      "idUsuario": this.currentUser,
      "Idioma": this.getLang(),
    }
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    headers = headers.set('authorization', localStorage.getItem('TokenTWP'));
    return this.http.post(`${environment.api}/st_viajeCancelaciones_insertar`, data, {
      headers: headers
    });
  }

  public setSegurity({id, compartirMiViaje, avisarSiSOS, solicitarmePin, enviarSMSpinINcorrecto}): Observable<any>{
    const data = {
      "idViaje": id,
      "compartirMiViaje": compartirMiViaje,
      "avisarSiSOS": avisarSiSOS,
      "solicitarmePin": solicitarmePin,
      "enviarSMSpinINcorrecto": enviarSMSpinINcorrecto,
      "idUsuario": this.currentUser,
      "Idioma": this.getLang(),
    }
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    headers = headers.set('authorization', localStorage.getItem('TokenTWP'));
    return this.http.post(`${environment.api}/st_viajeConfiguracionSeguridad_insertar`, data, {
      headers: headers
    });
  }

  public addDriverService({id, idConductor, idVehiculo}): Observable<any>{
    const data = {
      "idViaje": id,
      "idConductor": idConductor,
      "idVehiculo": idVehiculo,
      "idUsuario": this.currentUser,
      "Idioma": this.getLang(),
    }
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    headers = headers.set('authorization', localStorage.getItem('TokenTWP'));
    return this.http.post(`${environment.api}/st_viajeConductorConfirmado_inserta`, data, {
      headers: headers
    });
  }

  public initService({id, puntopartida}): Observable<any>{
    const data = {
      "idViaje": id,
      "puntopartida": puntopartida,
      "idUsuario": this.currentUser,
      "Idioma": this.getLang(),
    }
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    headers = headers.set('authorization', localStorage.getItem('TokenTWP'));
    return this.http.post(`${environment.api}/st_viajeIniciado_insertar`, data, {
      headers: headers
    });
  }

  getPin({id, pin}): Observable<any>{
     const data = {
      "idViaje": id,
      "PIN": pin,
      "Idioma": this.getLang(),
    }
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    headers = headers.set('authorization', localStorage.getItem('TokenTWP'));
    return this.http.post(`${environment.api}/st_viajesVerificarPINSeguridad_consulta`, data, {
      headers: headers
    });
  }


  cancelDriverTravel(id): Observable<any>{
    const data = {
      "idViaje": id,
      "idStatus": 7,
      "idUsuario": this.currentUser,
      "Idioma": this.getLang(),
    }
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    headers = headers.set('authorization', localStorage.getItem('TokenTWP'));
    return this.http.post(`${environment.api}/st_viajeCondConfirm_actualiza`, data, {
      headers: headers
    });
  }

  getTaximetro(id): Observable<any>{
    const data = {
      "idViaje": id,
      "Idioma": this.getLang(),
    }
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    headers = headers.set('authorization', localStorage.getItem('TokenTWP'));
    return this.http.post(`${environment.api}/st_viajeTaximetro_consulta`, data, {
      headers: headers
    });
  }

  getLastPosition(id): Observable<any>{
    const data = {
      "idViaje": id,
      "Idioma": this.getLang(),
    }
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    headers = headers.set('authorization', localStorage.getItem('TokenTWP'));
    return this.http.post(`${environment.api}/st_conductoresUltimaPosicion_consulta`, data, {
      headers: headers
    });
  }

  finishService({id, propine, point}): Observable<any>{
    const data = {
      "idViaje": id,
      "puntoLlegada": point,
      "PorcentajePropina": propine,
      "idUsuario": this.currentUser,
      "Idioma": this.getLang(),
    }
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    headers = headers.set('authorization', localStorage.getItem('TokenTWP'));
    return this.http.post(`${environment.api}/st_viajeFinalizacion_insertar`, data, {
      headers: headers
    });
  }

  getLastServices(): Observable<any>{
    const data = {
      "idUsuario": this.currentUser,
      "Idioma": this.getLang(),
    }
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    headers = headers.set('authorization', localStorage.getItem('TokenTWP'));
    return this.http.post(`${environment.api}/st_viajes_ConcluidosConsulta`, data, {
      headers: headers
    });
  }

  getProgrames(): Observable<any>{
    const data = {
      "idUsuario": this.currentUser,
      "Idioma": this.getLang(),
    }
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    headers = headers.set('authorization', localStorage.getItem('TokenTWP'));
    return this.http.post(`${environment.api}/st_viajes_ProgramadosConsulta`, data, {
      headers: headers
    });
  }
}
