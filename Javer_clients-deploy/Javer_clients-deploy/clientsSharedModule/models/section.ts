import { Catalog } from "./catalog";
import { Contract } from "./contract";

export class Section extends Catalog {
    sectionName: string;
    sectionCode: string;
    elementId: string;
    contracts: Contract[];
}

