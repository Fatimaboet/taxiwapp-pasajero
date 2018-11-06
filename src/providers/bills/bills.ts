import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

/*
  Generated class for the BillsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class BillsProvider {

  constructor(public http: HttpClient) {
    console.log('Hello BillsProvider Provider');
  }

  getDiaryBills(): Observable<any>{
    const data = {
    	"idConductor": localStorage.getItem('idConductorC'),
  		"Idioma": localStorage.getItem('lang')=='es'?'esp':"eng"
    }
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    headers = headers.set('authorization', localStorage.getItem('TokenTWP'));
    return this.http.post(`${environment.api}/st_conductorGanSemanalTotal_ConsultaV2`, data, {
      headers: headers
    });
  }

  getDetailsBills(fecha_inicio,fecha_fin): Observable<any>{
    const data = {
    	"idConductor": localStorage.getItem('idConductorC'),
    	"fechaInicial": fecha_inicio,
    	"fechaFinal": fecha_fin,
  		"Idioma": localStorage.getItem('lang')=='es'?'esp':"eng"
    }
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    headers = headers.set('authorization', localStorage.getItem('TokenTWP'));
    return this.http.post(`${environment.api}/st_conductorGanaSemanal_Detalle`, data, {
      headers: headers
    });
  }

  getTravel(): Observable<any>{
    const data = {
      "idUsuario": localStorage.getItem('idUsuarioC'),
      "Idioma": localStorage.getItem('lang')=='es'?'esp':"eng"
    }
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    headers = headers.set('authorization', localStorage.getItem('TokenTWP'));
    return this.http.post(`${environment.api}/st_viajes_ConcluidosConsulta`, data, {
      headers: headers
    });
  }

}
