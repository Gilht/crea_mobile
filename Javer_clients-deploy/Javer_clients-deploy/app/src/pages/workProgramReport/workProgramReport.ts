import { Component } from '@angular/core';
import { AppConfig } from "../../util/AppConfig";
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import * as moment from "moment";
import * as _ from "lodash";
import { message, SharedHouseService } from "./../../clientsSharedModule/sharedmodule";
import {
    ToastService,
    WorkProgramService,
    SubdivisionService,
    HouseService
} from "../../services/services";
import { ServiceUtil } from '../../clientsSharedModule/ServiceUtil';

@IonicPage()
@Component({
    selector: "page-workprogramreport",
    templateUrl: "./workProgramReport.html",
    providers: [
        ToastService,
        WorkProgramService,
        SharedHouseService,
        HouseService,
        SubdivisionService
    ]
})
export class WorkProgramReportPage {
    workProgramId: any;
    assistArray =
        [0, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 10, 11, 11, 11, 11, 11, 12, 12, 12, 12, 13, 13, 13, 13];
    months: any = [];
    weeks: any = [];
    boxWidth = 15;
    isSunday = 0;
    workProgram: any = {
        templates: [],
        weeks: [],
        authorized: false,
    };
    filteredWeeks: any = {

    };
    templates: any = [];
    isValid: boolean = false;
    pastDate: Date;
    filter: any = {
        resident: "",
        proyecto: "",
        frente: "",
        conjunto: "",
        manzana: "",
        prototipo: ""
    };
    currentTemplateSections = 0;
    conjuntos: any = [];
    selectedTemplate = -1;
    frentes: any = [];
    projects: any = [];
    sections: any = [];
    loading = false;
    AppConfig = AppConfig;
    collapsable: any = [];
    packageIds: any = [];
    checkTotal = false;
    totalSections = 0;
    validations = [];

    constructor(
        private workProgramService: WorkProgramService,
        private sharedHouseService: SharedHouseService,
        private houseService: HouseService,
        private subdivisionService: SubdivisionService,
        private toastService: ToastService,
        public navParams: NavParams,
        public navCtrl: NavController,
    ) {
        this.workProgramId = this.navParams.get("workProgramId");
    }

    ngOnInit() {
        if (this.workProgramId) {
            this.getWorkProgram(this.workProgramId);
        } else {
            this.getSubdivisions();
        }
    }

    getWorkProgram(id) {
        this.loading = true;
        this.workProgramService.getWorkProgram(id).subscribe(
            result => {
                this.workProgram = result;

                this.filterWeeks();
                this.filter.proyecto = this.workProgram.idProject;
                this.filter.frente = this.workProgram.idFront;
                this.filter.conjunto = this.workProgram.idCollection;
                this.getSubdivisions();
                this.getFrente();
                this.getConjunto();
                this.getHouse();
                this.sync();

            },
            error => {
                this.toastService.presentToast(
                    "Ha ocurrido un problema al pedir los programas de obra.",
                    this.toastService.types.error
                );
            }
        );
    }

    getSubdivisions() {
        this.subdivisionService.getSubdivisionsDb().subscribe(
            result => {
                this.projects = result;
            },
            error => {
                this.toastService.presentToast(
                    "Ha ocurrido un problema al pedir los proyectos.",
                    this.toastService.types.error
                );
            }
        );
    }

    getFrente() {
        this.sharedHouseService.getFrente(this.filter).subscribe(
            result => {
                if (result.length == 0) {
                    this.toastService.presentToast(
                        "No se han encontrado registros.",
                        this.toastService.types.error
                    );
                }
                this.frentes = result;
            },
            error => {
                this.toastService.presentToast(
                    "Ha ocurrido un problema al pedir los frentes.",
                    this.toastService.types.error
                );
            }
        );
    }

