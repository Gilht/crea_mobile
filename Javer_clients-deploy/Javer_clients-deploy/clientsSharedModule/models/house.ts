import { Catalog } from "./catalog";
import { Resident } from "./resident";
import { SectionHouse } from "./sectionHouse";

export class House extends Catalog {
    residentId: string;
    idProject: string;
    commercialName: string;
    idPrototype: string;
    prototypeName: string;
    idCollection: string;
    collection: string;
    idFront: string;
    front: string;
    idBlock: string;
    blockName: string;
    dtuDate: string;
    advance: string;
    idLot: string;
    lotName: string;
    privativeUnit: string;
    element: string;
    rejected: boolean
    dtu: boolean;
    ready: boolean;
    valid: boolean;
    startDate: Date;
    resident: Resident;
    selected: boolean = false;
    sections: SectionHouse[];
}