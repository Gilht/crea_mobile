import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from "@angular/core";
import { NgModel, ControlValueAccessor } from "@angular/forms";
import * as _ from 'underscore';

//import {NgIf, NgFor, NgClass} from "@angular/common";

@Component({
    selector: 'ng-pagination[ngModel]',
    //  directives: [NgIf, NgFor, NgClass],
    template: `
              <ul class="pagination" style="margin:3px 0" >
                  <li *ngIf="previousItemValid && firstText" (click)="firstPage()"><a href="#" [innerHTML]="firstText">First</a></li>
                  <li> <a *ngIf="previousItemValid" (click)="previousPage(previousItem)" aria-label="Previous"> <span aria-hidden="true">&laquo;</span> <small></small> </a> </li>
                  <li *ngFor="let pageNo of pageList" [ngClass]="{'active':seletedPage === pageNo}">
                      <a (click)="setCurrentPage(pageNo)">{{pageNo}}</a>
                  </li>
                  <li> <a  *ngIf="nextItemValid" (click)="nextPage(nextItem)" aria-label="Next"> <span aria-hidden="true">&raquo;</span> </a> </li>
                  <li><a *ngIf="nextItemValid && lastText" (click)="lastPage()" [innerHTML]="lastText" >Last</a></li>
                </ul>
                <style>
</style>
`
})
export class PaginationDirective implements ControlValueAccessor, OnInit {
    @Input("previous-text") previousText: string;
    @Input("next-text") nextText: string;
    @Input("first-text") firstText: string;
    @Input("last-text") lastText: string;
    @Input("totalItems") totalItems: number;
    @Input("currentPage") cPage: number;
    @Input("maxSize") pageSize: number;
    @Input("boundaryLinks") boundaryLinks: boolean;
    @Output("pageChanged") pageChanged = new EventEmitter();
    currentpage: number;
    pageList: Array<number> = [];
    onChange: Function;
    onTouched: Function;
    seletedPage: number;
    nextItem: number;
    previousItem: number;
    nextItemValid: boolean;
    previousItemValid: boolean;
    refresh: boolean;

    constructor(private pageChangedNgModel: NgModel) {
        this.pageChangedNgModel.valueAccessor = this;
    }

    ngOnInit() {
        this.doPaging();
    }

    ngOnChanges(changes: SimpleChanges) {
      if(changes.totalItems && changes.totalItems.currentValue != changes.totalItems.previousValue) {
        this.refresh = true;
        this.doPaging();
      }
    }

    doPaging() {
        var that = this;
        var isOnOptions = _.some(this.pageList, function (num) {
            return num === that.currentpage;
        })
        if (!isOnOptions || this.refresh) {

            this.pageList = [];
            var i: number, count: number;

            this.seletedPage = this.currentpage;

            var remaining = this.totalItems % this.pageSize;
            var totalSize = ((this.totalItems - remaining) / this.pageSize) + (remaining === 0 ? 0 : 1);
            for (i = (this.currentpage), count = 0; i <= totalSize && count < 5; i++ , count++) {
                this.pageList.push(i);
            }

            //for (i = (this.currentpage), count = 0; i <= totalSize && count < this.pageSize; i++ , count++) {

            //next validation
            if (i - 1 < totalSize) {
                this.nextItemValid = true;
                this.nextItem = i;

            } else {
                this.nextItemValid = false;
            }

            //previous validation
            if ((this.currentpage) > 1) {
                this.previousItemValid = true;
                this.previousItem = this.currentpage - 1;

            } else {
                this.previousItemValid = false;
            }

            this.refresh = false;
        } else {
            this.seletedPage = this.currentpage;
        }
    }

    setCurrentPage(pageNo: number) {
        this.currentpage = this.seletedPage = pageNo;
        this.pageChangedNgModel.viewToModelUpdate(pageNo);
        this.pageChageListner();
    }

    firstPage() {
        this.currentpage = 1;
        this.pageChangedNgModel.viewToModelUpdate(1);
        this.pageChageListner();
        this.doPaging()
    }

    lastPage() {
        var totalPages = ~~(this.totalItems / this.pageSize);
        let lastPage = this.totalItems % this.pageSize > 0 ? totalPages + 1 : totalPages

        this.currentpage = lastPage;
        this.pageChangedNgModel.viewToModelUpdate(lastPage);
        this.pageChageListner();
        this.doPaging()
    }

    nextPage(pageNo: number) {
        this.currentpage = pageNo;
        this.pageChangedNgModel.viewToModelUpdate(pageNo);
        this.pageChageListner();
        this.doPaging()
    }

    previousPage(pageNo: number) {
        //var temp = pageNo - this.pageSize;
        var temp = pageNo - 4;
        this.currentpage = temp > 0 ? temp : 1;
        this.pageChangedNgModel.viewToModelUpdate(this.currentpage);
        this.pageChageListner();
        this.doPaging();
    }

    writeValue(value: string): void {
        if (!value && value !== '0') { return };
        this.setValue(value);
    }

    registerOnChange(fn: (_: any) => {}): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: (_: any) => {}): void {
        this.onTouched = fn;
    }

    setValue(currentValue: any) {
        this.currentpage = currentValue;
        this.doPaging();
    }

    pageChageListner() {
        this.pageChanged.emit({
            itemsPerPage: this.pageSize,
            page: this.currentpage
        });
    }

}
