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

import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;

// powerbi.extensibility.utils.test
import { VisualBuilderBase } from "powerbi-visuals-utils-testutils";

// EnhancedScatterChart1443994985041
import { EnhancedScatterChart as VisualClass } from "../src/EnhancedScatterChart";

export class EnhancedScatterChartBuilder extends VisualBuilderBase<VisualClass> {
    constructor(width: number, height: number) {
        super(width, height, "EnhancedScatterChart1443994985041");
    }

    protected build(options: VisualConstructorOptions) {
        return new VisualClass(options);
    }

    public get instance(): VisualClass {
        return this.visual;
    }

    public get mainElement(): JQuery {
        return this.element.find(".enhancedScatterChart");
    }

    public get axisGraphicsContext(): JQuery {
        return this.mainElement.children(".axisGraphicsContext");
    }

    public get backdropImage(): JQuery {
        return this.axisGraphicsContext.children("image");
    }

    public get xAxis(): JQuery {
        return this.axisGraphicsContext.children("g.x.axis");
    }

    public get xAxisTicks(): JQuery {
        return this.xAxis.children("g.tick");
    }

    public get xAxisLabel(): JQuery {
        return this.axisGraphicsContext.children(".xAxisLabel");
    }

    public get yAxis(): JQuery {
        return this.svgScrollableAxisGraphicsContext.children("g.y.axis");
    }

    public get yAxisTicks(): JQuery {
        return this.yAxis.children("g.tick");
    }

    public get yAxisLabel(): JQuery {
        return this.axisGraphicsContext.children(".yAxisLabel");
    }

    public get svgScrollableAxisGraphicsContext(): JQuery {
        return this.mainElement
            .children(".svgScrollable")
            .children(".axisGraphicsContext");
    }

    public get mainGraphicsContext(): JQuery {
        return this.svgScrollableAxisGraphicsContext
            .children(".mainGraphicsContext");
    }

    public get dataLabels(): JQuery {
        return this.mainGraphicsContext
            .children(".labels");
    }

    public get dataLabelsText(): JQuery {
        return this.dataLabels
            .children("text.data-labels");
    }

    public get crosshair(): JQuery {
        return this.mainGraphicsContext
            .children("svg")
            .children("g.crosshairCanvas");
    }

    public get dots(): JQuery {
        return this.mainGraphicsContext
            .children("svg")
            .children("g.ScatterMarkers")
            .children("path.dot");
    }

    public get images(): JQuery {
        return this.mainGraphicsContext
            .children("svg")
            .children("g.ScatterMarkers")
            .children("image.img");
    }

    public get legendGroup(): JQuery {
        return this.element
            .children(".legend")
            .children("#legendGroup");
    }

    public get legendTitle(): JQuery {
        return this.legendGroup.children(".legendTitle");
    }

    public get legendItemText(): JQuery {
        return this.legendGroup
            .children(".legendItem")
            .children("text.legendText");
    }
}
