import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { TranslateService } from '@ngx-translate/core';

import { HomePage } from '../pages/home/home';
import { TravelsPage } from '../pages/travels/travels';
import { LanguageSelectPage } from '../pages/language-select/language-select';
import { PerfilPage } from '../pages/perfil/perfil';
import { SegurityComponent } from '../pages/segurity/segurity';
import { PoliticsPage } from '../pages/politics/politics';
import { HelpPage } from '../pages/help/help';


import { AuthProvider } from '../providers/auth/auth';

import { environment } from '../environments/environment';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any;
  user: any;
  pages: Array<{title: string, component: any, icon: string}>;
  public image: string = "../../assets/imgs/perfil.png";

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private translate: TranslateService,
    private events: Events,
    private auth: AuthProvider
  ) {
    this.listenToLoginEvents();
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Perfil', icon: '../../assets/imgs/erusuario.png', component: PerfilPage },
      //{ title: 'Pago', icon: '../../assets/imgs/pago.png', component: HomePage },
      { title: 'Viajes', icon: '../../assets/imgs/car2.png', component: TravelsPage },
      //{ title: 'Invitar', icon: '../../assets/imgs/erinvitar.png', component: HomePage },
      { title: 'Seguridad', icon: '../../assets/imgs/image34.png', component: SegurityComponent },
      //{ title: 'Olvidé', icon: '../../assets/imgs/olvide.png', component: HomePage },
      { title: 'Política', icon: '../../assets/imgs/politica.png', component: PoliticsPage },
      { title: 'Ayuda', icon: '../../assets/imgs/ayuda.png', component: HelpPage },
    ];

    translate.setDefaultLang('es');
     if (localStorage.getItem('lang')) {
       this.translate.use(localStorage.getItem('lang'));
    }

    if (this.auth.getCurrentUser()) {
      this.rootPage = HomePage;
    } else {
      this.rootPage = LanguageSelectPage;
    }
    this.getUser();

  }
  getUser(){
    if (localStorage.getItem('idUsuario')) {
      this.auth.getUser().subscribe(
        resp => {
          //console.log(resp)
          this.user = resp.recordset[0];
          if (resp.recordset[0]) {
            this.image = environment.documents + resp.recordset[0].ruta +'?'+ new Date().getTime()
          }
        },
        error => {

        }
      )
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.nav.viewDidEnter.subscribe(() => {
        this.getUser();
      });
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  listenToLoginEvents() {
    this.events.subscribe('user:login', () => {
      // Si hay un logueo de cuenta o cambio de usuario se redirige a Home
      setTimeout(() => {
        this.nav.setRoot(HomePage)
        this.getUser();
      });

    });
    this.events.subscribe('user:notAuthenticated', () => {
      setTimeout(() => this.nav.setRoot(LanguageSelectPage));
    });

    this.events.subscribe('user:signup', () => {
    });

    this.events.subscribe('user:logout', () => {
      this.nav.setRoot(LanguageSelectPage);
    });
  }

  logout(){
    this.auth.logout().toPromise().then(
      resp => {
        this.nav.setRoot(LanguageSelectPage);
      }
    )
  }
}
