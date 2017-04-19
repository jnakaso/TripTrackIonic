import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';
import { Trip, Total, DateRange } from './triptrack';
import { TripsService } from "./trips.service";

const STORAGE_KEY_TOTAL: string = "total";
const STORAGE_KEY_SEPARATOR: string = ":";
const STORAGE_DATE_SEPARATOR: string = "/";

@Injectable()
export class StatsService {

    constructor(
        private storage: Storage,
        private events: Events,
        private tripsService: TripsService) {

        this.seed();

        events.subscribe('trips:changed', (trip) => {
            this.tripsChanged(trip);
        });
    }

    tripsChanged = (trip: Trip) => {
        this.recalcTotals();
    }

    recalcTotals = () => {
        console.log("recalcTotals");
        let trips = [];
        this.storage.forEach((v, k, i) => {
            if (k.startsWith('trip ')) {
                trips.push(this.tripsService.getObject(v));
            }
        }).then(result => {
            let today = new Date();
            Promise.all([DateRange.year, DateRange.month, DateRange.week, DateRange.day]
                .map(range => new Promise((resolve, reject) => {
                    let start = this.calcStartDate(range, today).toISOString();
                    let end = this.calcEndDate(range, today).toISOString();
                    let filtered = trips.filter(t => this.tripsService.between(t, start, end));
                    this.createEntry(range, today, filtered)
                        .then(total => resolve(total));
                })))
                .then(result => this.events.publish('totals:changed', result));
        });
    }
   
    createEntry = (range: DateRange, date: Date, trips: Trip[]): Promise<any> => {
        return this.storage.set(this.createTotalKey(range, date), this.createTotal(trips));
    }

    findMatching = (range: DateRange, date: Date, success: Function) => {
        let key = this.createTotalKey(range, date);
        this.storage.get(key).then(tot => {
            success(tot ? tot : new Total());
        });
    }

    createTotalKey = (range: DateRange, date: Date): string => {
        let rangeStart: Date = this.calcStartDate(range, date);
        return STORAGE_KEY_TOTAL //
            + STORAGE_KEY_SEPARATOR //
            + range //
            + STORAGE_KEY_SEPARATOR // 
            + rangeStart.getFullYear().toString() //
            + STORAGE_DATE_SEPARATOR //
            + rangeStart.getMonth().toString() //
            + STORAGE_DATE_SEPARATOR //
            + rangeStart.getDate().toString();
    }

    createTotal = (trips: Trip[]) => {
        let tot = new Total();
        tot.trips = trips.length;
        tot.distance = trips
            .map(t => t.distance)
            .reduce((t1, t2) => t1 + t2, 0);
        return tot;
    }

    calcEndDate = (range: DateRange, input: Date): Date => {
        switch (range) {
            case DateRange.day: {
                let date = input.getDate();
                let month = input.getMonth();
                let year = input.getFullYear()
                let a = new Date(year, month, date);
                a.setDate(a.getDate() + 1);
                return a;
            }
            case DateRange.week: {
                let date = input.getDate();
                let month = input.getMonth();
                let year = input.getFullYear()
                let a = new Date(year, month, date);
                let day = input.getDay();
                a.setDate(a.getDate() - day + 7);
                return a;
            }
            case DateRange.month: {
                let month = input.getMonth();
                let year = input.getFullYear()
                let a = new Date(year, month, 1);
                a.setMonth(a.getMonth() + 1);
                return a;
            }
            case DateRange.year: {
                let year = input.getFullYear();
                let a = new Date(year, 0, 1);
                a.setFullYear(a.getFullYear() + 1);
                return a;
            };
        }
    }

    calcStartDate = (range: DateRange, date: Date): Date => {
        switch (range) {
            case DateRange.day: return this.calcToday(date);
            case DateRange.week: return this.calcFirstDayOfTheWeek(date);
            case DateRange.month: return this.calcFirstDayOfTheMonth(date);
            case DateRange.year: return this.calcFirstDayOfTheYear(date);
        }
    }

    calcFirstDayOfTheYear = (input: Date) => {
        let year = input.getFullYear()
        return new Date(year, 0, 1);
    }

    calcFirstDayOfTheMonth = (input: Date) => {
        let month = input.getMonth();
        let year = input.getFullYear()
        return new Date(year, month, 1);
    }

    calcFirstDayOfTheWeek = (input: Date) => {
        let day = input.getDay();
        let date = input.getDate();
        let month = input.getMonth();
        let year = input.getFullYear()
        return new Date(year, month, date - day);
    }

    calcToday = (input: Date) => {
        let date = input.getDate();
        let month = input.getMonth();
        let year = input.getFullYear()
        return new Date(year, month, date);
    }

    seed = () => {
        let today = new Date();
        let yearKey = this.createTotalKey(DateRange.year, today);
        this.storage.get(yearKey).then(tot => {
            if (!tot) {
                this.recalcTotals();
            } else {
                console.log("Already seeded.", tot);
            }
        });
    }
}