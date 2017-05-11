import { Component } from '@angular/core';
import { NavController, AlertController, MenuController } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { Destination } from "../../app/triptrack";
import { DestinationService } from "../../app/destination.service";

@Component({
    selector: 'page-destinations',
    templateUrl: 'destinations.html'
})
export class DestinationsPage {

    filter: string = "";
    sort: string = "name";
    destinations: Destination[] = [];

    constructor(public navCtrl: NavController,
        private alertCtrl: AlertController,
        private menuCtrl: MenuController,
        private destinationService: DestinationService,
        private events: Events) {

        console.log("DestinationsPage");
        events.subscribe('destinations:changed', (trip, time) => {
            this.refresh();
        });
    }

    ionViewWillEnter = () => {
        this.menuCtrl.enable(false, 'tripMenu');
        this.menuCtrl.enable(true, 'destMenu');
        this.refresh();
    }

    openMenu = () => {
        this.menuCtrl.toggle('destMenu');
    }

    delete = (id: string) => {
        this.destinationService.delete(id);
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
                        this.destinationService.clear();
                    }
                }
            ]
        });
        confirm.present();
    }

    refresh = () => {
        this.destinationService.query(dd => this.destinations = dd);
    }

    nameFilter = (d: Destination) => {
        let check = this.filter ? this.filter.trim().toLowerCase() : "";
        return d.name.toLowerCase().startsWith(check);
    }

    getSort = () => {
        switch (this.sort) {
            case 'name': return this.destinationService.nameSort;
            case 'dist': return this.destinationService.distSort;
            default: return this.destinationService.nameSort;
        }
    }

    getFiltered = () => {
        return this.destinations
            .filter(this.nameFilter)
            .sort(this.getSort());
    }
}
