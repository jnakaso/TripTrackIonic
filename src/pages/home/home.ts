import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { Trip } from "../../app/triptrack";
import { TripsService } from "../../app/trips.service";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  trip: Trip;

  constructor(public navCtrl: NavController,
    private alertCtrl: AlertController,
    private tripsService: TripsService) {
    this.reset();
  }

  submit = () => {
    this.tripsService.create(this.trip, (result: string) => {
      this.showAlert();
      this.reset();
    });
  }

  reset = () => {
    this.trip = this.tripsService.newInstance();
  }

  showAlert = () => {
    let alert = this.alertCtrl.create({
      title: 'Added Trip to ' + this.trip.destination + '!',
      buttons: ['OK']
    });
    alert.present();
  }

  isNotValid = () => {
    return !(this.trip.destination && this.trip.date && this.trip.distance);
  }

}
