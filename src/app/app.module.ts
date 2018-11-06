import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HttpModule } from '@angular/http';

import { GooglePlus } from '@ionic-native/google-plus';

import { Geolocation } from '@ionic-native/geolocation';
import { Vibration } from '@ionic-native/vibration';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NetworkInterface } from '@ionic-native/network-interface';
import { Camera } from '@ionic-native/camera';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { LoginPage } from '../pages/login/login';
import { AuthPage } from '../pages/auth/auth';
import { LanguageSelectPage } from '../pages/language-select/language-select';
import { RecoverPasswordPage } from '../pages/recover-password/recover-password';
import { RegisterPage } from '../pages/register/register';
import { ServiceDriverPage } from '../pages/service-driver/service-driver';
import { CancelPage } from '../pages/cancel/cancel';
import { PerfilPage } from '../pages/perfil/perfil';
import { SosPage } from '../pages/sos/sos';
import { TravelsPage } from '../pages/travels/travels';
import { SegurityComponent } from '../pages/segurity/segurity';
import { PoliticsPage } from '../pages/politics/politics';
import { PoliticsModalPage } from '../pages/politics-modal/politics-modal';
import { HelpPage } from '../pages/help/help';

import { DocumentImageComponent } from '../components/document-image/document-image';
import { MethodCheckoutComponent } from '../components/method-checkout/method-checkout';
import { MapComponent } from '../components/map/map';
import { FavoriteLocationComponent } from '../components/favorite-location/favorite-location';
import { DriversComponent } from '../components/drivers/drivers';
import { PaymentMethodComponent } from '../components/payment-method/payment-method';
import { FinishServiceComponent } from '../components/finish-service/finish-service';
import { Segurity1Component } from '../components/segurity/segurity';

const pages = [
  HomePage,
  ListPage,
  LanguageSelectPage,
  LoginPage,
  AuthPage,
  RecoverPasswordPage,
  RegisterPage,
  ServiceDriverPage,
  CancelPage,
  PerfilPage,
  SosPage,
  DocumentImageComponent,
  MethodCheckoutComponent,
  MapComponent,
  FavoriteLocationComponent,
  DriversComponent,
  PaymentMethodComponent,
  SegurityComponent,
  FinishServiceComponent,
  TravelsPage,
  PoliticsPage,
  PoliticsModalPage,
  HelpPage,
  Segurity1Component
];


import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LanguageProvider } from '../providers/language/language';
import { AuthProvider } from '../providers/auth/auth';
import { RegisterProvider } from '../providers/register/register';
import { BaseProvider } from '../providers/base/base';
import { PaymentProvider } from '../providers/payment/payment';
import { ServiceProvider } from '../providers/service/service';
import { ProfileProvider } from '../providers/profile/profile';
import { BillsProvider } from '../providers/bills/bills';
import { HelpProvider } from '../providers/help/help';

import { DatePipe } from '@angular/common';

@NgModule({
  declarations: [
    MyApp,
    ...pages
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp, {}, {
      links: [
        { component: HomePage, name: 'HomePage', segment: 'home' },
        { component: ListPage, name: 'ListPage', segment: 'list' },
        { component: LanguageSelectPage, name: 'LanguageSelectPage', segment: 'lang' },
        { component: LoginPage, name: 'LoginPage', segment: 'login' },
        { component: AuthPage, name: 'AuthPage', segment: 'auth' },
        { component: RecoverPasswordPage, name: 'RecoverPasswordPage', segment: 'recover-password' },
        { component: RegisterPage, name: 'RegisterPage', segment: 'register' },
        { component: SosPage, name: 'SosPage', segment: 'sos/:service' },
        { component: ServiceDriverPage, name: 'ServiceDriver', segment: 'service-driver/:service',  defaultHistory: [HomePage] },
        { component: CancelPage, name: 'Cancel', segment: 'cancel/:service',  defaultHistory: [HomePage] },
        { component: PerfilPage, name: 'Perfil', segment: 'perfil',  defaultHistory: [HomePage] },
        { component: TravelsPage, name: 'travels', segment: 'travels',  defaultHistory: [HomePage] },
        { component: SegurityComponent, name: 'segurity', segment: 'segurity',  defaultHistory: [HomePage] },
        { component: PoliticsPage, name: 'politic', segment: 'politic',  defaultHistory: [HomePage] },
        { component: HelpPage, name: 'help', segment: 'help',  defaultHistory: [HomePage] },
      ]
    }),
    HttpClientModule,
    HttpModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ...pages
  ],
  providers: [
    StatusBar,
    SplashScreen,
    NetworkInterface,
    Camera,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    LanguageProvider,
    AuthProvider,
    GooglePlus,
    Geolocation,
    Vibration,
    DatePipe,
    RegisterProvider,
    BaseProvider,
    PaymentProvider,
    ServiceProvider,
    ProfileProvider,
    BillsProvider,
    HelpProvider
  ]
})
export class AppModule {}
