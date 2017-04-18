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
    // d3
    import Selection = d3.Selection;

    // powerbi.extensibility.visual
    import VisualClass = powerbi.extensibility.visual.EnhancedScatterChart1443994985041.EnhancedScatterChart;
    import IEnhancedScatterChartData = powerbi.extensibility.visual.EnhancedScatterChart1443994985041.EnhancedScatterChartData;
    import EnhancedScatterChartDataPoint = powerbi.extensibility.visual.EnhancedScatterChart1443994985041.EnhancedScatterChartDataPoint;
    import ElementProperties = powerbi.extensibility.visual.EnhancedScatterChart1443994985041.ElementProperties;

    // powerbi.extensibility.visual.test
    import areColorsEqual = powerbi.extensibility.visual.test.helpers.areColorsEqual;
    import EnhancedScatterChartData = powerbi.extensibility.visual.test.EnhancedScatterChartData;
    import EnhancedScatterChartBuilder = powerbi.extensibility.visual.test.EnhancedScatterChartBuilder;
    import getRandomUniqueHexColors = powerbi.extensibility.visual.test.helpers.getRandomUniqueHexColors;
    import getSolidColorStructuralObject = powerbi.extensibility.visual.test.helpers.getSolidColorStructuralObject;

    // powerbi.extensibility.utils.interactivity
    import IInteractivityService = powerbi.extensibility.utils.interactivity.IInteractivityService;

    // powerbi.extensibility.utils.test
    import createVisualHost = powerbi.extensibility.utils.test.mocks.createVisualHost;
    import MockISelectionId = powerbi.extensibility.utils.test.mocks.MockISelectionId;
    import createColorPalette = powerbi.extensibility.utils.test.mocks.createColorPalette;
    import assertColorsMatch = powerbi.extensibility.utils.test.helpers.color.assertColorsMatch;

    type CheckerCallback = (dataPoint: EnhancedScatterChartDataPoint, index?: number) => any;

    describe("EnhancedScatterChart", () => {
        let dataView: DataView,
            visualBuilder: EnhancedScatterChartBuilder,
            defaultDataViewBuilder: EnhancedScatterChartData;

        beforeEach(() => {
            let selectionIdIndex: number = 0;

            powerbi.extensibility.utils.test.mocks.createSelectionId = () => {
                return new MockISelectionId((selectionIdIndex++).toString());
            };

            visualBuilder = new EnhancedScatterChartBuilder(1000, 500);
            defaultDataViewBuilder = new EnhancedScatterChartData();
            dataView = defaultDataViewBuilder.getDataView();
        });

        describe("DOM tests", () => {
            it("should create svg element", () => {
                expect(visualBuilder.mainElement[0]).toBeInDOM();
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
                    let selector: string = ".enhancedScatterChart .mainGraphicsContext .ScatterMarkers .dot";

                    $(selector).each((index, elem) => {
                        let opacity: string = $(elem).css("fill-opacity");

                        expect(opacity).toBe("0");
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
                    const labels: Element[] = visualBuilder.dataLabelsText.get();

                    labels.forEach((label: Element) => {
                        let jqueryLabel: JQuery = $(label),
                            x: number = Number(jqueryLabel.attr("x")),
                            y: number = Number(jqueryLabel.attr("y"));

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

                expect(visualBuilder.legendItemText.length)
                    .toEqual(dataView.categorical.values.grouped().length);
            });

            describe("addElementToDOM", () => {
                let rootElement: Selection<any>;

                beforeEach(() => {
                    rootElement = d3.select(visualBuilder.element.get(0));
                });

                it("arguments are null", () => {
                    callAddElementToDOMAndResultShouldBeNull(null, null);
                });

                it("arguments are undefined", () => {
                    callAddElementToDOMAndResultShouldBeNull(undefined, undefined);
                });

                it("the first argument is null, the second argument is empty object", () => {
                    callAddElementToDOMAndResultShouldBeNull(null, {} as any);
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

                    expect(element.node()).toBeInDOM();
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

                    visualBuilder.svgScrollableAxisGraphicsContext[0].dispatchEvent(new Event("mouseover"));
                    visualBuilder.svgScrollableAxisGraphicsContext[0].dispatchEvent(event);

                    expect(visualBuilder.crosshair.css("display")).not.toBe("none");

                    visualBuilder.crosshair.children("line").toArray().map($).forEach((element: JQuery) => {
                        expect(parseFloat(element.attr("x2"))).toBeGreaterThan(0);
                        expect(parseFloat(element.attr("y2"))).toBeGreaterThan(0);
                    });

                    visualBuilder.svgScrollableAxisGraphicsContext[0].dispatchEvent(new Event("mouseout"));

                    expect(visualBuilder.crosshair.css("display")).toBe("none");
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
                    expect(visualBuilder.xAxisTicks).toBeInDOM();

                    (dataView.metadata.objects as any).categoryAxis.show = false;

                    visualBuilder.updateFlushAllD3Transitions(dataView);
                    expect(visualBuilder.xAxisTicks).not.toBeInDOM();
                });

                it("start/end", () => {
                    const start: number = 500,
                        end: number = 700;

                    (dataView.metadata.objects as any).categoryAxis.start = start;
                    (dataView.metadata.objects as any).categoryAxis.end = end;

                    visualBuilder.updateFlushAllD3Transitions(dataView);

                    expect(parseFloat(visualBuilder.xAxisTicks.first().children().text())).toBe(start);
                    expect(parseFloat(visualBuilder.xAxisTicks.last().children().text())).toBe(end);
                });

                it("display Units", () => {
                    const displayUnits: number = 1000;

                    (dataView.metadata.objects as any).categoryAxis.labelDisplayUnits = displayUnits;

                    visualBuilder.updateFlushAllD3Transitions(dataView);
                    visualBuilder.xAxisTicks.toArray().map($).forEach((element: JQuery) => {
                        expect(_.last(element.text())).toEqual("K");
                    });
                });

                it("title", () => {
                    (dataView.metadata.objects as any).categoryAxis.showAxisTitle = true;

                    visualBuilder.updateFlushAllD3Transitions(dataView);
                    expect(visualBuilder.xAxisLabel).toBeInDOM();

                    (dataView.metadata.objects as any).categoryAxis.showAxisTitle = false;

                    visualBuilder.updateFlushAllD3Transitions(dataView);
                    expect(visualBuilder.xAxisLabel).not.toBeInDOM();
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
                    (dataView.metadata.objects as any).valueAxis.show = true;

                    visualBuilder.updateFlushAllD3Transitions(dataView);
                    expect(visualBuilder.yAxisTicks).toBeInDOM();

                    (dataView.metadata.objects as any).valueAxis.show = false;

                    visualBuilder.updateFlushAllD3Transitions(dataView);
                    expect(visualBuilder.yAxisTicks).not.toBeInDOM();
                });

                it("start/end", () => {
                    const start: number = 50,
                        end: number = 500;

                    (dataView.metadata.objects as any).valueAxis.start = start;
                    (dataView.metadata.objects as any).valueAxis.end = end;

                    visualBuilder.updateFlushAllD3Transitions(dataView);

                    const actualStart: number = parseFloat(visualBuilder.yAxisTicks.first().children().text()),
                        actualEnd: number = parseFloat(visualBuilder.yAxisTicks.last().children().text());

                    expect(actualStart).toBe(start);
                    expect(actualEnd).toBe(end);
                });

                it("display Units", () => {
                    const displayUnits: number = 1000;

                    (dataView.metadata.objects as any).valueAxis.labelDisplayUnits = displayUnits;

                    visualBuilder.updateFlushAllD3Transitions(dataView);
                    visualBuilder.yAxisTicks.toArray().map($).forEach((element: JQuery) => {
                        expect(_.last(element.text())).toEqual("K");
                    });
                });

                it("title", () => {
                    (dataView.metadata.objects as any).valueAxis.showAxisTitle = true;

                    visualBuilder.updateFlushAllD3Transitions(dataView);
                    expect(visualBuilder.yAxisLabel).toBeInDOM();

                    (dataView.metadata.objects as any).valueAxis.showAxisTitle = false;

                    visualBuilder.updateFlushAllD3Transitions(dataView);
                    expect(visualBuilder.yAxisLabel).not.toBeInDOM();
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

                    (dataView.metadata.objects as any).categoryLabels.fontSize = fontSize;
                    visualBuilder.updateFlushAllD3Transitions(dataView);

                    visualBuilder.dataLabelsText.toArray().map($).forEach((element: JQuery) => {
                        expect(element.css("font-size")).toBe(expectedFontSize);
                    });
                });

                it("color", () => {
                    let color: string = "#336699";

                    (dataView.metadata.objects as any).categoryLabels.color = getSolidColorStructuralObject(color);
                    visualBuilder.updateFlushAllD3Transitions(dataView);

                    visualBuilder.dataLabelsText.toArray().map($).forEach((element: JQuery) => {
                        assertColorsMatch(element.css("fill"), color);
                    });
                });

                it("show", () => {
                    (dataView.metadata.objects as any).categoryLabels.show = true;
                    visualBuilder.updateFlushAllD3Transitions(dataView);

                    expect(visualBuilder.dataLabels).toBeInDOM();

                    (dataView.metadata.objects as any).categoryLabels.show = false;
                    visualBuilder.updateFlushAllD3Transitions(dataView);

                    expect(visualBuilder.dataLabels).not.toBeInDOM();
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
                    visualBuilder.dots.toArray().map($).forEach((element: JQuery) => {
                        expect(parseFloat(element.css("fill-opacity"))).toBeGreaterThan(0);
                    });

                    (dataView.metadata.objects as any).fillPoint.show = false;

                    visualBuilder.updateFlushAllD3Transitions(dataView);
                    visualBuilder.dots.toArray().map($).forEach((element: JQuery) => {
                        expect(parseFloat(element.css("fill-opacity"))).toBe(0);
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
                    (dataView.metadata.objects as any).backdrop.url = "https://test.url";
                    (dataView.metadata.objects as any).backdrop.show = true;

                    visualBuilder.updateFlushAllD3Transitions(dataView);
                    expect(parseFloat(visualBuilder.backdropImage.attr("height"))).toBeGreaterThan(0);
                    expect(parseFloat(visualBuilder.backdropImage.attr("width"))).toBeGreaterThan(0);

                    (dataView.metadata.objects as any).backdrop.show = false;

                    visualBuilder.updateFlushAllD3Transitions(dataView);
                    expect(parseFloat(visualBuilder.backdropImage.attr("height"))).toBe(0);
                    expect(parseFloat(visualBuilder.backdropImage.attr("width"))).toBe(0);
                });

                it("url", () => {
                    const url: string = "https://test.url";

                    (dataView.metadata.objects as any).backdrop.url = url;
                    visualBuilder.updateFlushAllD3Transitions(dataView);

                    expect(visualBuilder.backdropImage.attr("href")).toBe(url);
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
                    (dataView.metadata.objects as any).crosshair.show = true;
                    visualBuilder.updateFlushAllD3Transitions(dataView);
                    expect(visualBuilder.crosshair.children("text")).toBeInDOM();

                    (dataView.metadata.objects as any).crosshair.show = false;
                    visualBuilder.updateFlushAllD3Transitions(dataView);
                    expect(visualBuilder.crosshair.children("text")).not.toBeInDOM();
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
                    (dataView.metadata.objects as any).outline.show = true;
                    visualBuilder.updateFlushAllD3Transitions(dataView);

                    visualBuilder.dots.toArray().map($).forEach((element: JQuery) => {
                        assertColorsMatch(element.css("fill"), element.css("stroke"), true);
                    });

                    (dataView.metadata.objects as any).outline.show = false;
                    visualBuilder.updateFlushAllD3Transitions(dataView);

                    visualBuilder.dots.toArray().map($).forEach((element: JQuery) => {
                        assertColorsMatch(element.css("fill"), element.css("stroke"));
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

                    const dots: JQuery[] = visualBuilder.dots.toArray().map($);

                    colors.forEach((color: string) => {
                        expect(dots.some((dot: JQuery) => {
                            return areColorsEqual(dot.css("fill"), color);
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
                    (dataView.metadata.objects as any).legend.show = true;
                    visualBuilder.updateFlushAllD3Transitions(dataView);
                    expect(visualBuilder.legendGroup.children()).toBeInDOM();

                    (dataView.metadata.objects as any).legend.show = false;
                    visualBuilder.updateFlushAllD3Transitions(dataView);
                    expect(visualBuilder.legendGroup.children()).not.toBeInDOM();
                });

                it("show title", () => {
                    (dataView.metadata.objects as any).legend.showTitle = true;
                    visualBuilder.updateFlushAllD3Transitions(dataView);
                    expect(visualBuilder.legendTitle).toBeInDOM();

                    (dataView.metadata.objects as any).legend.showTitle = false;
                    visualBuilder.updateFlushAllD3Transitions(dataView);
                    expect(visualBuilder.legendTitle).not.toBeInDOM();
                });

                it("title text", () => {
                    const titleText: string = "Power BI";

                    (dataView.metadata.objects as any).legend.showTitle = true;
                    (dataView.metadata.objects as any).legend.titleText = titleText;

                    visualBuilder.updateFlushAllD3Transitions(dataView);

                    let legendTitleText: string = visualBuilder.legendTitle.get(0).firstChild.textContent,
                        legendTitleTitle: string = visualBuilder.legendTitle.children("title").text();

                    expect(legendTitleText).toEqual(titleText);
                    expect(legendTitleTitle).toEqual(titleText);
                });

                it("color", () => {
                    let color: string = "#555555";

                    (dataView.metadata.objects as any).legend.showTitle = true;
                    (dataView.metadata.objects as any).legend.labelColor = getSolidColorStructuralObject(color);

                    visualBuilder.updateFlushAllD3Transitions(dataView);

                    assertColorsMatch(visualBuilder.legendTitle.css("fill"), color);

                    visualBuilder.legendItemText.toArray().map($).forEach((element: JQuery) => {
                        assertColorsMatch(element.css("fill"), color);
                    });
                });

                it("font size", () => {
                    const fontSize: number = 22,
                        expectedFontSize: string = "29.3333px";

                    (dataView.metadata.objects as any).legend.fontSize = fontSize;
                    (dataView.metadata.objects as any).legend.showTitle = true;

                    visualBuilder.updateFlushAllD3Transitions(dataView);

                    expect(visualBuilder.legendTitle.css("font-size")).toBe(expectedFontSize);

                    visualBuilder.legendItemText.toArray().map($).forEach((element: JQuery) => {
                        expect(element.css("font-size")).toBe(expectedFontSize);
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

        describe("converter", () => {
            let colorPalette: IColorPalette,
                visualHost: IVisualHost;

            beforeEach(() => {
                colorPalette = createColorPalette();
                visualHost = createVisualHost();
            });

            it("arguments are null", () => {
                callConverterAndExpectExceptions(null, null, null, null, null);
            });

            it("arguments are undefined", () => {
                callConverterAndExpectExceptions(undefined, undefined, undefined, undefined, undefined);
            });

            it("arguments are correct", () => {
                callConverterAndExpectExceptions(dataView, colorPalette, visualHost);
            });

            it("backdrop", () => {
                let enhancedScatterChartData: IEnhancedScatterChartData = callConverterWithAdditionalColumns(
                    colorPalette,
                    visualHost,
                    [EnhancedScatterChartData.ColumnBackdrop]);

                expect(enhancedScatterChartData.backdrop).toBeDefined();
                expect(enhancedScatterChartData.backdrop).not.toBeNull();

                expect(enhancedScatterChartData.backdrop.url).toBe(defaultDataViewBuilder.imageValues[0]);
                expect(enhancedScatterChartData.backdrop.show).toBeTruthy();
            });

            describe("dataPoints", () => {
                it("x should be defined", () => {
                    checkDataPointProperty(
                        (dataPoint: EnhancedScatterChartDataPoint) => {
                            valueToBeDefinedAndNumber(dataPoint.x);
                        },
                        defaultDataViewBuilder,
                        colorPalette,
                        visualHost);
                });

                it("y should be defined", () => {
                    checkDataPointProperty(
                        (dataPoint: EnhancedScatterChartDataPoint) => {
                            valueToBeDefinedAndNumber(dataPoint.y);
                        },
                        defaultDataViewBuilder,
                        colorPalette,
                        visualHost);
                });

                it("color fill", () => {
                    checkDataPointProperty(
                        (dataPoint: EnhancedScatterChartDataPoint, index: number) => {
                            expect(dataPoint.colorFill).toBe(defaultDataViewBuilder.colorValues[index]);
                        },
                        defaultDataViewBuilder,
                        colorPalette,
                        visualHost,
                        [EnhancedScatterChartData.ColumnColorFill]);
                });

                it("images", () => {
                    checkDataPointProperty(
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
                colorPalette: IColorPalette,
                visualHost: IVisualHost,
                columns: string[]): IEnhancedScatterChartData {

                let dataView = defaultDataViewBuilder.getDataView(
                    EnhancedScatterChartData.DefaultSetOfColumns.concat(columns));

                return callConverterAndExpectExceptions(dataView, colorPalette, visualHost);
            }

            function callConverterAndExpectExceptions(
                dataView: DataView,
                colorPalette: IColorPalette,
                visualHost: IVisualHost,
                interactivityService?: IInteractivityService,
                categoryAxisProperties?: DataViewObject,
                valueAxisProperties?: DataViewObject): IEnhancedScatterChartData {

                let enhancedScatterChartData: IEnhancedScatterChartData;

                expect(() => {
                    enhancedScatterChartData = VisualClass.converter(
                        dataView,
                        colorPalette,
                        visualHost,
                        interactivityService,
                        categoryAxisProperties,
                        valueAxisProperties);
                }).not.toThrow();

                return enhancedScatterChartData;
            }

            function checkDataPointProperty(
                checkerCallback: CheckerCallback,
                dataViewBuilder: EnhancedScatterChartData,
                colorPalette: IColorPalette,
                visualHost: IVisualHost,
                columnNames: string[] = []): void {

                const dataView: DataView = dataViewBuilder.getDataView(
                    EnhancedScatterChartData.DefaultSetOfColumns.concat(columnNames));

                let enhancedScatterChartData: IEnhancedScatterChartData = VisualClass.converter(
                    dataView,
                    colorPalette,
                    visualHost);

                enhancedScatterChartData.dataPoints.forEach(checkerCallback);
            };

            function valueToBeDefinedAndNumber(value: number): void {
                expect(value).toBeDefined();
                expect(value).not.toBeNull();
                expect(value).not.toBeNaN();
            }
        });
    });
}
