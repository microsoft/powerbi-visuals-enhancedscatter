/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */
import { Selection as d3Selection, select as d3Select } from "d3-selection";
type Selection<T1, T2 = T1> = d3Selection<any, T1, any, T2>;

// powerbi.extensibility.utils.interactivity
import { interactivityBaseService as interactivityService, interactivityUtils } from "powerbi-visuals-utils-interactivityutils";
import IInteractiveBehavior = interactivityService.IInteractiveBehavior;
import IInteractivityService = interactivityService.IInteractivityService;
import ISelectionHandler = interactivityService.ISelectionHandler;
import registerStandardSelectionHandler = interactivityUtils.registerStandardSelectionHandler;
import BaseDataPoint = interactivityService.BaseDataPoint;
import IBehaviorOptions = interactivityService.IBehaviorOptions;

import { EnhancedScatterChartDataPoint } from "./dataInterfaces";

export interface BehaviorOptions extends IBehaviorOptions<BaseDataPoint> {
    clearCatcher: Selection<any>;
    dataPointsSelection: Selection<EnhancedScatterChartDataPoint>;
    interactivityService: IInteractivityService<BaseDataPoint>;
}

const EnterCode: string = "Enter";
const SpaceCode: string = "Space";

export const DefaultOpacity: number = 0.85;
export const DimmedOpacity: number = 0.4;

export function getFillOpacity(
    selected: boolean,
    highlight: boolean,
    hasSelection: boolean,
    hasPartialHighlights: boolean
): number {
    if ((hasPartialHighlights && !highlight) || (hasSelection && !selected)) {
        return DimmedOpacity;
    }

    return DefaultOpacity;
}

export class VisualBehavior implements IInteractiveBehavior {
    private options: BehaviorOptions;
    private selectionHandler: ISelectionHandler;

    public bindEvents(options: BehaviorOptions, selectionHandler: ISelectionHandler): void {
        this.options = options;
        this.selectionHandler = selectionHandler;

        const {
            dataPointsSelection,
        } = options;

        registerStandardSelectionHandler(dataPointsSelection, selectionHandler);

        options.clearCatcher.on("click", () => {
            selectionHandler.handleClearSelection();
        });

        this.bindKeyboardEventToDataPoints();
        this.bindContextMenu();
    }

    public renderSelection(hasHighlights: boolean) {
        const {
            dataPointsSelection,
            interactivityService,
        } = this.options;

        const hasSelection: boolean = interactivityService.hasSelection();

        dataPointsSelection.style("opacity", (dataPoint: EnhancedScatterChartDataPoint) => {
            return getFillOpacity(
                dataPoint.selected,
                dataPoint.highlight,
                !dataPoint.highlight && hasHighlights,
                !dataPoint.selected && hasSelection
            );
        });
    }

    private bindKeyboardEventToDataPoints(): void {
        this.options.dataPointsSelection.on("keydown", (event: KeyboardEvent, dataPoint: EnhancedScatterChartDataPoint) => {
            if (event.code !== EnterCode && event.code !== SpaceCode) {
                return;
            }
            this.selectionHandler.handleSelection(dataPoint, event.ctrlKey || event.metaKey);
        });
    }

    private bindContextMenu(): void {
        this.options.dataPointsSelection.on("contextmenu", (event: PointerEvent, dataPoint: EnhancedScatterChartDataPoint) => {
            if (event) {
                this.selectionHandler.handleContextMenu(
                    dataPoint,
                    {
                        x: event.clientX,
                        y: event.clientY
                    });
                event.preventDefault();
            }
        });

        this.options.clearCatcher.on("contextmenu", (event: PointerEvent) => {
            if (event) {
                this.selectionHandler.handleContextMenu(
                    null,
                    {
                        x: event.clientX,
                        y: event.clientY
                    });
                event.preventDefault();
            }
        });
    }
}
