import { Catalog } from "./catalog";
import { Section } from "./section";

export class EstimateHouse extends Catalog {
    name: string;
    estimateId: string;
    sections: Section[];
}

