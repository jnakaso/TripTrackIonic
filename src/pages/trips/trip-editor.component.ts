import { Component, Input } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { Trip } from "../../app/triptrack";
import { TripsService } from "../../app/trips.service";
import { DestinationPicker } from "./destination-picker";

@Component({
  selector: 'trip-editor',
  templateUrl: 'trip-editor.html'
})
export class TripEditor {

  @Input()
  trip: Trip;

  constructor(public navCtrl: NavController,
    private destCtrl: ModalController,
    private tripsService: TripsService) {

  }

  pickDest = () => {
    let destModal = this.destCtrl.create(DestinationPicker, { "dest": this.trip.destination });
    destModal.onDidDismiss(data => {
      if (data) {
        this.trip.destination = data.name;
        if (data.distance) {
          this.trip.distance = data.distance;
        }
      }
    })
    destModal.present();
  }

  isNotValid = () => {
    return !(this.trip.destination && this.trip.date && this.trip.distance);
  }


  dateChange = (evt: string) => {
    this.trip.date = evt;
  }
}
