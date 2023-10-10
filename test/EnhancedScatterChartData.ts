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

import lodashRange from "lodash.range";

import powerbi from "powerbi-visuals-api";
import DataView = powerbi.DataView;
import ValueTypeDescriptor = powerbi.ValueTypeDescriptor;

// powerbi.extensibility.visual
import { EnhancedScatterChart } from "../src/EnhancedScatterChart";

// powerbi.extensibility.utils.type
import { valueType } from "powerbi-visuals-utils-typeutils";
import ValueType = valueType.ValueType;

// powerbi.extensibility.utils.test
import { testDataViewBuilder, getRandomNumbers, getRandomNumber } from "powerbi-visuals-utils-testutils";
import TestDataViewBuilder = testDataViewBuilder.TestDataViewBuilder;

export class EnhancedScatterChartData extends TestDataViewBuilder {
    private static NumberFormatWithPrecision: string = "#,0.00";
    private static NumberFormatWithoutPrecision: string = "#,0";

    public static ColumnCategory: string = EnhancedScatterChart.ColumnCategory;
    public static ColumnSeries: string = EnhancedScatterChart.ColumnSeries;
    public static ColumnX: string = EnhancedScatterChart.ColumnX;
    public static ColumnY: string = EnhancedScatterChart.ColumnY;
    public static ColumnSize: string = EnhancedScatterChart.ColumnSize;
    public static ColumnColorFill: string = EnhancedScatterChart.ColumnColorFill;
    public static ColumnShape: string = EnhancedScatterChart.ColumnShape;
    public static ColumnImage: string = EnhancedScatterChart.ColumnImage;
    public static ColumnBackdrop: string = EnhancedScatterChart.ColumnBackdrop;
    public static ColumnRotation: string = EnhancedScatterChart.ColumnRotation;

    public XColumnTypeOverload: ValueTypeDescriptor;
    public YColumnTypeOverload: ValueTypeDescriptor;

    public static DefaultSetOfColumns: string[] = [
        EnhancedScatterChartData.ColumnCategory,
        EnhancedScatterChartData.ColumnSeries,
        EnhancedScatterChartData.ColumnX,
        EnhancedScatterChartData.ColumnY,
        EnhancedScatterChartData.ColumnSize
    ];

    public valuesCategory: Date[] = EnhancedScatterChartData.getDateYearRange(
        new Date(2016, 0, 1),
        new Date(2019, 0, 10),
        1);

    public valuesSeries: string[] = [
        "Access",
        "OneNote",
        "Outlook"
    ];

    public valuesX: number[] = getRandomNumbers(this.valuesCategory.length, 100, 1000);
    public valuesY: number[] = getRandomNumbers(this.valuesCategory.length, 100, 1000);
    public valuesSize: number[] = getRandomNumbers(this.valuesCategory.length, 10, 20);

    public colorValues: string[] = ["#ff0000", "#008000", "#0000ff"];

    public shapeValues: number[] | string[] = [];

    public imageValues: string[] = [
        "Microsoft_Access.png",
        "Microsoft_OneNote.png",
        "Microsoft_Outlook.png"
    ];

    public rotationValues: number[] = getRandomNumbers(this.valuesCategory.length, 100, 1000);

    public static getDateYearRange(start: Date, stop: Date, yearStep: number): Date[] {
        return lodashRange(start.getFullYear(), stop.getFullYear(), yearStep)
            .map(x => new Date(new Date(start.getTime()).setFullYear(x)));
    }

    public generateHightLightedValues(length: number, hightlightedElementNumber?: number): number[] {
        let array: any[] = [];
        for (let i: number = 0; i < length; i++) {
            array[i] = null;
        }
        if (hightlightedElementNumber == undefined)
            return array;

        if (hightlightedElementNumber >= length || hightlightedElementNumber < 0) {
            array[0] = getRandomNumbers(this.valuesCategory.length, 10, 100)[0];
        } else {
            array[hightlightedElementNumber] = getRandomNumbers(this.valuesCategory.length, 10, 100)[0];
        }

        return array;
    }

