import { Component } from '@angular/core';
import { NavController, Events } from 'ionic-angular';
import { Total, DateRange, TT_newDate } from "../../app/triptrack";
import { TripsService } from "../../app/trips.service";
import { StatsService } from "../../app/stats.service";

@Component({
  selector: 'page-stats',
  templateUrl: 'stats.html'
})
export class StatsPage {
  dateRange = "day";
  desttotals = new Map<string, Total>();
  total: Total = new Total();
  destinations = [];

  constructor(public navCtrl: NavController,
    private tripsService: TripsService,
    private statsService: StatsService,
    private events: Events) {

    events.subscribe('totals:changed', (result) => {
      this.refreshTotals();
      this.refreshDestTotals();
    });
  }

  ionViewWillEnter = () => {
    this.refreshTotals();
    this.refreshDestTotals();
  }

  refreshTotals = () => {
    this.statsService.findMatching(this.getDateRange(), TT_newDate(), (tot: Total) => this.total = tot);
  }

  refreshDestTotals = () => {
    this.statsService.queryDestTotals((dts: Map<string, Total>) => {
      this.destinations = [];
      this.desttotals.clear();
      dts.forEach((v, k, m) => {
        this.destinations.push(k);
        this.desttotals.set(k, v);
      });
      this.destinations.sort();
    });
  }

  getTotal = (dest) => {
    return this.desttotals.get(dest);
  }
  getDateRange = () => {
    switch (this.dateRange) {
      case "day": return DateRange.day;
      case "week": return DateRange.week;
      case "month": return DateRange.month;
      case "year": return DateRange.year;
    }
  }

  changeDateRange = (dateRange) => {
    console.log(this.total);
    this.dateRange = dateRange;
    this.refreshTotals();
  }

}
