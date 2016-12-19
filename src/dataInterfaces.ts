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

    interface EnhancedScatterChartMeasureMetadataIndexes {
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

    interface EnhancedScatterChartMeasureMetadataColumns {
        x?: DataViewMetadataColumn;
        y?: DataViewMetadataColumn;
        size?: DataViewMetadataColumn;
    }

    interface EnhancedScatterChartMeasureMetadata {
        idx: EnhancedScatterChartMeasureMetadataIndexes;
        cols: EnhancedScatterChartMeasureMetadataColumns;
        axesLabels: ChartAxesLabels;
    }

    export interface EnhancedScatterChartRadiusData {
        sizeMeasure: DataViewValueColumn;
        index: number;
    }

    export interface EnhancedScatterChartDataPoint extends
        SelectableDataPoint,
        TooltipEnabledDataPoint {

        x: any;
        y: any;
        size: number | ISize;
        radius: EnhancedScatterChartRadiusData;
        fill: string;
        labelFill?: string;
        labelFontSize: any;
        contentPosition: ContentPositions;
        formattedCategory: Lazy<string>;
        colorFill?: string;
        svgurl?: string;
        shapeSymbolType?: (number) => string;
        rotation: number;
        backdrop?: string;
        xStart?: number;
        xEnd?: number;
        yStart?: number;
        yEnd?: number;
    }

    export interface EnhancedScatterChartBackdrop {
        show: boolean;
        url: string;
    }

    export interface EnhancedScatterChartAxesLabels {
        x: string;
        y: string;
        y2?: string;
    }

    export interface EnhancedScatterChartData {
        useShape: boolean;
        useCustomColor: boolean;
        backdrop?: EnhancedScatterChartBackdrop;
        outline?: boolean;
        crosshair?: boolean;
        xCol: DataViewMetadataColumn;
        yCol: DataViewMetadataColumn;
        dataPoints: EnhancedScatterChartDataPoint[];
        legendData: LegendData;
        axesLabels: EnhancedScatterChartAxesLabels;
        size?: DataViewMetadataColumn;
        sizeRange: NumberRange;
        dataLabelsSettings: PointDataLabelsSettings;
        defaultDataPointColor?: string;
        showAllDataPoints?: boolean;
        hasDynamicSeries?: boolean;
        fillPoint?: boolean;
        colorBorder?: boolean;
        colorByCategory?: boolean;
        selectedIds: SelectionId[];
    }

    export interface EnhancedScatterDataRange {
        minRange: number;
        maxRange: number;
        delta: number;
    }

    export interface EnhancedScatterChartProperty {
        [properyName: string]: DataViewObjectPropertyIdentifier;
    }

    export interface EnhancedScatterChartProperties {
        [properyName: string]: EnhancedScatterChartProperty;
    }
}