    getConjunto() {
        this.sharedHouseService.getConjunto(this.filter).subscribe(
            result => {
                if (result.length == 0) {
                    this.toastService.presentToast(
                        "No se han encontrado registros.",
                        this.toastService.types.error
                    );
                }
                this.conjuntos = result;
                if (this.workProgramId != null) {
                    this.getHouse();
                }
            },
            error => {
                this.toastService.presentToast(
                    "Ha ocurrido un problema al pedir los conjuntos.",
                    this.toastService.types.error
                );
            }
        );
    }

    saveWorkProgram() {
        this.beforeAll();
        if (this.workProgram.id) {
            delete this.workProgram.id;
            this.workProgram.templates = this.workProgram.templates.map(template => {
                delete template.id;
                delete template.workprogramId;
                return template;
            });
            this.workProgram.weeks = this.workProgram.weeks.map(week => {
                delete week.id;
                delete week.workProgramId;
                week.wPWeeksTP = week.wPWeeksTP.map(wPWeekTP => {
                    delete wPWeekTP.workProgramWeekId;
                    delete wPWeekTP.id;
                    wPWeekTP.wPWeeksTPS = wPWeekTP.wPWeeksTPS.map(wPWeekTPS => {
                        delete wPWeekTPS.id;
                        delete wPWeekTPS.wPWeekTPId;
                        return wPWeekTPS;
                    });
                    return wPWeekTP;
                });
                return week;
            });
        }

        var workProgramCopy = {
            collection: this.workProgram.collection,
            commercialName: this.workProgram.commercialName,
            front: this.workProgram.front,
            idCollection: this.workProgram.idCollection,
            idFront: this.workProgram.idFront,
            idProject: this.workProgram.idProject,
            initialDate: this.workProgram.initialDate,
            templates: [],
            weekNumber: this.workProgram.weekNumber,
            weeks: this.workProgram.weeks,
            comments: "",
            authorized: this.workProgram.authorized,
        }

        for (let i = 0; i < this.workProgram.templates.length; i++) {
            workProgramCopy.templates.push({ templateId: this.workProgram.templates[i].templateId });
        }

        for (let i = 0; i < workProgramCopy.weeks.length; i++) {
            for (let j = 0; j < workProgramCopy.weeks[i].wPWeeksTP.length; j++) {
                if (workProgramCopy.weeks[i].wPWeeksTP[j].wPTemplate) {
                    delete workProgramCopy.weeks[i].wPWeeksTP[j].wPTemplate.template;
                }
            }
        }
    }

    setCollection(value) {
        this.workProgram.idCollection = value;
        this.workProgram.collection = this.conjuntos.find(x => x.id === value).value;
    }
    setFront(value) {
        this.workProgram.idFront = value;
        this.workProgram.front = this.frentes.find(x => x.id === value).value;
    }
    setProyect(value) {
        this.workProgram.idProject = value;
        this.workProgram.commercialName = this.projects.find(
            x => x.externalId === value
        ).name;
    }

    getHouse() {
        this.loading = true;
        this.workProgramService.getSectionsTemplates(this.filter).subscribe(
            result => {
                if (!result.sections || result.sections.length === 0) {
                    this.toastService.presentToast(
                        'No se han encontrado registros o falta configurar las viviendas.',
                        this.toastService.types.error
                    );
                    return;
                }
                this.sections = result.sections;

                if (!this.workProgramId) {
                    this.workProgram.templates = result.templates.map(x => {
                        let res = {
                            template: x,
                            templateId: x.id
                        };
                        return res;
                    });
                }
                this.getHousePastDate();
                this.makeCalendar();
                this.getHouses();

            },
            error => {
                this.loading = false;
                if (error.status == 406) {
                    this.toastService.presentToast(
                        "Una de las secciones no tiene una plantilla asignada.",
                        this.toastService.types.error
                    );
                } else {
                    this.toastService.presentToast(
                        message.error,
                        this.toastService.types.error
                    );
                }
            }
        );
    }

