import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';
import { Trip, Total, DateRange, TT_newDate } from './triptrack';
import { TripsService } from "./trips.service";

const STORAGE_KEY_DEST_TOTAL: string = "desttotal";
const STORAGE_KEY_TOTAL: string = "total";
const STORAGE_KEY_SEPARATOR: string = ":";
const STORAGE_DATE_SEPARATOR: string = "/";

@Injectable()
export class StatsService {

    constructor(
        private storage: Storage,
        private events: Events,
        private tripsService: TripsService) {

        this.storage.ready().then(() => this.seed());

        events.subscribe('trips:changed', (trip) => {
            this.tripsChanged(trip);
        });
    }

    tripsChanged = (trip: Trip) => {
        this.recalcTotals();
    }

    recalcTotals = () => {
        console.log("recalcTotals");
        this.tripsService.query(trips => {
            let today = TT_newDate();
            let dates = [DateRange.year, DateRange.month, DateRange.week, DateRange.day]
                .map(range => new Promise((resolve, reject) => {
                    let start = this.trimDate(this.calcStartDate(range, today));
                    let end = this.trimDate(this.calcEndDate(range, today));
                    let filtered = trips.filter(t => this.tripsService.between(t, start, end));
                    this.createEntry(range, today, filtered)
                        .then(total => resolve(total));
                }));
            this.clearDestTotals().then((result) => {
                Promise.all(Array.from(new Set<string>(trips.map(t => t.destination)))
                    .map(dest => this.createDestTotalEntry(dest, trips.filter(t => t.destination == dest))))
                    .then(result => this.events.publish('totals:changed', result));
            });
        })
    }

    createDestTotalEntry = (dest: string, trips: Trip[]): Promise<any> => {
        return this.storage.set(this.createDestTotalKey(dest), this.createTotal(trips));
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

    clearDestTotals = () => {
        console.log("Clearing the old dests");
        return new Promise((res, rej) => {
            this.storage.keys()
                .then(keys => {
                    Promise.all(keys //
                        .filter(k => k.startsWith(STORAGE_KEY_DEST_TOTAL))
                        .map(k => this.storage.remove(k)))
                        .then(result => res("Done clearing."));
                });
        })
    }

    queryDestTotals = (success: Function) => {
        this.storage.ready().then(() => {
            let dict = new Map<string, Total>();
            this.storage.forEach((v, k, i) => {
                if (k.startsWith(STORAGE_KEY_DEST_TOTAL)) {
                    let key = k.split(STORAGE_KEY_SEPARATOR)[1].toString();
                    dict.set(key, v);
                }
            }).then(result => success(dict));
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

    createDestTotalKey = (dest: string): string => {
        return STORAGE_KEY_DEST_TOTAL //
            + STORAGE_KEY_SEPARATOR //
            + dest;
    }

    createTotal = (trips: Trip[]) => {
        let tot = new Total();
        tot.trips = trips.length;
        tot.distance = trips
            .map(t => t.distance)
            .reduce((t1, t2) => t1 + t2, 0);
        tot.time = trips
            .map(t => {
                if (!t.time)
                    return 0;
                let s = t.time.split(":");
                return 60 * parseInt(s[0]) + parseInt(s[1]);
            })
            .reduce((t1, t2) => t1 + t2, 0);
        tot.expenses = trips
            .map(t => t.expense || 0)
            .reduce((t1, t2) => t1 + t2, 0);

        return tot;
    }

    trimDate = (date) => {
        let s = date.toISOString();
        return s.substring(0, s.indexOf('T'));
    }

    calcStartDate = (range: DateRange, date: Date): Date => {
        switch (range) {
            case DateRange.day: return this.calcStartOfTheDay(date);
            case DateRange.week: return this.calcStartOfTheWeek(date);
            case DateRange.month: return this.calcStartOfTheMonth(date);
            case DateRange.year: return this.calcStartOfTheYear(date);
        }
    }

    calcEndDate = (range: DateRange, input: Date): Date => {
        switch (range) {
            case DateRange.day: return this.calcEndOfTheDay(input);
            case DateRange.week: return this.calcEndOfTheWeek(input);
            case DateRange.month: return this.calcEndOfTheMonth(input);
            case DateRange.year: return this.calcEndOfTheYear(input);
        }
    }

    calcStartOfTheYear = (input: Date): Date => {
        let year = input.getFullYear();
        let a = new Date(year, 0, 1);
        a.setFullYear(a.getFullYear());
        return a;
    }

    calcEndOfTheYear = (input: Date): Date => {
        let year = input.getFullYear();
        let a = new Date(year, 0, 1);
        a.setFullYear(a.getFullYear() + 1);
        return a;
    }

    calcStartOfTheMonth = (input: Date) => {
        let month = input.getMonth();
        let year = input.getFullYear()
        return new Date(year, month, 1);
    }

    calcEndOfTheMonth = (input: Date): Date => {
        let month = input.getMonth();
        let year = input.getFullYear()
        let a = new Date(year, month, 1);
        a.setMonth(a.getMonth() + 1);
        return a;
    }

    calcStartOfTheWeek = (input: Date) => {
        let day = input.getDay();
        let date = input.getDate();
        let month = input.getMonth();
        let year = input.getFullYear()
        return new Date(year, month, date - day);
    }

    calcEndOfTheWeek = (input: Date): Date => {
        let date = input.getDate();
        let month = input.getMonth();
        let year = input.getFullYear()
        let a = new Date(year, month, date);
        let day = input.getDay();
        a.setDate(a.getDate() - day + 7);
        return a;
    }

    calcStartOfTheDay = (input: Date) => {
        let date = input.getDate();
        let month = input.getMonth();
        let year = input.getFullYear()
        return new Date(year, month, date);
    }

    calcEndOfTheDay = (input: Date): Date => {
        let date = input.getDate();
        let month = input.getMonth();
        let year = input.getFullYear()
        let a = new Date(year, month, date);
        a.setDate(a.getDate() + 1);
        return a;
    }




    seed = () => {
        this.storage.ready().then(() => {
            let today = TT_newDate();
            let yearKey = this.createTotalKey(DateRange.year, today);
            this.storage.get(yearKey).then(tot => {
                if (!tot) {
                    this.recalcTotals();
                } else {
                    console.log("Already seeded.", tot);
                }
            });
        });
    }
}