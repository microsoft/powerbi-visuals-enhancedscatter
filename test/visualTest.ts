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
import lodashLast from "lodash.last";

// d3
import { Selection as d3Selection, select as d3Select } from "d3-selection";
type Selection<T1, T2 = T1> = d3Selection<any, T1, any, T2>;

// powerbi
import DataView = powerbi.DataView;
import DataViewValueColumnGroup = powerbi.DataViewValueColumnGroup;

// powerbi.extensibility.visual
import IColorPalette = powerbi.extensibility.IColorPalette;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import { EnhancedScatterChartMock as VisualClass } from "../test/EnhancedScatterChartMock";

// powerbi.extensibility.visual.test
import { helpers } from "./helpers/helpers";
import areColorsEqual = helpers.areColorsEqual;
import getRandomUniqueHexColors = helpers.getRandomUniqueHexColors;
import getSolidColorStructuralObject = helpers.getSolidColorStructuralObject;

import { EnhancedScatterChartData } from "./EnhancedScatterChartData";
import { EnhancedScatterChartBuilder } from "./EnhancedScatterChartBuilder";

// powerbi.extensibility.utils.interactivity
import { interactivityBaseService as interactivityService } from "powerbi-visuals-utils-interactivityutils";
import IInteractivityService = interactivityService.IInteractivityService;

// powerbi.extensibility.utils.test
import { MockISelectionId, assertColorsMatch, createVisualHost, createColorPalette, MockISelectionIdBuilder, createSelectionId } from "powerbi-visuals-utils-testutils";

import { EnhancedScatterChartDataPoint, ElementProperties, EnhancedScatterChartData as IEnhancedScatterChartData } from "../src/dataInterfaces";
import { BaseDataPoint } from "powerbi-visuals-utils-interactivityutils/lib/interactivityBaseService";
import { DefaultOpacity, DimmedOpacity } from "../src/behavior";

import { ExternalLinksTelemetry } from "../src/telemetry";

type CheckerCallback = (dataPoint: EnhancedScatterChartDataPoint, index?: number) => any;

