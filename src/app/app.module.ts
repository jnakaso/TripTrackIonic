import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';
import { SocialSharing } from '@ionic-native/social-sharing';

import { MyApp } from './app.component';

import { StatsPage } from '../pages/stats/stats';
import { TripsPage } from '../pages/trips/trips';
import { DestinationsPage } from '../pages/destinations/destinations';
import { HomePage } from '../pages/home/home';
import { DestinationPicker } from '../pages/trips/destination-picker';
import { TabsPage } from '../pages/tabs/tabs';
import { TripEditor } from '../pages/trips/trip-editor.component';
import { TripEditModal } from '../pages/trips/trip-edit-modal';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { DestinationService } from './destination.service';
import { TripsService } from './trips.service';
import { StatsService } from './stats.service';

@NgModule({
  declarations: [
    MyApp,
    StatsPage,
    TripsPage,
    DestinationsPage,
    HomePage,
    DestinationPicker,
    TripEditor,
    TripEditModal,
    TabsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    StatsPage,
    TripsPage,
    DestinationsPage,
    HomePage,
    DestinationPicker,
    TripEditor,
    TripEditModal,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    DestinationService,
    TripsService,
    StatsService,
    SocialSharing,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }
