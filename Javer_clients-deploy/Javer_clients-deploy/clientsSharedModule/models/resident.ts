import { Catalog } from "./catalog";
import { House } from "./house";

export class Resident extends Catalog {
    lastName: string;
    lastNameMother: string;
    login: string;
    position: string;
    work: string;
    positionName: string;
    workName: string;
    houses: House[];
}
