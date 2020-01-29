import { Catalog } from "./catalog";
import { Resident } from "./resident";

export class SectionHouse extends Catalog {
    interiorNumber: string;
    outdoorNumber: string;
    idLivingPlace: string;
    sectionCode: string;
    selected: boolean = true;
    residentId: string;
}