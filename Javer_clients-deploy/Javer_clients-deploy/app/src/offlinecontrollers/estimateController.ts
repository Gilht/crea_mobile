
import { Injectable } from '@angular/core';
import * as _ from "lodash";
import { SynchroController } from './synchroController';



@Injectable()
export class EstimateController {

    constructor(private synchroController: SynchroController) { }

    getProvidersContracts(body) {
        return this.synchroController.get(this.synchroController.models.estimate).then(res => {
            let diferentProviders = <any>{};
            res = res.filter(x => x.front == body.frontId && x.collection == body.collectionId);
            res.forEach(element => {
                diferentProviders[element.provider] = { id: element.provider, name: element.providerName, contracts: [] }
            });
            diferentProviders = _.valuesIn(diferentProviders);
            diferentProviders.map(provider => {
                provider.contracts = _.sortBy(_.uniqBy(res.filter(x => x.provider == provider.id).map(x => {
                    return {
                        id: x.contract
                    }
                }), c => c.id), y => y.id)
                return provider;
            })
            diferentProviders = _.sortBy(diferentProviders, p => p.name);

            return diferentProviders;
        });
    }
    getFrontCollection(body) {
        return this.synchroController.get(this.synchroController.models.estimate).then(res => {
            let diferentFronts = <any>{};
            res = res.filter(x => x.projectCode == body.proyecto);
            res.forEach(element => {
                diferentFronts[element.front] = { id: element.front, name: element.frontName, collections: [] }
            });
            diferentFronts = _.valuesIn(diferentFronts);
            diferentFronts = diferentFronts.map(front => {
                front.collections = _.sortBy(_.uniqBy(res.filter(x => x.front == front.id).map(x => {
                    return {
                        id: x.collection,
                        name: x.collectionName
                    }
                }), c => c.id), y => y.name)
                return front;
            })

            diferentFronts = _.sortBy(diferentFronts, f => f.name);
            return diferentFronts;
        });
    }

    getWorkingEstimate(body, estimate) {
        return this.synchroController.get(this.synchroController.models.estimate).then(estimates => {
            let filteredEstimates = estimates ? estimates.filter(x => x.projectCode == body.projectCode && x.front == body.frente && x.collection == body.conjunto && x.provider == body.provider && x.contract == body.contract) : null;
            let localEstimate = _.isEmpty(filteredEstimates) ? null : _.maxBy(filteredEstimates, x => x.estimateNumber);
            return localEstimate || estimate;
        });
    }
    eraseOldEstimates(body, estimate) {
        return this.synchroController.get(this.synchroController.models.estimate).then(res => {
            if (res && res.length > 0) {
                let dataToErase = res.filter(x => x.projectCode == body.projectCode && x.front == body.frente && x.collection == body.conjunto && x.provider == body.provider && x.contract == body.contract);
                res.push(estimate);
                if (dataToErase.length > 0) {
                    res = _.without(res, ...dataToErase)
                    return this.synchroController.set(this.synchroController.models.estimate, res).then(() => {
                        return estimate;
                    });
                } else {
                    return this.synchroController.set(this.synchroController.models.estimate, res).then(() => {
                        return estimate;
                    });
                }
            }
            else {
                return this.synchroController.set(this.synchroController.models.estimate, [estimate]).then(() => {
                    return estimate;
                });
            }
        });
    }
}
