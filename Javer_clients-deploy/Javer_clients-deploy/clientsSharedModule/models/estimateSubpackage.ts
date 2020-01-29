import { Catalog } from "./catalog";

export class EstimateSubpackage extends Catalog {
    packageCode: string;
    packageName: string;
    subpackageName: string;
    subpackageCode: string;
    cost: number;
    estimatedQuantity: number;
    pendingQuantity: number;
    proposedQuantityX: number;
    contractId: string;
    toEstimate: boolean;
}

