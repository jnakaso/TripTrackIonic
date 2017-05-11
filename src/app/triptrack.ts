export class Total {
    trips: number = 0;
    distance: number = 0;
    time: number = 0;
    expenses: number = 0;
}

export enum DateRange {
    day, week, month, year
}

export class Destination {
    id: string;
    name: string;
    distance: number;
}

export class Trip {
    id: string;
    destination: string;
    date: string;
    distance: number;
    expense: number;
    time: string;
    notes: string;
}

export function TT_newDate(): Date {
    let now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function TT_guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}