    getHouses() {
        this.loading = true;
        let filter = {
            proyecto: this.workProgram.idProject,
            frente: this.workProgram.idFront,
            conjunto: this.workProgram.collection
        }
        this.houseService.getHouse(this.filter).subscribe(
            result => {
                if (result.length == 0) {
                    this.toastService.presentToast(message.noRegistry, this.toastService.types.error)
                }
                this.loading = false;
                this.totalSections = _.flatten(result.map(x => x.sections)).length;
            },
            error => {
                this.loading = false;
                this.toastService.presentToast(message.error, this.toastService.types.error)
            }
        );
    }

    getHousePastDate() {
        var dates = this.sections.map(s => moment(s.startDate));
        this.workProgram.initialDate = _.min(dates).startOf("isoWeek");
    }

    resize() {
        let difference = Math.abs(this.workProgram.weekNumber - this.workProgram.weeks.length);
        if (this.workProgram.weekNumber < this.workProgram.weeks.length) {
            for (let i = 0; i < difference; i++) {
                this.filteredWeeks.pop();
            }
        } else if (this.workProgram.weekNumber > this.workProgram.weeks.length) {
            for (var i = this.workProgram.weeks.length; i < this.workProgram.weekNumber; i++) {
                this.workProgram.weeks.push({ order: i + 1, wPWeeksTP: [] });
                this.workProgram.templates.forEach(template => {
                    return template.template.packages.forEach(pack => {
                        let value = {
                            programmed: undefined,
                            tPId: pack.id,
                            wPTemplate: {
                                templateId: template.templateId,
                                template: template.template,
                            },
                            wPWeeksTPS: pack.subpackages.map(subpack => {
                                return {
                                    tPSId: subpack.id,
                                    programmed: undefined
                                }
                            })
                        }
                        this.workProgram.weeks[this.workProgram.weeks.length - 1].wPWeeksTP.push(value);
                    })
                })
            }
        }

        let max = _.max(this.validations, x => x.weekNumber).weekNumber;

        // Resize validations
        for (let i = max + 1; i <= this.workProgram.weekNumber; i++) {
            this.workProgram.templates.forEach(template => {
                template.template.packages.forEach(pack => {
                    this.validations.push({
                        id: pack.id,
                        validReal: true,
                        validTotal: true,
                        weekNumber: i
                    })
                    pack.subpackages.forEach(subpack => {
                        this.validations.push({
                            id: subpack.id,
                            validReal: true,
                            validTotal: true,
                            weekNumber: i
                        })
                    })
                })
            })
        }
    }

    updatesectionsDone() {

        this.workProgram.authorized = false;
        this.workProgram.comments = '';
        this.workProgram.weeks = [];

        for (var i = 0; i < this.workProgram.weekNumber; i++) {
            this.workProgram.weeks.push({ order: i + 1, wPWeeksTP: [] });
            this.workProgram.templates.forEach(template => {
                return template.template.packages.forEach(pack => {
                    let value = {
                        programmed: undefined,
                        tPId: pack.id,
                        wPTemplate: {
                            templateId: template.templateId,
                            template: template.template,
                        },
                        wPWeeksTPS: pack.subpackages.map(subpack => {
                            return {
                                tPSId: subpack.id,
                                programmed: undefined
                            }
                        })
                    }
                    this.workProgram.weeks[this.workProgram.weeks.length - 1].wPWeeksTP.push(value);
                })
            })

        }
    }

    getUpdatedArray(sectionsDone) {
        let newLength = this.workProgram.weekNumber * 7;
        let oldLength = sectionsDone.length;
        var result = sectionsDone;
        if (oldLength > newLength) {
            result.splice(oldLength - (oldLength - newLength), oldLength - newLength);
        } else if (newLength > oldLength) {
            result = result
                .concat(new Array(newLength - oldLength))
                .fill(0)
                .map(() => {
                    return { quantity: 0, workProgramTPSId: "" };
                });
        }
        return result;
    }

    // Methods to make the view for the data.

