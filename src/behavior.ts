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

module powerbi.extensibility.visual {
    // d3
    import Selection = d3.Selection;

    // powerbi.extensibility.utils.interactivity
    import ISelectionHandler = powerbi.extensibility.utils.interactivity.ISelectionHandler;
    import SelectableDataPoint = powerbi.extensibility.utils.interactivity.SelectableDataPoint;
    import IInteractiveBehavior = powerbi.extensibility.utils.interactivity.IInteractiveBehavior;
    import registerStandardSelectionHandler = powerbi.extensibility.utils.interactivity.interactivityUtils.registerStandardSelectionHandler;

    export interface CustomVisualBehaviorOptions {
        layerOptions: any[];
        clearCatcher: Selection<any>;
    }

    export class CustomVisualBehavior implements IInteractiveBehavior {
        private behaviors: IInteractiveBehavior[];

        constructor(behaviors: IInteractiveBehavior[]) {
            this.behaviors = behaviors || [];
        }

        public bindEvents(options: CustomVisualBehaviorOptions, selectionHandler: ISelectionHandler): void {
            this.behaviors.forEach((behavior: IInteractiveBehavior, index: number) => {
                behavior.bindEvents(options.layerOptions[index], selectionHandler);
            });

            options.clearCatcher.on("click", () => {
                selectionHandler.handleClearSelection();
            });
        }

        public renderSelection(hasSelection: boolean) {
            for (let behavior of this.behaviors) {
                behavior.renderSelection(hasSelection);
            }
        }
    }

    export interface EnhancedScatterBehaviorOptions {
        dataPointsSelection: Selection<SelectableDataPoint>;
        data: EnhancedScatterChartData;
        plotContext: Selection<any>;
    }

    export class EnhancedScatterChartWebBehavior implements IInteractiveBehavior {
        private static MinOpacity: number = 0;
        private static MaxOpacity: number = 1;

        private dimmedBubbleOpacity: number;
        private defaultBubbleOpacity: number;

        private bubbles: Selection<any>;
        private shouldEnableFill: boolean;
        private colorBorder: boolean;

        constructor(dimmedBubbleOpacity: number, defaultBubbleOpacity: number) {
            this.dimmedBubbleOpacity = dimmedBubbleOpacity;
            this.defaultBubbleOpacity = defaultBubbleOpacity;
        }

        public bindEvents(options: EnhancedScatterBehaviorOptions, selectionHandler: ISelectionHandler): void {
            const data: EnhancedScatterChartData = options.data;

            this.bubbles = options.dataPointsSelection;

            this.shouldEnableFill = (!data.sizeRange || !data.sizeRange.min) && data.fillPoint;
            this.colorBorder = data.colorBorder;

            registerStandardSelectionHandler(this.bubbles, selectionHandler);
        }

        public renderSelection(hasSelection: boolean) {
            const shouldEnableFill: boolean = this.shouldEnableFill,
                colorBorder: boolean = this.colorBorder;

            this.bubbles.style("fill-opacity", (dataPoint: EnhancedScatterChartDataPoint) => {
                return this.getMarkerFillOpacity(
                    dataPoint.size != null,
                    shouldEnableFill,
                    hasSelection,
                    dataPoint.selected);
            });

            this.bubbles.style("stroke-opacity", (dataPoint: EnhancedScatterChartDataPoint) => {
                return this.getMarkerStrokeOpacity(
                    dataPoint.size != null,
                    colorBorder,
                    hasSelection,
                    dataPoint.selected);
            });
        }

        private getMarkerFillOpacity(
            hasSize: boolean,
            shouldEnableFill: boolean,
            hasSelection: boolean,
            isSelected: boolean): number {

            if (hasSize || shouldEnableFill) {
                if (hasSelection && !isSelected) {
                    return this.dimmedBubbleOpacity;
                }

                return this.defaultBubbleOpacity;
            }

            return EnhancedScatterChartWebBehavior.MinOpacity;
        }

        public getMarkerStrokeOpacity(
            hasSize: boolean,
            colorBorder: boolean,
            hasSelection: boolean,
            isSelected: boolean): number {

            if (hasSize && colorBorder) {
                return EnhancedScatterChartWebBehavior.MaxOpacity;
            }

            if (hasSelection && !isSelected) {
                return this.dimmedBubbleOpacity;
            }

            return this.defaultBubbleOpacity;
        }
    }
}