describe("EnhancedScatterChart", () => {
    let dataView: DataView;
    let visualBuilder: EnhancedScatterChartBuilder;
    let defaultDataViewBuilder: EnhancedScatterChartData;
    let previousCreateSelectionId: any;
    let customMockISelectionIdBuilder: MockISelectionIdBuilder;

    beforeEach(() => {
        customMockISelectionIdBuilder = new MockISelectionIdBuilder();
        let selectionIdIndex: number = 0;
        previousCreateSelectionId = createSelectionId;
        customMockISelectionIdBuilder.createSelectionId = () => {
            return new MockISelectionId((selectionIdIndex++).toString());
        };

        visualBuilder = new EnhancedScatterChartBuilder(1000, 500);
        defaultDataViewBuilder = new EnhancedScatterChartData();
        dataView = defaultDataViewBuilder.getDataView();
    });

    afterEach(() => {
        customMockISelectionIdBuilder.createSelectionId = previousCreateSelectionId;
    });

    describe("DOM tests", () => {
        it("should create svg element", () => {
            expect(visualBuilder.mainElement).toBeTruthy();
        });

        it("should draw right amount of dots", done => {
            visualBuilder.updateRenderTimeout(dataView, () => {
                expect(visualBuilder.dots.length).toBe(dataView.categorical.categories[0].values.length);

                done();
            });
        });

        it("fill color should be false when category labels = on && fill point = off", done => {
            dataView = defaultDataViewBuilder.getDataView([
                EnhancedScatterChartData.ColumnCategory,
                EnhancedScatterChartData.ColumnSeries,
                EnhancedScatterChartData.ColumnX,
                EnhancedScatterChartData.ColumnY]);

            dataView.metadata.objects = {
                fillPoint: {
                    show: false
                },
                categoryLabels: {
                    show: true
                }
            };

            visualBuilder.updateRenderTimeout(dataView, () => {
                const selector: string = ".enhancedScatterChart .mainGraphicsContext .ScatterMarkers .dot";

                const elements: NodeListOf<HTMLElement> = visualBuilder.element.querySelectorAll(selector);

                elements.forEach(element => {
                    let fill: string = element.style.fill;
                    expect(fill).toBeFalsy();
                });

                done();
            });
        });

        it("data labels position validation", done => {
            defaultDataViewBuilder.valuesCategory = [
                "2015-12-31T21:00:00.000Z",
                "2016-12-31T21:00:00.000Z",
                "2017-12-31T21:00:00.000Z"
            ].map((x: string) => new Date(x));

            defaultDataViewBuilder.valuesSeries = ["Canada", "United States", "Russia"];
            defaultDataViewBuilder.valuesX = [850, 145, 114.25];
            defaultDataViewBuilder.valuesY = [681, 993, 845];
            defaultDataViewBuilder.valuesSize = [12, 14, 13];

            dataView = defaultDataViewBuilder.getDataView();

            dataView.metadata.objects = {
                categoryLabels: {
                    show: true
                }
            };

            visualBuilder.updateRenderTimeout(dataView, () => {
                const labels: HTMLElement[] = visualBuilder.dataLabelsText;

                labels.forEach((label: HTMLElement) => {
                    let HTMLElementLabel: HTMLElement = label[0],
                        x: number = Number(HTMLElementLabel.getAttribute("x")),
                        y: number = Number(HTMLElementLabel.getAttribute("y"));

                    expect(x).toBeGreaterThan(0);
                    expect(y).toBeGreaterThan(0);

                    expect(x).toBeLessThan(visualBuilder.viewport.width);
                    expect(y).toBeLessThan(visualBuilder.viewport.height);

                    done();
                });
            });
        });

        it("Should add right amount of legend items", () => {
            dataView.metadata.objects = {
                legend: {
                    show: true
                }
            };

            visualBuilder.updateFlushAllD3Transitions(dataView);

            expect(visualBuilder.legendItemText.length).toEqual(dataView.categorical.values.grouped().length);
        });

        describe("addElementToDOM", () => {
            let rootElement: Selection<any>;

            beforeEach(() => {
                rootElement = d3Select(visualBuilder.element);
            });

            it("arguments are null", () => {
                callAddElementToDOMAndResultShouldBeNull(null, null);
            });

            it("arguments are undefined", () => {
                callAddElementToDOMAndResultShouldBeNull(undefined, undefined);
            });

            it("the first argument is null, the second argument is empty object", () => {
                callAddElementToDOMAndResultShouldBeNull(null, <any>{});
            });

            it("the first argument is <Element>, the second argument is null", () => {
                callAddElementToDOMAndResultShouldBeNull(rootElement, null);
            });

            it("element should be in DOM", () => {
                let element: Selection<any>;

                element = callAddElementToDOMAndExpectExceptions(rootElement, {
                    selector: ".anySelector",
                    name: "g"
                });

                expect(element.node()).toBeTruthy();
            });

            function callAddElementToDOMAndResultShouldBeNull(
                rootElement: Selection<any>,
                properties: ElementProperties): void {

                expect(callAddElementToDOMAndExpectExceptions(undefined, undefined)).toBe(null);
            }

            function callAddElementToDOMAndExpectExceptions(
                rootElement: Selection<any>,
                properties: ElementProperties): Selection<any> {

                let element: Selection<any>;

                expect(() => {
                    element = visualBuilder.instance.addElementToDOM(rootElement, properties);
                }).not.toThrow();

                return element;
            }
        });

        describe("Crosshair", () => {
            beforeEach(() => {
                dataView.metadata.objects = {
                    crosshair: {
                        show: true
                    }
                };
            });

            it("visiblity test", () => {
                const MiddleViewportFactor: number = 2;

                visualBuilder.updateFlushAllD3Transitions(dataView);

                const event: any = new Event("mousemove");

                event.pageY = visualBuilder.viewport.height / MiddleViewportFactor;
                event.pageX = visualBuilder.viewport.width / MiddleViewportFactor;

                visualBuilder.svgScrollableAxisGraphicsContext.dispatchEvent(new Event("mouseover"));
                visualBuilder.svgScrollableAxisGraphicsContext.dispatchEvent(event);

                expect(visualBuilder.crosshair.style.display).not.toBe("none");

                visualBuilder.crosshair.querySelectorAll("line").forEach((element: SVGLineElement) => {
                    expect(parseFloat(element.getAttribute("x2") ?? "0")).toBeGreaterThan(0);
                    expect(parseFloat(element.getAttribute("y2") ?? "0")).toBeGreaterThan(0);
                });

                visualBuilder.svgScrollableAxisGraphicsContext.dispatchEvent(new Event("mouseout"));

                expect(visualBuilder.crosshair.style.display).toBe("none");
            });
        });
    });

    describe("Format settings test", () => {
        describe("X-axis", () => {
            beforeEach(() => {
                dataView.metadata.objects = {
                    categoryAxis: {
                        show: true
                    }
                };
            });

            it("show", () => {
                visualBuilder.updateFlushAllD3Transitions(dataView);
                expect(visualBuilder.xAxisTicks).toBeTruthy();

                (<any>dataView.metadata.objects).categoryAxis.show = false;

                visualBuilder.updateFlushAllD3Transitions(dataView);
                expect(visualBuilder.xAxisTicks.length).toBe(0);
            });

            it("date formatting", () => {
                let localDataViewBuilder = new EnhancedScatterChartData();

                localDataViewBuilder.valuesSeries = ["Canada", "United States", "Russia", "China", "France"];
                localDataViewBuilder.valuesX = [1546304400000, 1548982800000, 1554080400000, 1556672400000, 1559350800000];
                localDataViewBuilder.valuesY = [850, 145, 114.25, 564, 145.8];
                localDataViewBuilder.XColumnTypeOverload = { dateTime: true };
                let localDataView = localDataViewBuilder.getDataView();

                visualBuilder.updateFlushAllD3Transitions(localDataView);
                expect(visualBuilder.xAxisTicks).toBeTruthy();

                for (let i = 1; i > localDataViewBuilder.valuesX.length; i++) {
                    // first tick expects to be hidden
                    expect(
                        visualBuilder.xAxisTicks.item(i)[0].children.text())
                        .toMatch(VisualClass.displayTimestamp(localDataViewBuilder.valuesX[i])
                        );
                }
            });

            it("start/end", () => {
                const start: number = 500,
                    end: number = 700;

                (<any>dataView.metadata.objects).categoryAxis.start = start;
                (<any>dataView.metadata.objects).categoryAxis.end = end;

                visualBuilder.updateFlushAllD3Transitions(dataView);

                const lastIndex: number = visualBuilder.xAxisTicks.length - 1;

                expect(parseFloat(visualBuilder.xAxisTicks.item(0).querySelector('text')?.innerHTML)).toBe(start);
                expect(parseFloat(visualBuilder.xAxisTicks.item(lastIndex).querySelector('text')?.innerHTML)).toBe(end);
            });

            it("display Units", () => {
                const displayUnits: number = 1000;

                (<any>dataView.metadata.objects).categoryAxis.labelDisplayUnits = displayUnits;

                visualBuilder.updateFlushAllD3Transitions(dataView);
                visualBuilder.xAxisTicks.forEach((element: HTMLElement) => {
                    expect(lodashLast(element.querySelector('text')?.innerHTML)).toEqual("K");
                });
            });

            it("title", () => {
                (<any>dataView.metadata.objects).categoryAxis.showAxisTitle = true;

                visualBuilder.updateFlushAllD3Transitions(dataView);
                expect(visualBuilder.xAxisLabel).toBeTruthy();

                (<any>dataView.metadata.objects).categoryAxis.showAxisTitle = false;

                visualBuilder.updateFlushAllD3Transitions(dataView);
                expect(visualBuilder.xAxisLabel).not.toBeTruthy();
            });
        });

        describe("Y-axis", () => {
            beforeEach(() => {
                dataView.metadata.objects = {
                    valueAxis: {
                        show: true
                    }
                };
            });

            it("show", () => {
                (<any>dataView.metadata.objects).valueAxis.show = true;

                visualBuilder.updateFlushAllD3Transitions(dataView);
                expect(visualBuilder.yAxisTicks).toBeTruthy();

                (<any>dataView.metadata.objects).valueAxis.show = false;

                visualBuilder.updateFlushAllD3Transitions(dataView);
                expect(visualBuilder.yAxisTicks.length).toBe(0);
            });

            it("date formatting", () => {
                let localDataViewBuilder = new EnhancedScatterChartData();

                localDataViewBuilder.valuesSeries = ["Canada", "United States", "Russia", "China", "France"];
                localDataViewBuilder.valuesX = [850, 145, 114.25, 564, 145.8];
                localDataViewBuilder.valuesY = [1546304400000, 1548982800000, 1554080400000, 1556672400000, 1559350800000];
                localDataViewBuilder.YColumnTypeOverload = { dateTime: true };
                let localDataView = localDataViewBuilder.getDataView();

                visualBuilder.updateFlushAllD3Transitions(localDataView);
                expect(visualBuilder.yAxisTicks).toBeTruthy();

                for (let i = 1; i > localDataViewBuilder.valuesY.length; i++) {
                    // first tick expects to be hidden
                    expect(
                        visualBuilder.yAxisTicks.item(i)[0].children.text())
                        .toMatch(VisualClass.displayTimestamp(localDataViewBuilder.valuesY[i])
                        );
                }
            });

            it("start/end", () => {
                const start: number = 50,
                    end: number = 500;

                (<any>dataView.metadata.objects).valueAxis.start = start;
                (<any>dataView.metadata.objects).valueAxis.end = end;

                visualBuilder.updateFlushAllD3Transitions(dataView);

                const lastIndex: number = visualBuilder.yAxisTicks.length - 1;

                const actualStart: number = parseFloat(visualBuilder.yAxisTicks.item(0).querySelector('text')?.innerHTML),
                    actualEnd: number = parseFloat(visualBuilder.yAxisTicks.item(lastIndex).querySelector('text')?.innerHTML);

                expect(actualStart).toBe(start);
                expect(actualEnd).toBe(end);
            });

            it("display Units", () => {
                const displayUnits: number = 1000;

                (<any>dataView.metadata.objects).valueAxis.labelDisplayUnits = displayUnits;

                visualBuilder.updateFlushAllD3Transitions(dataView);
                visualBuilder.yAxisTicks.forEach((element: HTMLElement) => {
                    expect(lodashLast(element.querySelector('text')?.innerHTML)).toEqual("K");
                });
            });

            it("title", () => {
                (<any>dataView.metadata.objects).valueAxis.showAxisTitle = true;

                visualBuilder.updateFlushAllD3Transitions(dataView);
                expect(visualBuilder.yAxisLabel).toBeTruthy();

                (<any>dataView.metadata.objects).valueAxis.showAxisTitle = false;

                visualBuilder.updateFlushAllD3Transitions(dataView);
                expect(visualBuilder.yAxisLabel).not.toBeTruthy();
            });
        });

        describe("Category labels", () => {
            beforeEach(() => {
                dataView.metadata.objects = {
                    categoryLabels: {
                        show: true
                    }
                };
            });

            it("font size", () => {
                const fontSize: number = 22,
                    expectedFontSize: string = "29.3333px";

                (<any>dataView.metadata.objects).categoryLabels.fontSize = fontSize;
                visualBuilder.updateFlushAllD3Transitions(dataView);

                visualBuilder.dataLabelsText.forEach((element: HTMLElement) => {
                    expect(element[0].style.fontSize).toBe(expectedFontSize);
                });
            });

            it("color", () => {
                let color: string = "#336699";

                (<any>dataView.metadata.objects).categoryLabels.color = getSolidColorStructuralObject(color);
                visualBuilder.updateFlushAllD3Transitions(dataView);

                visualBuilder.dataLabelsText.forEach((element: HTMLElement) => {
                    assertColorsMatch(element[0].style.fill, color);
                });
            });

            it("show", () => {
                (<any>dataView.metadata.objects).categoryLabels.show = true;
                visualBuilder.updateFlushAllD3Transitions(dataView);

                expect(visualBuilder.dataLabels).toBeTruthy();

                (<any>dataView.metadata.objects).categoryLabels.show = false;
                visualBuilder.updateFlushAllD3Transitions(dataView);

                expect(visualBuilder.dataLabels.length).toBe(0);
            });
        });

        describe("Fill point", () => {
            it("show", () => {
                dataView = defaultDataViewBuilder.getDataView([
                    EnhancedScatterChartData.ColumnCategory,
                    EnhancedScatterChartData.ColumnSeries,
                    EnhancedScatterChartData.ColumnX,
                    EnhancedScatterChartData.ColumnY]);

                dataView.metadata.objects = {
                    fillPoint: {
                        show: true
                    }
                };

                visualBuilder.updateFlushAllD3Transitions(dataView);
                visualBuilder.dots.forEach((element: HTMLElement) => {
                    expect(element.style.fill).not.toBe("rgba(0, 0, 0, 0)");
                });

                (<any>dataView.metadata.objects).fillPoint.show = false;

                visualBuilder.updateFlushAllD3Transitions(dataView);
                visualBuilder.dots.forEach((element: HTMLElement) => {
                    expect(element.style.fill).toBeFalsy();
                });
            });
        });

        describe("Backdrop", () => {
            beforeEach(() => {
                dataView.metadata.objects = {
                    backdrop: {
                        show: true
                    }
                };
            });

            it("show", () => {
                (<any>dataView.metadata.objects).backdrop.url = "https://test.url";
                (<any>dataView.metadata.objects).backdrop.show = true;

                visualBuilder.updateFlushAllD3Transitions(dataView);
                expect(parseFloat(visualBuilder.backdropImage.getAttribute("height"))).toBeGreaterThan(0);
                expect(parseFloat(visualBuilder.backdropImage.getAttribute("width"))).toBeGreaterThan(0);

                (<any>dataView.metadata.objects).backdrop.show = false;

                visualBuilder.updateFlushAllD3Transitions(dataView);
                expect(parseFloat(visualBuilder.backdropImage.getAttribute("height"))).toBe(0);
                expect(parseFloat(visualBuilder.backdropImage.getAttribute("width"))).toBe(0);
            });

            it("url", () => {
                const url: string = "https://test.url";

                (<any>dataView.metadata.objects).backdrop.url = url;
                visualBuilder.updateFlushAllD3Transitions(dataView);

                expect(visualBuilder.backdropImage.getAttribute("href")).toBe(url);
            });
        });

        describe("Crosshair", () => {
            beforeEach(() => {
                dataView.metadata.objects = {
                    crosshair: {
                        show: true
                    }
                };
            });

            it("show", () => {
                (<any>dataView.metadata.objects).crosshair.show = true;
                visualBuilder.updateFlushAllD3Transitions(dataView);
                expect(visualBuilder.crosshair.querySelector("text")).toBeTruthy();

                (<any>dataView.metadata.objects).crosshair.show = false;
                visualBuilder.updateFlushAllD3Transitions(dataView);
                expect(visualBuilder.crosshair.querySelector("text")).not.toBeTruthy();
            });
        });

        describe("Outline", () => {
            beforeEach(() => {
                dataView.metadata.objects = {
                    outline: {
                        show: true
                    }
                };
            });

            it("show", () => {
                (<any>dataView.metadata.objects).outline.show = true;
                visualBuilder.updateFlushAllD3Transitions(dataView);

                visualBuilder.dots.forEach((element: HTMLElement) => {
                    assertColorsMatch(element.style.fill, element.style.stroke, true);
                });

                (<any>dataView.metadata.objects).outline.show = false;
                visualBuilder.updateFlushAllD3Transitions(dataView);

                visualBuilder.dots.forEach((element: HTMLElement) => {
                    assertColorsMatch(element.style.fill, element.style.stroke);
                });
            });
        });

        describe("Data colors", () => {
            it("colors", () => {
                const columnGroups: DataViewValueColumnGroup[] = dataView.categorical.values.grouped(),
                    colors: string[] = getRandomUniqueHexColors(columnGroups.length);

                columnGroups.forEach((
                    columnGroup: DataViewValueColumnGroup,
                    index: number) => {

                    columnGroup.objects = {
                        dataPoint: {
                            fill: getSolidColorStructuralObject(colors[index])
                        }
                    };
                });

                visualBuilder.updateFlushAllD3Transitions(dataView);

                const dots: NodeListOf<HTMLElement> = visualBuilder.dots;

                colors.forEach((color: string) => {
                    expect(Array.from(dots).some((dot: HTMLElement) => {
                        return areColorsEqual(dot.style.fill, color);
                    })).toBeTruthy();
                });
            });
        });

        describe("Legend", () => {
            beforeEach(() => {
                dataView.metadata.objects = {
                    legend: {
                        show: true
                    }
                };
            });

            it("show", () => {
                (<any>dataView.metadata.objects).legend.show = true;
                visualBuilder.updateFlushAllD3Transitions(dataView);
                expect(visualBuilder.legendGroup.children).toBeTruthy();

                (<any>dataView.metadata.objects).legend.show = false;
                visualBuilder.updateFlushAllD3Transitions(dataView);
                expect(visualBuilder.legendGroup.children.length).toBe(0);
            });

            it("show title", () => {
                (<any>dataView.metadata.objects).legend.showTitle = true;
                visualBuilder.updateFlushAllD3Transitions(dataView);
                expect(visualBuilder.legendTitle).toBeTruthy();

                (<any>dataView.metadata.objects).legend.showTitle = false;
                visualBuilder.updateFlushAllD3Transitions(dataView);
                expect(visualBuilder.legendTitle).not.toBeTruthy();
            });

            it("title text", () => {
                const titleText: string = "Power BI";

                (<any>dataView.metadata.objects).legend.showTitle = true;
                (<any>dataView.metadata.objects).legend.titleText = titleText;

                visualBuilder.updateFlushAllD3Transitions(dataView);

                let legendTitleText: string = visualBuilder.legendTitle.childNodes[0].textContent,
                    legendTitleTitle: string = (visualBuilder.legendTitle.children.item(0) as HTMLElement).innerHTML

                expect(legendTitleText).toEqual(titleText);
                expect(legendTitleTitle).toEqual(titleText);
            });

            it("color", () => {
                let color: string = "#555555";

                (<any>dataView.metadata.objects).legend.showTitle = true;
                (<any>dataView.metadata.objects).legend.labelColor = getSolidColorStructuralObject(color);

                visualBuilder.updateFlushAllD3Transitions(dataView);

                assertColorsMatch(visualBuilder.legendTitle.style.fill, color);

                visualBuilder.legendItemText.forEach((element: HTMLElement) => {
                    assertColorsMatch(element[0].style.fill, color);
                });
            });

            it("font size", () => {
                const fontSize: number = 22,
                    expectedFontSize: string = "29.3333px";

                (<any>dataView.metadata.objects).legend.fontSize = fontSize;
                (<any>dataView.metadata.objects).legend.showTitle = true;

                visualBuilder.updateFlushAllD3Transitions(dataView);

                expect(visualBuilder.legendTitle.style.fontSize).toBe(expectedFontSize);

                visualBuilder.legendItemText.forEach((element: HTMLElement) => {
                    expect(element[0].style.fontSize).toBe(expectedFontSize);
                });
            });
        });
    });

    describe("optimizeTranslateValues", () => {
        let enhancedScatterInstance: VisualClass;

        beforeEach(() => {
            enhancedScatterInstance = visualBuilder.instance;
        });

        it("result should be null", () => {
            let result: number[];

            result = enhancedScatterInstance.optimizeTranslateValues(null);

            expect(result).toBeNull();
        });

        it("result should be undefined", () => {
            let result: number[];

            result = enhancedScatterInstance.optimizeTranslateValues(undefined);

            expect(result).not.toBeDefined();
        });

        it("result should be defined", () => {
            let result: number[];

            result = enhancedScatterInstance.optimizeTranslateValues([]);

            expect(result).toBeDefined();
        });

        it("result should be correct", () => {
            let result: number[];

            result = enhancedScatterInstance.optimizeTranslateValues([
                Number.MAX_VALUE,
                Number.MIN_VALUE
            ]);

            expect(result[0]).toBe(VisualClass.MaxTranslateValue);
            expect(result[1]).toBe(VisualClass.MinTranslateValue);
        });
    });

    describe("optimizeTranslateValue", () => {
        let enhancedScatterInstance: VisualClass;

        beforeEach(() => {
            enhancedScatterInstance = visualBuilder.instance;
        });

        it("result should be null", () => {
            let result: number;

            result = enhancedScatterInstance.optimizeTranslateValue(null);

            expect(result).toBeNull();
        });

        it("result should be null", () => {
            let result: number;

            result = enhancedScatterInstance.optimizeTranslateValue(undefined);

            expect(result).not.toBeDefined();
        });

        it("result should be MaxTranslateValue", () => {
            let result: number;

            result = enhancedScatterInstance.optimizeTranslateValue(Number.MAX_VALUE);

            expect(result).toBe(VisualClass.MaxTranslateValue);
        });

        it("result should be -MaxTranslateValue", () => {
            let result: number;

            result = enhancedScatterInstance.optimizeTranslateValue(-Number.MAX_VALUE);

            expect(result).toBe(-VisualClass.MaxTranslateValue);
        });

        it("result should be MinTranslateValue", () => {
            let result: number;

            result = enhancedScatterInstance.optimizeTranslateValue(Number.MIN_VALUE);

            expect(result).toBe(VisualClass.MinTranslateValue);
        });

        it("result should be -MinTranslateValue", () => {
            let result: number;

            result = enhancedScatterInstance.optimizeTranslateValue(-Number.MIN_VALUE);

            expect(result).toBe(-VisualClass.MinTranslateValue);
        });

        it("input value and result should be the same", () => {
            let inputValue: number = 255,
                result: number;

            result = enhancedScatterInstance.optimizeTranslateValue(inputValue);

            expect(result).toBe(inputValue);
        });
    });

    describe("Capabilities tests", () => {
        it("all items having displayName should have displayNameKey property", () => {
            const jsonData = require("../capabilities.json");

            let objectsChecker: Function = (obj) => {
                const objKeys = Object.keys(obj);
                for (let key of objKeys) {
                    let value: any = obj[key];

                    if (value.displayName) {
                        expect(value.displayNameKey).toBeDefined();
                    }

                    if (typeof value === "object") {
                        objectsChecker(value);
                    }
                }
            };

            objectsChecker(jsonData);
        });
    });

    describe("converter", () => {
        let colorPalette: IColorPalette,
            visualHost: IVisualHost,
            instance: VisualClass;

        beforeEach(() => {
            colorPalette = createColorPalette();
            visualHost = createVisualHost();
            instance = visualBuilder.instance;
        });

        it("arguments are null", () => {
            callParseDataAndExpectExceptions(instance, null, null, null, null);
        });

        it("arguments are undefined", () => {
            callParseDataAndExpectExceptions(instance, undefined, undefined, undefined, undefined);
        });

        it("arguments are correct", () => {
            callParseDataAndExpectExceptions(instance, dataView, colorPalette, visualHost);
        });

        it("backdrop", () => {
            let enhancedScatterChartData: IEnhancedScatterChartData = callConverterWithAdditionalColumns(
                instance,
                colorPalette,
                visualHost,
                [EnhancedScatterChartData.ColumnBackdrop]
            );

            expect(enhancedScatterChartData.settings.enableBackdropCardSettings.url.value).toBeDefined();
            expect(enhancedScatterChartData.settings.enableBackdropCardSettings.url.value).not.toBeNull();

            expect(enhancedScatterChartData.settings.enableBackdropCardSettings.url.value).toBe(defaultDataViewBuilder.imageValues[0]);
            expect(enhancedScatterChartData.settings.enableBackdropCardSettings.show.value).toBeDefined();
        });

        describe("dataPoints", () => {
            it("x should be defined", () => {
                checkDataPointProperty(
                    instance,
                    (dataPoint: EnhancedScatterChartDataPoint) => {
                        valueToBeDefinedAndNumber(dataPoint.x);
                    },
                    defaultDataViewBuilder,
                    colorPalette,
                    visualHost
                );
            });

            it("y should be defined", () => {
                checkDataPointProperty(
                    instance,
                    (dataPoint: EnhancedScatterChartDataPoint) => {
                        valueToBeDefinedAndNumber(dataPoint.y);
                    },
                    defaultDataViewBuilder,
                    colorPalette,
                    visualHost);
            });

            it("color fill", () => {
                checkDataPointProperty(
                    instance,
                    (dataPoint: EnhancedScatterChartDataPoint, index: number) => {
                        const areColorsEqualResult = areColorsEqual(dataPoint.fill, defaultDataViewBuilder.colorValues[index]);
                        expect(areColorsEqualResult).toBeTruthy();
                    },
                    defaultDataViewBuilder,
                    colorPalette,
                    visualHost,
                    [EnhancedScatterChartData.ColumnColorFill]
                );
            });

            it("images", () => {
                checkDataPointProperty(
                    instance,
                    (dataPoint: EnhancedScatterChartDataPoint, index: number) => {
                        expect(dataPoint.svgurl).toBe(defaultDataViewBuilder.imageValues[index]);
                    },
                    defaultDataViewBuilder,
                    colorPalette,
                    visualHost,
                    [EnhancedScatterChartData.ColumnImage]);
            });

            it("rotate should be defined", () => {
                checkDataPointProperty(
                    instance,
                    (dataPoint: EnhancedScatterChartDataPoint, index) => {
                        valueToBeDefinedAndNumber(dataPoint.rotation);
                    },
                    defaultDataViewBuilder,
                    colorPalette,
                    visualHost,
                    [EnhancedScatterChartData.ColumnRotation]);
            });

            it("rotate should be 0 when source values are null", () => {
                defaultDataViewBuilder.rotationValues = defaultDataViewBuilder.rotationValues.map((rotation) => {
                    return null;
                });

                checkDataPointProperty(
                    instance,
                    (dataPoint: EnhancedScatterChartDataPoint) => {
                        let rotation: number = dataPoint.rotation;

                        valueToBeDefinedAndNumber(rotation);

                        expect(rotation).toBe(0);
                    },
                    defaultDataViewBuilder,
                    colorPalette,
                    visualHost,
                    [EnhancedScatterChartData.ColumnRotation]);
            });
        });

        function callConverterWithAdditionalColumns(
            instance: VisualClass,
            colorPalette: IColorPalette,
            visualHost: IVisualHost,
            columns: string[]
        )
            : IEnhancedScatterChartData {

            let dataView = defaultDataViewBuilder.getDataView(
                EnhancedScatterChartData.DefaultSetOfColumns.concat(columns));

            return callParseDataAndExpectExceptions(instance, dataView, colorPalette, visualHost);
        }

        function callParseDataAndExpectExceptions(
            instance: VisualClass,
            dataView: DataView,
            colorPalette: IColorPalette,
            visualHost: IVisualHost,
            interactivityService?: IInteractivityService<BaseDataPoint>
        ): IEnhancedScatterChartData {
            let enhancedScatterChartData: IEnhancedScatterChartData;

            expect(() => {
                enhancedScatterChartData = instance.parseData(
                    dataView,
                    colorPalette,
                    visualHost,
                    interactivityService,
                );
            }).not.toThrow();

            return enhancedScatterChartData;
        }

        function checkDataPointProperty(
            instance: VisualClass,
            checkerCallback: CheckerCallback,
            dataViewBuilder: EnhancedScatterChartData,
            colorPalette: IColorPalette,
            visualHost: IVisualHost,
            columnNames: string[] = []
        ): void {

            const dataView: DataView = dataViewBuilder.getDataView(
                EnhancedScatterChartData.DefaultSetOfColumns.concat(columnNames));

            let enhancedScatterChartData: IEnhancedScatterChartData = instance.parseData(
                dataView,
                colorPalette,
                visualHost,
                null,
            );

            enhancedScatterChartData.dataPoints.forEach(checkerCallback);
        }

        function valueToBeDefinedAndNumber(value: number): void {
            expect(value).toBeDefined();
            expect(value).not.toBeNull();
            expect(value).not.toBeNaN();
        }
    });

    describe("Accessibility", () => {
        it("title attribute should be filled for all of images for screen readers", (done) => {
            const dataView: DataView = defaultDataViewBuilder.getDataView([
                EnhancedScatterChartData.ColumnCategory,
                EnhancedScatterChartData.ColumnSeries,
                EnhancedScatterChartData.ColumnX,
                EnhancedScatterChartData.ColumnY,
                EnhancedScatterChartData.ColumnSize,
                EnhancedScatterChartData.ColumnImage,
            ]);

            visualBuilder.updateRenderTimeout(dataView, () => {
                const images: NodeListOf<HTMLElement> = visualBuilder.images;

                images.forEach((image: HTMLElement) => {
                    const altText: string | null = image.getAttribute("title");

                    expect(altText).toBeDefined();
                });

                done();
            });
        });

        describe("High contrast mode", () => {
            const backgroundColor: string = "#000000";
            const foregroundColor: string = "#ffff00";

            beforeEach(() => {
                visualBuilder.visualHost.colorPalette.isHighContrast = true;

                visualBuilder.visualHost.colorPalette.background = { value: backgroundColor };
                visualBuilder.visualHost.colorPalette.foreground = { value: foregroundColor };
            });

            it("dots should use fill style", (done) => {
                visualBuilder.updateRenderTimeout(dataView, () => {
                    const dots: NodeListOf<HTMLElement> = visualBuilder.dots;

                    expect(isColorAppliedToElements(dots, null, "fill"));

                    done();
                });
            });

            function isColorAppliedToElements(
                elements: NodeListOf<HTMLElement>,
                color?: string,
                colorStyleName: string = "fill"
            ): boolean {
                return Array.from(elements).some((element: HTMLElement) => {
                    const currentColor: string = element.style.getPropertyValue(colorStyleName);

                    if (!currentColor || !color) {
                        return currentColor === color;
                    }

                    return areColorsEqual(currentColor, color);
                });
            }
        });
    });

    describe("Highlight test", () => {
        const defaultOpacity: string = DefaultOpacity.toString();
        const dimmedOpacity: string = DimmedOpacity.toString();

        it("Highlights property should not be received", (done) => {
            visualBuilder.updateRenderTimeout(dataView, () => {
                expect(dataView.categorical?.values?.findIndex(value => value.highlights!=null)).toBe(-1);

                const dataPoints = visualBuilder.dots;

                dataPoints.forEach((element: HTMLElement) => {
                    const opacity: string = element.style.opacity;
                    expect(opacity).toBe(defaultOpacity);
                });

                done();
            });
        });

        it("Elements should be highlighted", (done) => {
            const dataViewWithHighLighted: DataView = defaultDataViewBuilder.getDataView(undefined, true);
            visualBuilder.updateRenderTimeout(dataViewWithHighLighted, () => {
                expect(dataViewWithHighLighted.categorical?.values?.findIndex(value => value.highlights!=null)).not.toBe(-1);

                const dataPoints = visualBuilder.dots;

                let highligtedCount: number = 0;
                let nonHighlightedCount: number = 0;
                const expectedHighligtedCount: number = 1;

                dataPoints.forEach((element: HTMLElement) => {
                    const opacity: string = element.style.opacity;
                    if (opacity === defaultOpacity)
                        highligtedCount++;
                    if (opacity === dimmedOpacity)
                        nonHighlightedCount++;
                });

                const expectedNonHighligtedCount: number = dataPoints.length - expectedHighligtedCount;
                expect(highligtedCount).toBe(expectedHighligtedCount);
                expect(nonHighlightedCount).toBe(expectedNonHighligtedCount);

                done();
            });
        });
    });

    describe("URL link", () => {
        // beforeEach(() => {
        //     dataView.metadata.objects = {
        //         backdrop: {
        //             show: true
        //         }
        //     };
        // });

        it("with empty link", (done) => {
            visualBuilder.updateRenderTimeout(dataView, () => {
                let link = "";

                expect(ExternalLinksTelemetry.containsExternalURL(link).valueOf()).toBe(false);
                done();
            });
        });

        it("matches to https pattern", (done) => {

            // (<any>dataView.metadata.objects).backdrop.url = "https://test.url";
            // (<any>dataView.metadata.objects).backdrop.show = true;

            let link = "https://powerbi.com";

            visualBuilder.updateRenderTimeout(dataView, () => {
                expect(ExternalLinksTelemetry.containsExternalURL(link).valueOf()).toBe(true);
                done();
            });
        });

        it("matches to ftp pattern", () => {
            let link = "ftp://microsoft@ftp.someserver.com/program.exe";
            expect(ExternalLinksTelemetry.containsExternalURL(link).valueOf()).toBe(true);
        });

        it("does not matches to http, https or ftp pattern", () => {
            let link = "powerbi.com";
            expect(ExternalLinksTelemetry.containsExternalURL(link).valueOf()).toBe(false);
        });

        it("base64 image does not matches to http, https or ftp pattern", () => {
            let link = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII=";
            expect(ExternalLinksTelemetry.containsExternalURL(link).valueOf()).toBe(false);
        });
    });
});