    makeCalendar() {
        var days = [];
        this.weeks = [];
        for (var i = 0; i < this.workProgram.weekNumber * 7; i++) {
            var date = this.workProgram.initialDate;
            days.push(moment(date).add(i, "d"));
        }
        var months = _.groupBy(days, function (d) {
            return moment(d).format("MMMM");
        });
        var monthDays = <any>_.values(months);

        monthDays = monthDays.map(x => {
            var month = {
                name: this.monthNameToSpanish(x[0].format("MMM")),
                days: x.map(d => {
                    var day = {
                        name: this.dayNameToSpanish(d.format("ddd")),
                        number: d.format("D")
                    };
                    return day;
                })
            };
            return month;
        });

        var days = _.flatten(monthDays.map(x => x.days));

        for (var i = 0; i < this.workProgram.weekNumber; i++) {
            var initialDate = moment(this.workProgram.initialDate, "YYYY-MM-DD");
            initialDate.add(i * 7, 'days');
            var lastDate = moment(initialDate, "YYYY-MM-DD");
            lastDate.add(6, 'days');
            var week = {
                name: "SEMANA " + (i + 1),
                days: days.slice(i * 7, (i + 1) * 7),
                initialDay: initialDate,
                lastDay: lastDate
            };
            this.weeks.push(week);
        }
        this.months = monthDays;
    }

    sync() {
        this.makeCalendar();
        if (this.workProgram.weeks.length != this.workProgram.weekNumber) {
            this.resize();
        } else if (this.workProgram.weeks.length == 0) {
            this.updatesectionsDone();
        }
        if (this.validations.length == 0) {
            this.initValidations();
        }
        this.checkTotal = true;
        this.filterWeeks();
    }

    monthNameToSpanish(month) {
        switch (month) {
            case "Ene":
                return "Enero";
            case "Feb":
                return "Febrero";
            case "Mar":
                return "Marzo";
            case "Apr":
                return "Abril";
            case "May":
                return "Mayo";
            case "Jun":
                return "Junio";
            case "Jul":
                return "Julio";
            case "Aug":
                return "Agosto";
            case "Sep":
                return "Septiembre";
            case "Oct":
                return "Octubre";
            case "Nov":
                return "Noviembre";
            case "Dec":
                return "Deciembre";
        }
    }
    dayNameToSpanish(day) {
        switch (day) {
            case "Sun":
                return "D";
            case "Mon":
                return "L";
            case "Tue":
                return "M";
            case "Wed":
                return "M";
            case "Thu":
                return "J";
            case "Fri":
                return "V";
            case "Sat":
                return "S";
        }
    }

    getMonthSize(i) {
        return this.months[i].days.length * this.boxWidth;
    }
    getWeekSize() {
        return 7 * this.boxWidth;
    }

    getWeeksInMonth(i) {
        if (i == 0) {
            return Math.floor(this.months[i].days.length / 7);
        } else {
            return Math.floor(
                Math.floor((this.getSurplusDays(i) + this.months[i].days.length) / 7)
            );
        }
    }

    getSurplusDays(i) {
        if (i == 0) {
            return 0;
        } else {
            return Math.floor(
                (this.months[i - 1].days.length + this.getSurplusDays(i - 1)) % 7
            );
        }
    }

    isWeekEnd(i) {
        return (i + 1) % 7 == 0 && i != 0;
    }

    getWeekTotal(subpackage, i) {
        var counter = 1;
        function f(subpackage, i, counter) {
            if (counter == 7) {
                return subpackage.sectionsDone[i].quantity;
            } else {
                return (
                    subpackage.sectionsDone[i].quantity +
                    f(subpackage, i - 1, counter + 1)
                );
            }
        }
        return f(subpackage, i, counter);
    }
    getSubpackageTotal(subpackage) {
        if (subpackage.sectionsDone.length == 0) {
            return 0;
        }
        return subpackage.sectionsDone
            .map(x => x.quantity)
            .reduce((a, b) => a + b, 1);
    }

