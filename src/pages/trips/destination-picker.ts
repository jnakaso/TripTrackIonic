import { Component, ViewChild } from '@angular/core';
import { ViewController, NavController, NavParams } from 'ionic-angular';
import { Destination } from "../../app/triptrack";
import { DestinationService } from "../../app/destination.service";

@Component({
  selector: 'destination-picker',
  templateUrl: 'destination-picker.html'
})
export class DestinationPicker {

  @ViewChild('searchInput') searchInput;

  dests: Destination[] = [];
  filter: string = "";

  constructor(
    private destinationService: DestinationService,
    public params: NavParams,
    public viewController: ViewController,
    public navController: NavController) {
  }

  ionViewWillEnter = () => {
    this.refresh();
  }

  ionViewDidEnter = () => {
    this.filter = this.params.get("dest") || "";
    this.searchInput.setFocus();
  }

  refresh = () => {
    this.destinationService.query(dd => this.dests = dd);
  }

  changeFilter = (evt) => {
    this.filter = evt.srcElement.value;
  }

  getFiltered = () => {
    return this.dests
      .filter(this.nameFilter)
      .sort((s1, s2) => s1.name.localeCompare(s2.name))
  }

  nameFilter = (d) => {
    let check = this.filter ? this.filter.trim().toLowerCase() : "";
    return d.name.toLowerCase().startsWith(check);
  }

  selectDest = (dest) => {
    this.viewController.dismiss(dest);
  }

  submit = () => {
    this.viewController.dismiss({ name: this.filter });
  }

  dismiss = () => {
    this.viewController.dismiss();
  }

}