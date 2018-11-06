import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, ModalController } from 'ionic-angular';

import { FormGroup, FormControl, Validators } from '@angular/forms';

import { AuthPage } from '../../pages/auth/auth';

import { RegisterProvider } from '../../providers/register/register';
import { PaymentProvider } from '../../providers/payment/payment';
import { BaseProvider } from '../../providers/base/base';
import { AuthProvider } from '../../providers/auth/auth';

import { MethodCheckoutComponent } from '../../components/method-checkout/method-checkout';

import { LoginPage } from '../login/login';

/**
 * Generated class for the RegisterPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage {

  public form: FormGroup;
  private submitted: boolean = false;
  private genders: Array<any>;
  private codeCountries: Array<any>;
  private imagen: any;
  private dni: any;
  private editImagen: boolean;
  public idUser: number;

  public paymentMethod: Array<any>;

  @ViewChild(Slides) slides: Slides;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public registerService: RegisterProvider,
    public paymentService: PaymentProvider,
    private baseService: BaseProvider,
    private auth: AuthProvider
  ) {
    this.imagen = false;
    this.form = new FormGroup({
      "name": new FormControl('', Validators.compose([Validators.required, Validators.maxLength(100)])),
      "lastname": new FormControl('', Validators.compose([Validators.required, Validators.maxLength(100)])),
      "gender": new FormControl('', Validators.compose([Validators.required])),
      "birthdate": new FormControl('', Validators.compose([Validators.required])),
      "phone": new FormControl('', Validators.compose([Validators.required])),
      "codeCountry": new FormControl('1', Validators.compose([Validators.required])),
      // "code": new FormControl('', Validators.compose([Validators.required, Validators.maxLength(4)])),
      "email": new FormControl('', Validators.compose([Validators.required, Validators.email, Validators.maxLength(100)])),
      "confirmEmail": new FormControl('', Validators.compose([Validators.required, Validators.email, Validators.maxLength(100)])),
      "pass": new FormControl('', Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(100)])),
      "confirmPass": new FormControl('', Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(100)])),
      "compartirMiViaje": new FormControl(true),
      "avisarSiSOS": new FormControl(true),
      "solicitarmePin": new FormControl(true),
      "enviarSMSpinINcorrecto": new FormControl(true),
      "Pin": new FormControl('',Validators.compose([Validators.pattern('[0-9]{4}')])),
      "termConditions":  new FormControl(true)
    });

    

    this.getGender();
    //this.getCountryCode();

  }
  slideChanged(e){
    let number = e.getActiveIndex();
    this.slides.lockSwipeToNext(number==1 && !this.idUser)
    if (number>1 && !this.idUser)  {
      this.baseService.showToast('completeRegistration');
    }
    if (number == 4){
      this.getMethod();
    }
  }

  ionViewDidLoad() {
    this.editImagen = false; 
    console.log('ionViewDidLoad RegisterPage');
  }

  ionViewCanEnter() {
    return !!this.auth.guardNotAuthenticated();
  }

  ngAfterViewInit(){
    // this.slides.lockSwipeToNext(true);
  }

  goBack() {
    this.navCtrl.setRoot(AuthPage);
  }

  validate(control: string) {
    return this.form.controls[control].errors && (this.form.controls[control].touched || this.submitted);
  }

  confirm(control: string, confirm: string) {
    return this.form.controls[control].value !== this.form.controls[confirm].value && (this.form.controls[confirm].touched || this.submitted)  ;
  }

  addImagen(){
    this.editImagen = true;
  }

  changeImagen(imagen: string){
    this.editImagen = false;
    this.imagen = imagen;
  }  

  changeDni(imagen: string){
    this.dni = imagen;
    if (!imagen) {
      this.baseService.showToast('uploadPhoto');
      return;
    }

    if (!this.idUser) {
      this.baseService.showToast('registerBefore');
      return;
    }
    this.baseService.startLoading();
    this.registerService.insertDocument(this.dni, this.idUser).toPromise().then(
      resp => {
        console.log(resp);
        this.baseService.showToast('successfullyDocument');
        this.baseService.stopLoading();
        this.slides.slideNext();
      },
      error => {
        console.log(error)
        this.baseService.stopLoading();
      }
    );
  }

  getGender(){
    this.registerService.getGender().toPromise().then(
      resp => {
        this.genders = resp.recordset;
        console.log(this.genders);
      },
      error => {
        console.log(error)
      }
    );
  }

  getCountryCode(){
    this.registerService.getCountryCode().toPromise().then(
      resp => {
        this.codeCountries = resp.recordset;
        console.log(this.codeCountries);
      },
      error => {
        console.log(error)
      }
    );
  }

  getMethod(){
    this.baseService.startLoading();
    this.paymentService.getPaymentMethod(this.idUser).toPromise().then(
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
    let modal = this.modalCtrl.create(MethodCheckoutComponent, { user:  this.idUser.toString() });
    modal.present();
  }

  getBase64Split(img){
    let toArray =  img.split(",");
    return toArray[1];
  }

  getMime(img){
    let toArray =  img.split(",");
    let Array1 = toArray[0].split("/");
    let Array2 = Array1[1].split(";");
    return Array2[0];
  }

  async register(){
    this.submitted = true;
    if (this.form.invalid || !this.imagen) {
      this.baseService.showToast('completeFields');
    } else {
      this.baseService.startLoading();
      let values = this.form.value;
      const data ={
        "nombre": values.name,
        "apellidos": values.lastname,
        "email": values.email,
        "contrasena": values.pass,
        "genero": values.gender,
        "idPaisTelefono": values.codeCountry,
        "Telefono": values.phone,
        "habilitado": true,
        "recuperarClave": true,
        "idiomaPreferido": 1,
        "idrol": 1,
        "foto": this.getBase64Split(this.imagen),
        "mime": this.getMime(this.imagen),
      }
      await this.registerService.register(data).toPromise().then(
        resp => {
          this.baseService.stopLoading();
          if (resp.recordset[0].idUsuario) {
            this.idUser = resp.recordset[0].idUsuario;
           
          } else {
            this.baseService.showToast(resp.recordset[0].Mensaje);
          }
        },
        error => {
          this.baseService.stopLoading();
          this.baseService.showToast('errorRegistering');
        }
      );

      if (this.idUser) {
        await this.registerService.insertDocument(data.foto, this.idUser, 11).toPromise().then(
          resp => {
            this.baseService.stopLoading();
            if (resp.recordset[0].idUsuario) {
            } else {
              //this.baseService.showToast(resp.recordset[0].Mensaje);
            }
          },
          error => {
            this.baseService.stopLoading();
            this.baseService.showToast('errorRegistering');
          }
        );
        this.baseService.showToast('successfullyRegistered');
        this.slides.lockSwipeToNext(false)
        setTimeout(
          ()=> this.slides.slideNext()
        ,300);
      }
    }
  }

  contact(){
    this.configSegurity();
  }

  configSegurity(){
    console.log(this.form.value.Pin, this.form.controls['Pin'].errors )
    if (!this.form.value.Pin || !this.form.controls['Pin'].valid) {
      this.baseService.showToast('safetyPin');
    } else {
      
      const data = {
        compartirMiViaje: this.form.value.compartirMiViaje,
        avisarSiSOS: this.form.value.avisarSiSOS,
        solicitarmePin: this.form.value.solicitarmePin,
        enviarSMSpinINcorrecto: this.form.value.enviarSMSpinINcorrecto,
        Pin: this.form.value.Pin,
      }

      this.baseService.startLoading();

      this.registerService.setConfigSegurity(data, this.idUser).toPromise().then(
        resp => {
          this.baseService.stopLoading();
          if (resp.recordset[0]) {
            this.baseService.showToast('savedConfiguration');
            this.slides.slideNext();
          } else {
            this.baseService.showToast(resp.recordset[0].Mensaje);
          }
        },
        error => {
          this.baseService.stopLoading();
          this.baseService.showToast('errorRegistering');
        }
      );
    }
  }

  setTermConditions(){
    if (!this.form.value.termConditions) {
      this.baseService.showToast('acceptTerms');
    } else {
      this.baseService.startLoading();
      this.registerService.setTemsConditions(this.idUser).toPromise().then(
        resp => {
          this.baseService.stopLoading();
          this.baseService.showToast('registeredApp');
          setTimeout(()=>{
            this.navCtrl.push(LoginPage);
          }, 2000);
        }, error => {
          this.baseService.stopLoading();
          this.baseService.showToast('errorRegistering');
          
        }

      )
    }

  }

  

}