    beforeAll() {
        if (this.filteredWeeks.length > 0) {
            this.filteredWeeks.forEach(newWeek => {
                newWeek.wPWeeksTP.forEach(newWeekTp => {
                    this.workProgram.weeks.filter(x => x.order == newWeek.order).forEach(oldWeek => {
                        var pack = oldWeek.wPWeeksTP.find(y => y.tPId == newWeekTp.tPId);
                        pack.programmed = newWeekTp.programmed;
                        newWeekTp.wPWeeksTPS.forEach(wPWeekTPS => {
                            pack.wPWeeksTPS.find(y => y.tPSId == wPWeekTPS.tPSId).programmed = wPWeekTPS.programmed;
                        })
                    });
                });
            });
        }
    }

    filterWeeks() {
        this.beforeAll();
        if (this.selectedTemplate == -1) {
            return;
        }
        this.filteredWeeks = this.workProgram.weeks;
        this.filteredWeeks = this.workProgram.weeks.map(week => {
            week = ServiceUtil.arrayCopy(week);
            week.wPWeeksTP = week.wPWeeksTP.filter(wPWeekTP => wPWeekTP.wPTemplate.templateId == this.workProgram.templates[this.selectedTemplate].templateId)
            return week;
        })
        this.sortAll();
    }

    sortAll() {
        this.sortPackagesFromTemplate();
        this.sortSubpackagesFromTemplate();
        this.sortWeeks();
        this.sortPackages();
        this.sortSubpackages();
    }

    sortPackagesFromTemplate() {
        // Sort packages from template
        this.workProgram.templates.forEach(template => {
            template.template.packages = template.template.packages.sort(function (a, b) {
                return a.packageOrder - b.packageOrder;
            })
        });
    }

    sortSubpackagesFromTemplate() {
        // Sort subpackages of template
        for (let i = 0; i < this.workProgram.templates[this.selectedTemplate].template.packages.length; i++) {
            this.workProgram.templates[this.selectedTemplate].template.packages[i].subpackages =
                this.workProgram.templates[this.selectedTemplate].template.packages[i].subpackages.sort((a, b) => {
                    if (a.order < b.order) {
                        return -1;
                    }

                    if (a.order > b.order) {
                        return 1;
                    }

                    return 0;
                })
        }
    }

    sortWeeks() {
        this.filteredWeeks = this.filteredWeeks.sort(function (a, b) {
            return a.order - b.order;
        })
    }

    sortPackages() {
        this.filteredWeeks.forEach(filteredWeek => {
            let ans = [];
            this.workProgram.templates[this.selectedTemplate].template.packages.forEach(pack => {
                filteredWeek.wPWeeksTP.forEach(wPWeekTP => {
                    if (wPWeekTP.tPId == pack.id) {
                        ans.push(wPWeekTP);
                    }
                })
            })
            filteredWeek.wPWeeksTP = ans;
        })
    }

    sortSubpackages() {
        for (let i = 0; i < this.filteredWeeks.length; i++) {
            for (let j = 0; j < this.filteredWeeks[i].wPWeeksTP.length; j++) {
                let ordered = [];
                for (let l = 0; l < this.workProgram.templates[this.selectedTemplate].template.packages[j].subpackages.length; l++) {
                    for (let k = 0; k < this.filteredWeeks[i].wPWeeksTP[j].wPWeeksTPS.length; k++) {
                        if (this.filteredWeeks[i].wPWeeksTP[j].wPWeeksTPS[k].tPSId == this.workProgram.templates[this.selectedTemplate].template.packages[j].subpackages[l].id) {
                            ordered.push(this.filteredWeeks[i].wPWeeksTP[j].wPWeeksTPS[k]);
                            break;
                        }
                    }
                }
                this.filteredWeeks[i].wPWeeksTP[j].wPWeeksTPS = ordered;
            }
        }
    }

