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
import powerbiVisualsApi from "powerbi-visuals-api";

import IViewport = powerbiVisualsApi.IViewport;
import DataViewMetadataColumn = powerbiVisualsApi.DataViewMetadataColumn;
import DataViewValueColumn = powerbiVisualsApi.DataViewValueColumn;
import NumberRange = powerbiVisualsApi.NumberRange;

// powerbi.visuals
import ISelectionId = powerbiVisualsApi.visuals.ISelectionId;

// powerbi.extensibility.utils.interactivity
import { interactivitySelectionService as interactivityService } from "powerbi-visuals-utils-interactivityutils";
import SelectableDataPoint = interactivityService.SelectableDataPoint;

// powerbi.extensibility.utils.tooltip
import { TooltipEnabledDataPoint } from "powerbi-visuals-utils-tooltiputils";

// powerbi.extensibility.utils.chart
import { legendInterfaces } from "powerbi-visuals-utils-chartutils";
import LegendDataPoint = legendInterfaces.LegendDataPoint;

// powerbi.extensibility.utils.svg
import * as SVGUtil from "powerbi-visuals-utils-svgutils";
import IMargin = SVGUtil.IMargin;
import IRect = SVGUtil.IRect;
import ISize = SVGUtil.shapesInterfaces.ISize;

import { Settings } from "./settings";

export interface ElementProperty {
    [propertyName: string]: any;
}

export interface ElementProperties {
    name: string;
    selector: string;
    className?: string;
    data?: any;
    styles?: ElementProperty;
    attributes?: ElementProperty;
}

export interface EnhancedScatterChartMeasureMetadataIndexes {
    category?: number;
    x?: number;
    y?: number;
    size?: number;
    colorFill?: number;
    shape?: number;
    image?: number;
    rotation?: number;
    backdrop?: number;
    xStart?: number;
    xEnd?: number;
    yStart?: number;
    yEnd?: number;
}

export interface EnhancedScatterChartMeasureMetadataColumns {
    x?: DataViewMetadataColumn;
    y?: DataViewMetadataColumn;
    size?: DataViewMetadataColumn;
}

export interface EnhancedScatterChartMeasureMetadata {
    idx: EnhancedScatterChartMeasureMetadataIndexes;
    cols: EnhancedScatterChartMeasureMetadataColumns;
    axesLabels: ChartAxesLabels;
}

export interface ChartAxesLabels {
    x: string;
    y: string;
    y2?: string;
}

export interface EnhancedScatterChartRadiusData {
    sizeMeasure: DataViewValueColumn;
    index: number;
}

// Defines possible content positions.
export const enum ContentPositions {

    // Content position is not defined.
    None = 0,

    // Content aligned top left.
    TopLeft = 1,

    // Content aligned top center.
    TopCenter = 2,

    // Content aligned top right.
    TopRight = 4,

    // Content aligned middle left.
    MiddleLeft = 8,

    // Content aligned middle center.
    MiddleCenter = 16,

    // Content aligned middle right.
    MiddleRight = 32,

    // Content aligned bottom left.
    BottomLeft = 64,

    // Content aligned bottom center.
    BottomCenter = 128,

    // Content aligned bottom right.
    BottomRight = 256,

    // Content is placed inside the bounding rectangle in the center.
    InsideCenter = 512,

    // Content is placed inside the bounding rectangle at the base.
    InsideBase = 1024,

    // Content is placed inside the bounding rectangle at the end.
    InsideEnd = 2048,

    // Content is placed outside the bounding rectangle at the base.
    OutsideBase = 4096,

    // Content is placed outside the bounding rectangle at the end.
    OutsideEnd = 8192,

    // Content supports all possible positions.
    All =
    TopLeft |
    TopCenter |
    TopRight |
    MiddleLeft |
    MiddleCenter |
    MiddleRight |
    BottomLeft |
    BottomCenter |
    BottomRight |
    InsideCenter |
    InsideBase |
    InsideEnd |
    OutsideBase |
    OutsideEnd,
}

export interface EnhancedScatterChartDataPoint extends
    SelectableDataPoint,
    TooltipEnabledDataPoint {

    x: any;
    y: any;
    size: number | ISize;
    radius: EnhancedScatterChartRadiusData;
    fill: string;
    stroke: string;
    strokeWidth: number;
    contentPosition: ContentPositions;
    formattedCategory: () => string;
    svgurl?: string;
    shapeSymbolType?: (value: number) => string;
    rotation: number;
    backdrop?: string;
    xStart?: number;
    xEnd?: number;
    yStart?: number;
    yEnd?: number;
    highlight?: boolean;
}

export interface EnhancedScatterChartAxesLabels {
    x: string;
    y: string;
    y2?: string;
}

export interface EnhancedScatterChartData {
    useShape: boolean;
    useCustomColor: boolean;
    xCol: DataViewMetadataColumn;
    yCol: DataViewMetadataColumn;
    dataPoints: EnhancedScatterChartDataPoint[];
    legendDataPoints: LegendDataPoint[];
    axesLabels: EnhancedScatterChartAxesLabels;
    size?: DataViewMetadataColumn;
    sizeRange: NumberRange;
    hasDynamicSeries?: boolean;
    hasGradientRole?: boolean;
    colorBorder?: boolean;
    colorByCategory?: boolean;
    selectedIds: ISelectionId[];
    settings: Settings;
}

export interface EnhancedScatterDataRange {
    minRange: number;
    maxRange: number;
    delta: number;
}

export interface CalculateScaleAndDomainOptions {
    viewport: IViewport;
    margin: IMargin;
    showCategoryAxisLabel: boolean;
    showValueAxisLabel: boolean;
    forceMerge: boolean;
    categoryAxisScaleType: string;
    valueAxisScaleType: string;
    trimOrdinalDataOnOverflow: boolean;
    // optional
    playAxisControlLayout?: IRect;
    forcedTickCount?: number;
    forcedYDomain?: any[];
    forcedXDomain?: any[];
    ensureXDomain?: NumberRange;
    ensureYDomain?: NumberRange;
    categoryAxisDisplayUnits?: number;
    categoryAxisPrecision?: number;
    valueAxisDisplayUnits?: number;
    valueAxisPrecision?: number;
}
