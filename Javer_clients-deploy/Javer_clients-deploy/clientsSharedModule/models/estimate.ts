import { Catalog } from "./catalog";
import { EstimateHouse } from "./estimateHouse";
import { EstimateSubpackage } from "./estimateSubpackage";

export class Estimate extends Catalog {
    houses: EstimateHouse[];
    subpackages: EstimateSubpackage[];
    contracts: string[];
    sections: string[];
    idProject: string;
    idCollection: string;
    idFront: string;
}

