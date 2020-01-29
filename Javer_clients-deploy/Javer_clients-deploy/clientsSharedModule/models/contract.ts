import { Catalog } from "./catalog";
import { EstimateSubpackage } from "./estimateSubpackage";

export class Contract extends Catalog {
    vendor: string;
    name: string;
    sectionId: string;
    subpackages: EstimateSubpackage[];
}