    public getDataView(columnNames: string[] = EnhancedScatterChartData.DefaultSetOfColumns, withHighlights: boolean = false): DataView {
        const hightlightedElementNumber: number = Math.round(getRandomNumber(0, this.valuesCategory.length - 1));
        const highlightedValuesCount: number = this.valuesCategory.length;

        let column1Highlight: number[] = [];
        let column2Highlight: number[] = [];
        let column3Highlight: number[] = [];
        let column4Highlight: number[] = [];
        let column5Highlight: number[] = [];

        if (withHighlights)
        {
            column1Highlight = this.generateHightLightedValues(highlightedValuesCount, hightlightedElementNumber);
            column2Highlight = this.generateHightLightedValues(highlightedValuesCount, hightlightedElementNumber);
            column3Highlight = this.generateHightLightedValues(highlightedValuesCount, hightlightedElementNumber);
            column4Highlight = this.generateHightLightedValues(highlightedValuesCount, hightlightedElementNumber);
            column5Highlight = this.generateHightLightedValues(highlightedValuesCount, hightlightedElementNumber);
        }

        return this.createCategoricalDataViewBuilder([
            {
                source: {
                    displayName: EnhancedScatterChartData.ColumnCategory,
                    roles: { [EnhancedScatterChartData.ColumnCategory]: true },
                    type: ValueType.fromDescriptor({ dateTime: true })
                },
                values: this.valuesCategory
            },
            {
                isGroup: true,
                source: {
                    displayName: EnhancedScatterChartData.ColumnSeries,
                    roles: { [EnhancedScatterChartData.ColumnSeries]: true },
                    type: ValueType.fromDescriptor({ text: true })
                },
                values: this.valuesSeries,
            },
            {
                source: {
                    displayName: EnhancedScatterChartData.ColumnColorFill,
                    roles: { [EnhancedScatterChartData.ColumnColorFill]: true },
                    type: ValueType.fromDescriptor({ text: true })
                },
                values: this.colorValues
            },
            {
                source: {
                    displayName: EnhancedScatterChartData.ColumnImage,
                    roles: { [EnhancedScatterChartData.ColumnImage]: true },
                    type: ValueType.fromDescriptor({ text: true })
                },
                values: this.imageValues
            },
            {
                source: {
                    displayName: EnhancedScatterChartData.ColumnBackdrop,
                    roles: { [EnhancedScatterChartData.ColumnBackdrop]: true },
                    type: ValueType.fromDescriptor({ text: true })
                },
                values: this.imageValues
            }
        ], [
                {
                    source: {
                        displayName: EnhancedScatterChartData.ColumnX,
                        format: EnhancedScatterChartData.NumberFormatWithPrecision,
                        isMeasure: true,
                        roles: { [EnhancedScatterChartData.ColumnX]: true },
                        ...(
                            this.XColumnTypeOverload
                                ? { type: ValueType.fromDescriptor(this.XColumnTypeOverload) }
                                : {}
                        )
                    },
                    values: this.valuesX,
                    highlights: column1Highlight.length > 0 ? column1Highlight : undefined
                },
                {
                    source: {
                        displayName: EnhancedScatterChartData.ColumnY,
                        format: EnhancedScatterChartData.NumberFormatWithoutPrecision,
                        isMeasure: true,
                        roles: { [EnhancedScatterChartData.ColumnY]: true },
                        ...(
                            this.YColumnTypeOverload
                                ? { type: ValueType.fromDescriptor(this.YColumnTypeOverload) }
                                : {}
                        )
                    },
                    values: this.valuesY,
                    highlights: column2Highlight.length > 0 ? column2Highlight : undefined
                },
                {
                    source: {
                        displayName: EnhancedScatterChartData.ColumnSize,
                        format: EnhancedScatterChartData.NumberFormatWithoutPrecision,
                        isMeasure: true,
                        roles: { [EnhancedScatterChartData.ColumnSize]: true }
                    },
                    values: this.valuesSize,
                    highlights: column3Highlight.length > 0 ? column3Highlight : undefined
                },
                {
                    source: {
                        displayName: EnhancedScatterChartData.ColumnRotation,
                        format: EnhancedScatterChartData.NumberFormatWithoutPrecision,
                        isMeasure: true,
                        roles: { [EnhancedScatterChartData.ColumnRotation]: true },
                    },
                    values: this.rotationValues,
                    highlights: column4Highlight.length > 0 ? column4Highlight : undefined
                },
                {
                    source: {
                        displayName: EnhancedScatterChartData.ColumnShape,
                        format: EnhancedScatterChartData.NumberFormatWithoutPrecision,
                        isMeasure: true,
                        roles: { [EnhancedScatterChartData.ColumnShape]: true },
                    },
                    values: this.shapeValues,
                    highlights: column5Highlight.length > 0 ? column5Highlight : undefined
                }
            ], columnNames).build();
    }
}
