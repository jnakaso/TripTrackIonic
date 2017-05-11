import { Component } from '@angular/core';
import { ViewController, NavController, NavParams } from 'ionic-angular';
import { Trip } from "../../app/triptrack";

@Component({
  selector: 'trip-edit-modal',
  templateUrl: 'trip-edit-modal.html'
})
export class TripEditModal {

  trip: Trip;

  constructor(
    public params: NavParams,
    public viewController: ViewController,
    public navController: NavController) {
    this.trip = this.params.get("trip");
  }
  
  submit = () => {
    this.viewController.dismiss(this.trip);
  }

  dismiss = () => {
    this.viewController.dismiss();
  }

}