    initValidations() {
        if (this.validations.length == 0) {
            for (let i = 1; i <= this.weeks.length; i++) {
                this.workProgram.templates.forEach(template => {
                    template.template.packages.forEach(pack => {
                        this.validations.push({
                            id: pack.id,
                            validReal: true,
                            validTotal: true,
                            weekNumber: i
                        })
                        pack.subpackages.forEach(subpack => {
                            this.validations.push({
                                id: subpack.id,
                                validReal: true,
                                validTotal: true,
                                weekNumber: i
                            })
                        })
                    })
                })
            }
        }
    }
    expand(p: number) {
        let packageTotal = this.calculatePackageTotal(this.filteredWeeks, p);
        let subpackageTotal = this.calculatePackageSubpackagesTotal(this.filteredWeeks, p);

        if (packageTotal == 0 && subpackageTotal == 0) {
            this.collapsable[p].expanded = !this.collapsable[p].expanded;
            return;
        }
        if (packageTotal == 0 && this.collapsable[p].expanded == false)
            this.collapsable[p].expanded = true;
        else if (subpackageTotal == 0 && this.collapsable[p].expanded == true) {
            this.collapsable[p].expanded = false;
        }
    }
    initCollapsable() {
        if (this.selectedTemplate == -1) {
            this.collapsable = [];
            return;
        }

        if (this.workProgram.weeks.length != 0) {
            this.filterWeeks();
        }

        this.collapsable = [];
        for (var i = 0; i < this.workProgram.templates[this.selectedTemplate].template.packages.length; i++) {

            this.collapsable.push({
                expanded: this.calculatePackageTotal(this.filteredWeeks, i) > 0 ? false : this.calculatePackageSubpackagesTotal(this.filteredWeeks, i) > 0 ? true : false,
                id: this.workProgram.templates[this.selectedTemplate].template.packages[
                    i
                ].id
            });
        }
        this.getCurrentTemplateSections();
    }

    expandPackage(templatePackageId: string) {
        if (this.selectedTemplate == -1) {
            return;
        }
        return this.collapsable.find(x => x.id == templatePackageId).expanded;
    }

    getCurrentTemplateSections() {
        if (this.selectedTemplate != -1)
            this.currentTemplateSections = this.sections.filter(section => section.sectionHouseTPS.some(sectionHouseTPS => sectionHouseTPS.tPS.templatePackage.templateId == this.workProgram.templates[this.selectedTemplate].templateId)).length;
    }

    calculateSubpackageReal(subpackageTPSId: string, initialDay, lastDay) {
        let sum = 0;
        this.sections.forEach(section => {
            section.sectionHouseTPS.forEach(sectionHouseTPS => {
                if (subpackageTPSId === sectionHouseTPS.tPSId && sectionHouseTPS.subpackageStatus > 1 && sectionHouseTPS.doneDate) {
                    let doneDate = moment(sectionHouseTPS.doneDate);
                    if (doneDate.isBetween(initialDay.toDate(), lastDay.toDate(), null, '[]')) {
                        sum++;
                    }
                }
            });
        });
        return sum;
    }
    calculatePackageReal(currentPackageId, initialDay, lastDay) {
        let sum = 0;
        this.sections.forEach(section => {
            let filteredTPS = section.sectionHouseTPS.filter(sectionHouseTPS => sectionHouseTPS.tPS.templatePackageId == currentPackageId);
            if (_.every(filteredTPS, sHouseTPS => (sHouseTPS.doneDate && sHouseTPS.subpackageStatus > 1) && moment(sHouseTPS.doneDate).isBetween(initialDay.toDate(), lastDay.toDate(), null, '[]')) && filteredTPS.length > 0) {
                sum++;
            }
        });
        return sum;
    }

