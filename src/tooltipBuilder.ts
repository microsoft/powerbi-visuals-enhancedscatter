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

import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
import DataViewValueColumn = powerbi.DataViewValueColumn;
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;

export module tooltipBuilder {
    // powerbi.extensibility.utils.formatting
    import { valueFormatter } from "powerbi-visuals-utils-formattingutils";

    export interface TooltipSeriesDataItem {
        value?: any;
        highlightedValue?: any;
        metadata: DataViewCategoryColumn | DataViewValueColumn;
    }

    export interface TooltipCategoryDataItem {
        value?: any;
        metadata: DataViewMetadataColumn[];
    }

    const DefaultDisplayName: string = "";
    const DefaultDisplayNameDelimiter: string = "/";

    export function createTooltipInfo(
        categoryValue: any,
        categories?: DataViewCategoryColumn[],
        seriesData?: TooltipSeriesDataItem[]): VisualTooltipDataItem[] {

        let categorySource: TooltipCategoryDataItem,
            seriesSource: TooltipSeriesDataItem[] = [];

        if (categories && categories.length > 0) {
            if (categories.length > 1) {
                const compositeCategoriesData: DataViewMetadataColumn[] = [];

                for (let i: number = 0, length: number = categories.length; i < length; i++) {
                    compositeCategoriesData.push(categories[i].source);
                }

                categorySource = {
                    value: categoryValue,
                    metadata: compositeCategoriesData
                };
            }
            else {
                categorySource = {
                    value: categoryValue,
                    metadata: [categories[0].source]
                };
            }
        }

        if (seriesData) {
            for (let i: number = 0, len: number = seriesData.length; i < len; i++) {
                const singleSeriesData: TooltipSeriesDataItem = seriesData[i];

                if (categorySource
                    && categorySource.metadata[0] === singleSeriesData.metadata.source) {

                    continue;
                }

                seriesSource.push({
                    value: singleSeriesData.value,
                    metadata: singleSeriesData.metadata
                });
            }
        }

        return createTooltipData(categorySource, seriesSource);
    }

    export function createTooltipData(
        categoryValue: TooltipCategoryDataItem,
        seriesValues: TooltipSeriesDataItem[]): VisualTooltipDataItem[] {

        let items: VisualTooltipDataItem[] = [];

        if (categoryValue) {
            if (categoryValue.metadata.length > 1) {
                let displayName: string = DefaultDisplayName;

                for (let i: number = 0, ilen: number = categoryValue.metadata.length; i < ilen; i++) {
                    if (i !== 0) {
                        displayName += DefaultDisplayNameDelimiter;
                    }

                    displayName += categoryValue.metadata[i].displayName;
                }

                let categoryFormattedValue: string = getFormattedValue(
                    categoryValue.metadata[0],
                    categoryValue.value);

                items.push({
                    displayName: displayName,
                    value: categoryFormattedValue
                });
            }
            else {
                let categoryFormattedValue: string = getFormattedValue(
                    categoryValue.metadata[0],
                    categoryValue.value);

                items.push({
                    displayName: categoryValue.metadata[0].displayName,
                    value: categoryFormattedValue
                });
            }
        }

        for (let i = 0; i < seriesValues.length; i++) {
            const seriesData: TooltipSeriesDataItem = seriesValues[i];

            if (seriesData && seriesData.metadata) {
                const seriesMetadataColumn: DataViewMetadataColumn = seriesData.metadata.source,
                    value: any = seriesData.value;

                if (value || value === 0) {
                    let formattedValue: string = getFormattedValue(
                        seriesMetadataColumn,
                        value);

                    items.push({
                        displayName: seriesMetadataColumn.displayName,
                        value: formattedValue
                    });
                }
            }
        }

        return items;
    }

    export function getFormattedValue(column: DataViewMetadataColumn, value: any): any {
        const formatString: string = valueFormatter.getFormatStringByColumn(column);

        return valueFormatter.format(value, formatString);
    }
}
