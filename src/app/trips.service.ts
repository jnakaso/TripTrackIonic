import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Trip, TT_guid } from './triptrack';


@Injectable()
export class TripsService {

    constructor(private storage: Storage,
        private events: Events,
        private socialSharing: SocialSharing) {
    }

    newInstance = (): Trip => {
        let trip = new Trip();
        trip.date = this.calcAdjustedDate(new Date().toString()).toISOString();
        return trip;
    }

    clear = () => {
        this.storage.keys() //
            .then(keys => {
                Promise.all(
                    keys.filter(k => k.startsWith('trip '))
                        .map(k => this.storage.remove(k)))
                    .then(r => this.events.publish('trips:changed', null))
            });
    }

    query = (success: Function) => {
        let items: Trip[] = [];
        this.storage.forEach((v, k, i) => {
            if (k.startsWith('trip ')) {
                items.push(this.getObject(v));
            }
        }).then(t => success(items));
    }

    create = (trip: Trip, success: Function) => {
        trip.id = TT_guid();
        this.storage
            .set(`trip ${trip.id}`, JSON.stringify(trip))
            .then(t => {
                this.events.publish('trips:changed', trip);
                success(t)
            });
    }

    update = (trip: Trip, success: Function) => {
        this.storage
            .set(`trip ${trip.id}`, JSON.stringify(trip))
            .then(t => {
                this.events.publish('trips:changed', trip);
                success(t)
            });
    }

    delete = (id: string) => {
        this.storage.remove(`trip ${id}`).then(e => {
            this.events.publish('trip:deleted', id);
            this.events.publish('trips:changed', null);
        });
    }

    export = (trips: Trip[]) => {
        this.socialSharing.canShareViaEmail().then(() => {
            let subject = ('TripTack: ' + new Date());
            let body = JSON.stringify(trips);
            this.socialSharing.shareViaEmail(body, subject, ['jnakaso@yahoo.com']).then(() => {
                return true;
            }).catch(() => {
                // Error!
            });
        }).catch(() => {
            console.log("no email.");
        });
    }

    getObject = (v: any): Trip => {
        let t = JSON.parse(v);
        t.distance = t.distance ? parseFloat(t.distance) : undefined;
        if (t.date.indexOf('GMT') > 0) {
            t.date = this.calcAdjustedDate(t.date).toISOString();
        }
        t.expense = t.expense ? parseFloat(t.expense) : undefined;
        return t;
    }

    between = (trip: Trip, start: string, end: string): boolean => {
        // let tTime = this.calcAdjustedDate(new Date().toString()).getTime();
        // console.log("s", start, "e", end);
        // return this.calcAdjustedDate(start.toString()).getTime() <= tTime
        //     && tTime < this.calcAdjustedDate(end.toString()).getTime();

        return start <= trip.date && trip.date < end;
    }

    calcAdjustedDate = (dateString: string): Date => {
        let aDate = new Date(dateString);
        aDate.setMinutes(aDate.getMinutes() - aDate.getTimezoneOffset());
        return aDate;
    }

    dateSort = (s1: Trip, s2: Trip): number => { return new Date(s2.date).getTime() - new Date(s1.date).getTime() }

    destSort = (s1: Trip, s2: Trip): number => { return s1.destination.localeCompare(s2.destination) }

    distSort = (s1: Trip, s2: Trip): number => { return s1.distance - s2.distance }

}