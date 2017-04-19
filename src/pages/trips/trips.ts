import { Component } from '@angular/core';
import { NavController, AlertController, MenuController, ModalController } from 'ionic-angular';
import { Events, List } from 'ionic-angular';
import { Trip } from "../../app/triptrack";
import { TripsService } from "../../app/trips.service";
import { TripEditModal } from "./trip-edit-modal";

@Component({
  selector: 'page-trips',
  templateUrl: 'trips.html'
})
export class TripsPage {

  filter: string = "";
  sort: string = "date";
  trips: Trip[] = [];

  constructor(public navCtrl: NavController,
    private alertCtrl: AlertController,
    private menuCtrl: MenuController,
    private tripEditCtrl: ModalController,
    private tripsService: TripsService,
    private events: Events) {

    events.subscribe('trips:changed', (trip, time) => {
      this.refresh();
    });
  }

  ionViewWillEnter = () => {
    this.refresh();
  }

  openMenu = () => {
    this.menuCtrl.enable(true, 'tripMenu');
    this.menuCtrl.toggle('tripMenu');
  }

  edit = (trip: Trip) => {
    let clone = Object.assign({}, trip);
    let modal = this.tripEditCtrl.create(TripEditModal, { "trip": clone });
    modal.onDidDismiss(data => {
      if (data) {
        trip = Object.assign({}, data);
        this.tripsService.update(trip, (result: string) => {
          this.showAlert(trip);
        });
      }
    })
    modal.present();
  }

  showAlert = (trip: Trip) => {
    let alert = this.alertCtrl.create({
      title: 'Updated trip to ' + trip.destination + '!',
      buttons: ['OK']
    });
    alert.present();
  }

  delete = (id: string) => {
    this.tripsService.delete(id);
  }

  clear = () => {
    let confirm = this.alertCtrl.create({
      title: 'Delete All?',
      message: 'This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            console.log('Delete all canceled.');
          }
        },
        {
          text: 'Confirm',
          handler: () => {
            console.log('Confirm clicked');
            this.tripsService.clear();
          }
        }
      ]
    });
    confirm.present();
  }

  refresh = () => {
    this.tripsService.query(t => this.trips = t);
  }

  export = () => {
    this.tripsService.export(this.trips);
  }

  destinationFilter = (t: Trip) => {
    let check = this.filter ? this.filter.trim().toLowerCase() : "";
    return t.destination.toLowerCase().startsWith(check);
  }

  getSort = () => {
    switch (this.sort) {
      case 'dest': return this.tripsService.destSort;
      case 'dist': return this.tripsService.distSort;
      case 'date': return this.tripsService.dateSort;
      default: return this.tripsService.dateSort;
    }
  }

  getFiltered = () => {
    return this.trips
      .filter(this.destinationFilter)
      .sort(this.getSort());
  }
}