    calculatePackageTotalReal(pack) {
        let sections = this.sections.filter(x => {
            let filteredTPS = x.sectionHouseTPS.filter(sectionHouseTPS => sectionHouseTPS.tPS.templatePackageId == pack.id);
            return _.every(filteredTPS, sHouseTPS => sHouseTPS.doneDate && sHouseTPS.subpackageStatus > 1) && filteredTPS.length > 0;
        });
        return sections.length;
    }

    calculateSubpackageTotalReal(subpack) {
        let sections = this.sections.filter(x => x.sectionHouseTPS.some(sectionHouseTPS => sectionHouseTPS.tPSId == subpack.id && sectionHouseTPS.subpackageStatus > 1 && sectionHouseTPS.doneDate));
        return sections.length;
    }

    getMonthFromNum(num) {
        switch (num) {
            case 0:
                return "Ene";
            case 1:
                return "Feb";
            case 2:
                return "Mar";
            case 3:
                return "Abr";
            case 4:
                return "May";
            case 5:
                return "Jun";
            case 6:
                return "Jul";
            case 7:
                return "Ago";
            case 8:
                return "Sep";
            case 9:
                return "Oct";
            case 10:
                return "Nov";
            case 11:
                return "Dic";
            default:
                return "";
        }
    }

    calculatePackageTotal(workProgramWeeks, currentPackagePos) {
        var total = 0;
        for (var x = 0; x < workProgramWeeks.length; x++) {
            total += this.getQuantity(workProgramWeeks[x].wPWeeksTP[currentPackagePos].programmed);
        }
        return total;
    }

    calculateSubpackageTotal(workProgramWeeks, currentPackage, currentSubpackage) {
        var total = 0;
        for (var x = 0; x < workProgramWeeks.length; x++) {
            for (var y = 0; y < workProgramWeeks[x].wPWeeksTP[currentPackage].wPWeeksTPS.length; y++) {
                if (y == currentSubpackage) {
                    total += this.getQuantity(workProgramWeeks[x].wPWeeksTP[currentPackage].wPWeeksTPS[y].programmed);
                }
            }
        }
        return total;
    }

    calculatePastPackageValues(w, s) {
        if (w == 0) {
            return this.getQuantity(this.filteredWeeks[w].wPWeeksTP[s].programmed);
        }
        return this.getQuantity(this.filteredWeeks[w].wPWeeksTP[s].programmed) + this.calculatePastPackageValues(w - 1, s);
    }
    calculatePastSubpackageValues(w, s, x) {
        if (w == 0) {
            return this.getQuantity(this.filteredWeeks[w].wPWeeksTP[s].wPWeeksTPS[x].programmed);
        }
        return this.getQuantity(this.filteredWeeks[w].wPWeeksTP[s].wPWeeksTPS[x].programmed) + this.calculatePastSubpackageValues(w - 1, s, x);
    }
    calculatePackageSubpackagesTotal(workProgramWeeks, currentPackage) {
        var total = 0;
        for (var x = 0; x < workProgramWeeks.length; x++) {
            for (var y = 0; y < workProgramWeeks[x].wPWeeksTP[currentPackage].wPWeeksTPS.length; y++) {
                total += this.getQuantity(workProgramWeeks[x].wPWeeksTP[currentPackage].wPWeeksTPS[y].programmed);
            }
        }
        return total;
    }

    blockPackage(workProgramWeeks, packageId) {
        for (var x = 0; x < workProgramWeeks.length; x++) {
            for (var y = 0; y < workProgramWeeks[x].wPWeeksTP.length; y++) {
                for (var z = 0; z < workProgramWeeks[x].wPWeeksTP[y].wPWeeksTPS.length; z++) {
                    if (workProgramWeeks[x].wPWeeksTP[y].tPId == packageId) {
                        if (this.getQuantity(workProgramWeeks[x].wPWeeksTP[y].wPWeeksTPS[z].programmed) != 0) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
    formatName(name: string) {
        return name.length > 31 ? name.slice(0, 29) + '...' : name;
    }

    getQuantity(n: number) {
        return n ? n : 0;
    }

}
