// /*
// *  Power BI Visualizations
// *
// *  Copyright (c) Microsoft Corporation
// *  All rights reserved.
// *  MIT License
// *
// *  Permission is hereby granted, free of charge, to any person obtaining a copy
// *  of this software and associated documentation files (the ""Software""), to deal
// *  in the Software without restriction, including without limitation the rights
// *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// *  copies of the Software, and to permit persons to whom the Software is
// *  furnished to do so, subject to the following conditions:
// *
// *  The above copyright notice and this permission notice shall be included in
// *  all copies or substantial portions of the Software.
// *
// *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// *  THE SOFTWARE.
// */
// // powerbi.extensibility.utils.interactivity
// import { interactivityBaseService as interactivityService, interactivitySelectionService } from "powerbi-visuals-utils-interactivityutils";
// import IBehaviorOptions = interactivityService.IBehaviorOptions;
// import IInteractiveBehavior = interactivityService.IInteractiveBehavior;
// import ISelectionHandler = interactivityService.ISelectionHandler;
// import BaseDataPoint = interactivityService.BaseDataPoint;
// import SelectableDataPoint = interactivitySelectionService.SelectableDataPoint;

// import { Selection } from "d3-selection";

// const getEvent = () => require("d3-selection").event;

// export interface BaseBehaviorOptions<SelectableDataPointType extends BaseDataPoint> extends IBehaviorOptions<SelectableDataPointType> {
//     elementsSelection: Selection<any, SelectableDataPoint, any, any>;
//     clearCatcherSelection: d3.Selection<any, any, any, any>;
// }

// export class BaseBehavior<SelectableDataPointType extends BaseDataPoint> implements IInteractiveBehavior {
//     protected options: BaseBehaviorOptions<SelectableDataPointType>;
//     protected selectionHandler: ISelectionHandler;

//     protected bindClick() {
//         const {
//             elementsSelection
//         } = this.options;

//         elementsSelection.on("click", (datum) => {
//             const mouseEvent: MouseEvent = getEvent() as MouseEvent || window.event as MouseEvent;
//             mouseEvent && this.selectionHandler.handleSelection(
//                 datum,
//                 mouseEvent.ctrlKey);
//         });

//     }

//     protected bindClearCatcher() {
//         const {
//             clearCatcherSelection
//         } = this.options;
//         clearCatcherSelection.on("click", () => {
//             const mouseEvent: MouseEvent = getEvent() as MouseEvent || window.event as MouseEvent;

//             if (mouseEvent && mouseEvent.ctrlKey) {
//                 return;
//             }

//             mouseEvent && mouseEvent.preventDefault();
//         });
//     }

//     protected bindContextMenu() {
//         const {
//             elementsSelection
//         } = this.options;

//         elementsSelection.on("contextmenu", (datum) => {
//             const event: MouseEvent = (getEvent() as MouseEvent) || window.event as MouseEvent;
//             if (event) {
//                 this.selectionHandler.handleContextMenu(
//                     datum,
//                     {
//                         x: event.clientX,
//                         y: event.clientY
//                     });
//                 event.preventDefault();
//                 event.stopPropagation();
//             }
//         });
//     }

//     protected bindContextMenuToClearCatcher() {
//         const {
//             clearCatcherSelection
//         } = this.options;

//         const emptySelection = {
//             "measures": [],
//             "dataMap": {
//             }
//         }

//         clearCatcherSelection.on("contextmenu", () => {
//             const event: MouseEvent = (getEvent() as MouseEvent) || window.event as MouseEvent;
//             if (event) {
//                 this.selectionHandler.handleContextMenu(
//                     <any>{
//                         identity: emptySelection
//                     },
//                     {
//                         x: event.clientX,
//                         y: event.clientY
//                     });
//                 event.preventDefault();
//                 event.stopPropagation();
//             }
//         });
//     }

//     public bindEvents(
//         options: BaseBehaviorOptions<SelectableDataPointType>,
//         selectionHandler: ISelectionHandler): void {

//         this.options = options;
//         this.selectionHandler = selectionHandler;

//         this.bindClick();
//         this.bindClearCatcher();
//         this.bindContextMenu();
//         this.bindContextMenuToClearCatcher();
//     }

//     public renderSelection(hasSelection: boolean): void {
//         if (hasSelection) {
//             this.options.elementsSelection.style("opacity", (category: any) => {
//                 if (category.selected) {
//                     return 0.5;
//                 } else {
//                     return 1;
//                 }
//             });
//         } else {
//             this.options.elementsSelection.style(
//                 "opacity", (category: any) => {
//                     return 1;
//                 }
//             );
//         }
//     }
// }