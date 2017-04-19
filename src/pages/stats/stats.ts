import { Component } from '@angular/core';
import { NavController, Events } from 'ionic-angular';
import { Trip, Total, DateRange } from "../../app/triptrack";
import { TripsService } from "../../app/trips.service";
import { StatsService } from "../../app/stats.service";

@Component({
  selector: 'page-stats',
  templateUrl: 'stats.html'
})
export class StatsPage {
  trips: Trip[] = [];
  today: Total = new Total();
  week: Total = new Total();
  month: Total = new Total();
  year: Total = new Total();

  constructor(public navCtrl: NavController,
    private tripsService: TripsService,
    private statsService: StatsService,
    private events: Events) {

    this.refresh();
    this.refreshTotals();

    events.subscribe('trips:changed', (trip, time) => {
      console.log("trips:changed");
      this.refresh();
    });

    events.subscribe('totals:changed', (result) => {
      console.log("totals:changed", result);
      this.refreshTotals();
    });
  }

  getFiltered = () => {
    return this.trips
      .sort(this.tripsService.dateSort)
      .slice(0, 5);
  }

  refresh = () => {
    this.tripsService.query(t => this.trips = t);
  }

  refreshTotals = () => {
    let today = new Date();
    this.statsService.findMatching(DateRange.day, today, tot => this.today = tot);
    this.statsService.findMatching(DateRange.week, today, tot => this.week = tot);
    this.statsService.findMatching(DateRange.month, today, tot => this.month = tot);
    this.statsService.findMatching(DateRange.year, today, tot => this.year = tot);
  }


}
