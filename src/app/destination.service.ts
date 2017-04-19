import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';
import { Trip, Destination, TT_guid } from './triptrack';

@Injectable()
export class DestinationService {

    constructor(private storage: Storage,
        private events: Events) {
        events.subscribe('trips:changed', (trip) => {
            this.tripsChanged(trip);
        });
    }

    tripsChanged = (trip: Trip) => {
        if (trip) {
            let check = trip.destination.trim().toLowerCase();
            this.storage.forEach((v, k, i) => {
                if (k.startsWith('dest ')) {
                    let match = this.getObject(v);
                    if (match.name.trim().toLowerCase() == check) {
                        if (match.distance != trip.distance) {
                            this.update(match, (result) => {
                                this.events.publish('destinations:changed', match);
                            });
                        }
                        return match;
                    }
                }
            }).then(result => {
                if (result == null) {
                    let dest = new Destination();
                    dest.name = trip.destination;
                    dest.distance = trip.distance;
                    this.create(dest, (result) => {
                        this.events.publish('destinations:changed', dest);
                    });
                }
            })
        }
    }

    findMatching = (trip: Trip): Destination[] => {
        let check = trip.destination.trim().toLowerCase();
        return this.query(-1)
            .filter(d => d.name.trim().toLowerCase() == check);
    }

    create = (destination: Destination, success: Function) => {
        destination.id = TT_guid();
        this.storage
            .set(`dest ${destination.id}`, JSON.stringify(destination))
            .then(d => success(destination));
    }

    update = (destination: Destination, success: Function) => {
        this.storage
            .set(`dest ${destination.id}`, JSON.stringify(destination))
            .then(d => success(destination));
    }

    delete = (id: string) => {
        this.storage.remove(`dest ${id}`).then(e => {
            this.events.publish('destinations:changed', id);
        });
    }

    query = (count: number): Destination[] => {
        let dests: Destination[] = [];
        this.storage.forEach((v, k, i) => {
            if (k.startsWith('dest ')) {
                dests.push(this.getObject(v));
            }
        });
        return dests;
    }

    clear = () => {
        this.storage.keys() //
            .then(keys => {
                Promise.all(
                    keys.filter(k => k.startsWith('dest '))
                        .map(k => this.storage.remove(k)))
                    .then(r => this.events.publish('destinations:changed', null))
            });
    }


    getObject(v: any): Destination {
        return JSON.parse(v);
    }
}