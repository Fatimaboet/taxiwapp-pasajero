import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Events, Platform} from 'ionic-angular';

import { Geolocation, Geoposition } from '@ionic-native/geolocation';

import { GooglePlus } from '@ionic-native/google-plus';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

import * as moment from 'moment';

declare var google;

/*
  Generated class for the AuthProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AuthProvider {

  private currentUser: any;
  private token: string;
  private ip: string;
  private position: string = "55.9271035250276 -3.29431266523898";

  constructor(
    public http: HttpClient,
    private googlePlus: GooglePlus,
    private events: Events,
    public geolocation: Geolocation,
    public platform: Platform
    ) {
    this.currentUser = localStorage.getItem('idUsuario');
    this.token = localStorage.getItem('token');
    this.getIpAddress();
    console.log('open')
    this.platform.ready().then(() => {
      this.getPosition();
    });
  }

  public getCurrentUser(): string{
    return localStorage.getItem('idUsuario');
  }

  public getToken(): string{
    return localStorage.getItem('token');
  }

  public getLang(){
    return localStorage.getItem('lang')=='es'?'esp':"ing";
  }

  public getCurrentPosition(): string{
    return this.position;
  }

  public getIp(): string{
    return this.ip;
  }

  public getUser(): Observable<any>{
    const data = {
      "idUsuario": this.getCurrentUser(),
      "Idioma": this.getLang()
    }
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    headers = headers.set('authorization', localStorage.getItem('TokenTWP'));
    return this.http.post(`${environment.api}/st_usuarioPerfil_consulta`, data, {
      headers: headers
    });
  }

  getPosition(){
    let latitude: number;
    let longitude: number;
    console.log('longitud')
    let optionsGPS = {timeout: 9000, enableHighAccuracy: true};
    this.geolocation.getCurrentPosition(optionsGPS).then(response => {
      this.setPosition(response);
    })
    .catch(error =>{
      console.log(JSON.stringify(error.message))
      console.log(error.PositionError)
      console.log('navigator')
      if (navigator) {
        navigator.geolocation.getCurrentPosition(response => {
          console.log('longitud3')
          console.log('geo')
          this.setPosition(response);
        });
      } else {
        console.log('else')
        if(google.loader.ClientLocation) {
          latitude = google.loader.ClientLocation.latitude;
          longitude = google.loader.ClientLocation.longitude;
          this.position = longitude +' '+ latitude;
        }
      }
    })
  }

  setPosition(response){
    let latitude = response.coords.latitude;
    let longitude = response.coords.longitude;
    this.position = longitude +' '+ latitude;
    console.log(this.position)
  }

  getIpAddress() {
    return this.http.get('http://api.ipify.org/?format=json')
      .toPromise()
      .then((response: any) => {
        this.ip = response.ip;
        console.log(this.ip)
      });
  }

  login(email: string, pass: string): Observable<any>{
  	const data = {
  		"tipoConexion": 'local',
  		"email": email,
  		"pass": pass,
  		"ubicacionGPS": this.getCurrentPosition(),
  		"ipOrigen": this.getIp()
  	}
  	return this.http.post(`${environment.api}/bl_usuarios_iniciosesion`, data)
  }

  logout(): Observable<any> {
    return new Observable((observer)=>{
      observer.next(localStorage.removeItem('idUsuario'));
      observer.complete();
    })
  }

  loginGoogle(){
    return this.googlePlus.login({});
  }

  recoverPassword(email: string): Observable<any>{
    const data = {
      "email": email,
      "idUsuario": 1,
      "Idioma": localStorage.getItem('lang')=='es'?'esp':"eng"
    }
    return this.http.post(`${environment.api}/st_usuarios_recuperar`, data)
  }

  SOS(idViaje: number): Observable<any>{
    const data = {
      "idViaje": idViaje,
      "puntoDeAlarma": this.getCurrentPosition(),
      "fechaHoraAlarma": moment().format("YYYY-MM-DD hh:mm:ss"),
      "idEstatusAlarma": 1,
      "idTipoAlarma": 1,
      "idUsuario": this.getCurrentUser(),
      "Idioma": localStorage.getItem('lang')=='es'?'esp':"eng"
    }
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    headers = headers.set('authorization', localStorage.getItem('TokenTWP'));
    return this.http.post(`${environment.api}/st_viajeAlarmas_insertar`, data, {
      headers: headers
    });
  }

  guardAuthenticated() {
    if (this.getCurrentUser()) {
      return true;
    } else {
      this.events.publish('user:notAuthenticated');
      return false;
    }
  }

  guardNotAuthenticated() {
    if (this.getCurrentUser()) {
      this.events.publish('user:login');
      return false;
    } else {
      return true;
    }
  }

}
