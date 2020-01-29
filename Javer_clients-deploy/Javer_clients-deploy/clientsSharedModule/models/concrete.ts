import { Catalog } from "./catalog";

export class Concrete extends Catalog {

    constructor() {
        super();
        this.date = undefined;
        this.status = "";
        this.observations = "";
        this.time = undefined;
        this.quantity = undefined;
        this.resistence = undefined;
        this.gravel = undefined;
        this.rev = undefined;
        this.td = false;
        this.tb = false;
        this.additives = "";
        this.usage = "";
        this.block = "";
        this.req = undefined;
        this.group = "";
        this.contractor = "";
    }
    timeOffset = (new Date()).getTimezoneOffset() * 60000;
    date: string;
    status: string;
    observations: string;
    time: string;
    quantity: number;
    resistence: number;
    gravel: number;
    rev: number;
    td: boolean;
    tb: boolean;
    additives: string;
    usage: string;
    block: string;
    req: string;
    group: string;
    contractor: string;
}