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

/// <reference path="_references.ts"/>

module powerbi.extensibility.visual.test {
    // powerbi.extensibility.visual
    import EnhancedScatterChart = powerbi.extensibility.visual.EnhancedScatterChart1443994985041.EnhancedScatterChart;

    // powerbi.extensibility.utils.type
    import ValueType = powerbi.extensibility.utils.type.ValueType;

    // powerbi.extensibility.utils.test
    import getRandomNumbers = powerbi.extensibility.utils.test.helpers.getRandomNumbers;
    import TestDataViewBuilder = powerbi.extensibility.utils.test.dataViewBuilder.TestDataViewBuilder;

    export class EnhancedScatterChartData extends TestDataViewBuilder {
        private static NumberFormatWithPrecision: string = "#,0.00";
        private static NumberFormatWithoutPrecision: string = "#,0";

        public static ColumnCategory: string = EnhancedScatterChart.ColumnCategory;
        public static ColumnSeries: string = EnhancedScatterChart.ColumnSeries;
        public static ColumnX: string = EnhancedScatterChart.ColumnX;
        public static ColumnY: string = EnhancedScatterChart.ColumnY;
        public static ColumnSize: string = EnhancedScatterChart.ColumnSize;
        public static ColumnColorFill: string = EnhancedScatterChart.ColumnColorFill;
        public static ColumnImage: string = EnhancedScatterChart.ColumnImage;
        public static ColumnBackdrop: string = EnhancedScatterChart.ColumnBackdrop;
        public static ColumnRotation: string = EnhancedScatterChart.ColumnRotation;

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

        public colorValues: string[] = ["red", "green", "blue"];

        public imageValues: string[] = [
            "Microsoft_Access.png",
            "Microsoft_OneNote.png",
            "Microsoft_Outlook.png"
        ];

        public rotationValues: number[] = getRandomNumbers(this.valuesCategory.length, 100, 1000);

        private static getDateYearRange(start: Date, stop: Date, yearStep: number): Date[] {
            return _.range(start.getFullYear(), stop.getFullYear(), yearStep)
                .map(x => new Date(new Date(start.getTime()).setFullYear(x)));
        }

        public getDataView(columnNames: string[] = EnhancedScatterChartData.DefaultSetOfColumns): DataView {
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
                        },
                        values: this.valuesX
                    },
                    {
                        source: {
                            displayName: EnhancedScatterChartData.ColumnY,
                            format: EnhancedScatterChartData.NumberFormatWithoutPrecision,
                            isMeasure: true,
                            roles: { [EnhancedScatterChartData.ColumnY]: true },
                        },
                        values: this.valuesY
                    },
                    {
                        source: {
                            displayName: EnhancedScatterChartData.ColumnSize,
                            format: EnhancedScatterChartData.NumberFormatWithoutPrecision,
                            isMeasure: true,
                            roles: { [EnhancedScatterChartData.ColumnSize]: true },
                        },
                        values: this.valuesSize
                    },
                    {
                        source: {
                            displayName: EnhancedScatterChartData.ColumnRotation,
                            format: EnhancedScatterChartData.NumberFormatWithoutPrecision,
                            isMeasure: true,
                            roles: { [EnhancedScatterChartData.ColumnRotation]: true },
                        },
                        values: this.rotationValues
                    }
                ], columnNames).build();
        }
    }
}
