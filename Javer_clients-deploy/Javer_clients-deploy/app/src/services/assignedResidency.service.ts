import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../util/AppConfig';
import { ServiceUtil } from '../clientsSharedModule/ServiceUtil';
import { SynchroController } from '../offlinecontrollers/synchroController';
import * as _ from 'lodash';

@Injectable()
export class BuildingLotManagerService {
  // By Reference
  public buildingLots: Array<BuildingLot> = [];
  // class vars
  private sectionsLimit: number = 80;

  constructor(private synchroController: SynchroController) {
  }

  setAnySectionHasPackagesFlag(): Promise<any> {
    return this.synchroController.get(this.synchroController.models.section)
    .then(sections => {
      let sectionsByBuildingLot: Object = _.groupBy(sections, section => section.house.element);
      // Get selected building lots
      _.each(this.buildingLots, bl => {
        let blSections: Array<any> = sectionsByBuildingLot[bl.name] || [];
        bl.anySectionHasPackages = this.anySectionHasPackages(blSections);
      });
    });
  }

  setDownloadedFlag(): Promise<any> {
    // Get the downloaded sections from storage and group them by element
    // we consider a building lot as downloaded when at least one section
    // with that building lot element is found and some of the sections
    // have packages
    return this.synchroController.get(this.synchroController.models.section)
    .then(sections => {
      let matchedElements: Object = _.groupBy(sections, section => section.house.element);
      let availableElements: Array<string> = _.keysIn(matchedElements);

      _.each(this.buildingLots, bl => {
        if(availableElements.indexOf(bl.name) >= 0) {
          bl.downloaded = true;
        }
      });
    });
  }

  setCheckedOnServer(selectedBuildingLots: Array<string>): Promise<any> {
    return new Promise((resolve, reject) => {
      if(selectedBuildingLots != null) {
        _.each(this.buildingLots, bl => {
          if(selectedBuildingLots.indexOf(bl.name) >= 0) {
            bl.checkedOnServer = true;
          }
        });
      }
      resolve();
    });
  }

  canBeSaved(selectedBuildingLots: Array<string>): Promise<any> {
    return this.synchroController.get(this.synchroController.models.section)
    .then(sections => {
      let numSavedSections = (sections ? sections.length : 0);
      let numSectionsToSave = this.buildingLots.reduce((accum, bl, index, arr) => {
        if (selectedBuildingLots.indexOf(bl.name) < 0) return accum;
        return accum + bl.numSectionHouses;
      }, 0);
      let numCombinedSections = numSavedSections + numSectionsToSave;

      return (numCombinedSections <= this.sectionsLimit);
    });
  }

  private anySectionHasPackages(sections: Array<any>): boolean {
    return sections.some(section => {
      return _.has(section, 'sectionHouseTPS') && !_.isEmpty(section.sectionHouseTPS);
    });
  }

  // Debug
  printData(): void {
    console.info(this.buildingLots);
  }
}

export class BuildingLot {
  public name: string = '';
  public selected: boolean = false;
  public checkedOnServer: boolean = false;
  public downloaded: boolean = false;
  public anySectionHasPackages: boolean = false;
  public numSectionHouses: number = 0;

  constructor(name: string, numSectionHouses: number) {
    this.name = name;
    this.numSectionHouses = numSectionHouses;
  }

}

export class Front {
  public id: number = 0;
  public name: string = '';

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }
}

export class Collection {
  public id: number = 0;
  public name: string = '';

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }
}
