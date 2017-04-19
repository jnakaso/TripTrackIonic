import { Component } from '@angular/core';

import { StatsPage } from '../stats/stats';
import { TripsPage } from '../trips/trips';
import { DestinationsPage } from '../destinations/destinations';
import { HomePage } from '../home/home';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = StatsPage;
  tab3Root = TripsPage;
  tab4Root = DestinationsPage;

  constructor() {

  }
}
