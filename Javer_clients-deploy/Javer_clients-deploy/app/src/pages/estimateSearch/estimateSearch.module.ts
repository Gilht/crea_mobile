import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EstimateSearchPage } from './estimateSearch';

@NgModule({
    declarations: [
        EstimateSearchPage,
    ],
    imports: [
        IonicPageModule.forChild(EstimateSearchPage),
    ],
    entryComponents: [
        EstimateSearchPage,
    ],
})
export class EstimateSearchPageModule { }
