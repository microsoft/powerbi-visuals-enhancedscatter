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

import "./../style/visual.less";

import * as d3 from "d3";
import * as _ from "lodash";
import * as $ from "jquery";

import powerbiVisualsApi from "powerbi-visuals-api";

// d3
type Selection<T1, T2 = T1> = d3.Selection<any, T1, any, T2>;
import ScaleLinear = d3.ScaleLinear;

// powerbi
import Fill = powerbiVisualsApi.Fill;
import DataView = powerbiVisualsApi.DataView;
import IViewport = powerbiVisualsApi.IViewport;
import ValueRange = powerbiVisualsApi.ValueRange;
import NumberRange = powerbiVisualsApi.NumberRange;
import DataViewObject = powerbiVisualsApi.DataViewObject;
import DataViewObjects = powerbiVisualsApi.DataViewObjects;
import DataViewCategorical = powerbiVisualsApi.DataViewCategorical;
import DataViewValueColumn = powerbiVisualsApi.DataViewValueColumn;
import DataViewValueColumns = powerbiVisualsApi.DataViewValueColumns;
import DataViewMetadataColumn = powerbiVisualsApi.DataViewMetadataColumn;
import DataViewValueColumnGroup = powerbiVisualsApi.DataViewValueColumnGroup;
import PrimitiveValue = powerbiVisualsApi.PrimitiveValue;
import ValueTypeDescriptor = powerbiVisualsApi.ValueTypeDescriptor;
import VisualObjectInstance = powerbiVisualsApi.VisualObjectInstance;
import DataViewCategoryColumn = powerbiVisualsApi.DataViewCategoryColumn;
import VisualObjectInstanceEnumeration = powerbiVisualsApi.VisualObjectInstanceEnumeration;
import EnumerateVisualObjectInstancesOptions = powerbiVisualsApi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstanceEnumerationObject = powerbiVisualsApi.VisualObjectInstanceEnumerationObject;

import IColorPalette = powerbiVisualsApi.extensibility.IColorPalette;
import VisualTooltipDataItem = powerbiVisualsApi.extensibility.VisualTooltipDataItem;
import ISandboxExtendedColorPalette = powerbiVisualsApi.extensibility.ISandboxExtendedColorPalette;
import IVisualEventService = powerbiVisualsApi.extensibility.IVisualEventService;
import ISelectionManager = powerbiVisualsApi.extensibility.ISelectionManager;

// powerbi.visuals
import ISelectionId = powerbiVisualsApi.visuals.ISelectionId;
import ISelectionIdBuilder = powerbiVisualsApi.visuals.ISelectionIdBuilder;

import IVisual = powerbiVisualsApi.extensibility.IVisual;
import IVisualHost = powerbiVisualsApi.extensibility.visual.IVisualHost;
import VisualUpdateOptions = powerbiVisualsApi.extensibility.visual.VisualUpdateOptions;
import VisualConstructorOptions = powerbiVisualsApi.extensibility.visual.VisualConstructorOptions;

// powerbi.extensibility.utils.dataview
import { dataRoleHelper as DataRoleHelper } from "powerbi-visuals-utils-dataviewutils";
import getMeasureIndexOfRole = DataRoleHelper.getMeasureIndexOfRole;
import getCategoryIndexOfRole = DataRoleHelper.getCategoryIndexOfRole;

// powerbi.extensibility.utils.svg
import * as SVGUtil from "powerbi-visuals-utils-svgutils";
import IMargin = SVGUtil.IMargin;
import ISize = SVGUtil.shapesInterfaces.ISize;
import ClassAndSelector = SVGUtil.CssConstants.ClassAndSelector;
import createClassAndSelector = SVGUtil.CssConstants.createClassAndSelector;
import manipulation = SVGUtil.manipulation;

// powerbi.extensibility.utils.chart
import { legend as legendModule, legendInterfaces, OpacityLegendBehavior, legendBehavior, axisInterfaces, axis, dataLabelInterfaces, dataLabelUtils, legendData } from "powerbi-visuals-utils-chartutils";
import ILegend = legendInterfaces.ILegend;
import LegendPosition = legendInterfaces.LegendPosition;
import LegendData = legendInterfaces.LegendData;
import LegendDataPoint = legendInterfaces.LegendDataPoint;
import IAxisProperties = axisInterfaces.IAxisProperties;
import TickLabelMargins = axisInterfaces.TickLabelMargins;
import ILabelLayout = dataLabelInterfaces.ILabelLayout;
import LabelTextProperties = dataLabelUtils.LabelTextProperties;
import getLabelFormattedText = dataLabelUtils.getLabelFormattedText;
import LegendBehavior = legendBehavior.LegendBehavior;
import createLegend = legendModule.createLegend;

// powerbi.extensibility.utils.type
import { pixelConverter as PixelConverter, double } from "powerbi-visuals-utils-typeutils";
import equalWithPrecision = double.equalWithPrecision;

// powerbi.extensibility.utils.interactivity
import { interactivityBaseService as interactivityService, interactivitySelectionService } from "powerbi-visuals-utils-interactivityutils";
import appendClearCatcher = interactivityService.appendClearCatcher;
import IInteractiveBehavior = interactivityService.IInteractiveBehavior;
import IInteractivityService = interactivityService.IInteractivityService;
import createInteractivitySelectionService = interactivitySelectionService.createInteractivitySelectionService;

// powerbi.extensibility.utils.formatting
import { textMeasurementService as tms, valueFormatter, textUtil } from "powerbi-visuals-utils-formattingutils";
import IValueFormatter = valueFormatter.IValueFormatter;
import textMeasurementService = tms;
import svgEllipsis = textMeasurementService.svgEllipsis;
import measureSvgTextWidth = textMeasurementService.measureSvgTextWidth;
import measureSvgTextHeight = textMeasurementService.measureSvgTextHeight;
import estimateSvgTextHeight = textMeasurementService.estimateSvgTextHeight;
import getTailoredTextOrDefault = textMeasurementService.getTailoredTextOrDefault;

// powerbi.extensibility.utils.color
import { ColorHelper } from "powerbi-visuals-utils-colorutils";

// powerbi.extensibility.utils.tooltip
import { createTooltipServiceWrapper, TooltipEventArgs, ITooltipServiceWrapper, TooltipEnabledDataPoint } from "powerbi-visuals-utils-tooltiputils";

import { BehaviorOptions, VisualBehavior } from "./behavior";
import { AxisSettings, DataPointSettings, LegendSettings, CategoryLabelsSettings, Settings } from "./settings";
import {
    EnhancedScatterChartData,
    EnhancedScatterChartDataPoint,
    EnhancedScatterChartMeasureMetadata,
    EnhancedScatterChartMeasureMetadataIndexes,
    EnhancedScatterDataRange,
    EnhancedScatterChartRadiusData,
    CalculateScaleAndDomainOptions,
    ChartAxesLabels,
    ElementProperties
} from "./dataInterfaces";
import * as gradientUtils from "./gradientUtils";
import { tooltipBuilder } from "./tooltipBuilder";
import { BaseDataPoint } from "powerbi-visuals-utils-interactivityutils/lib/interactivityBaseService";
import { yAxisPosition } from "./yAxisPosition";

const getEvent = () => require("d3-selection").event;

interface ShapeFunction {
    (value: any): string;
}

interface ShapeEntry {
    key: string;
    value: ShapeFunction;
}

interface TextProperties {
    text?: string;
    fontFamily: string;
    fontSize: string;
    fontWeight?: string;
    fontStyle?: string;
    fontVariant?: string;
    whiteSpace?: string;
}

export class EnhancedScatterChart implements IVisual {
    private static MaxMarginFactor: number = 0.25;

    private static AnimationDuration: number = 0;

    private static LabelMargin: number = 8;

    private static AxisGraphicsContextClassName: string = "axisGraphicsContext";
    private static ClassName: string = "enhancedScatterChart";
    private static MainGraphicsContextClassName: string = "mainGraphicsContext";
    private static AxisFontSize: number = 11;
    private static CrosshairTextMargin: number = 5;
    private static BubbleRadius = 3 * 2;

    private static MinSizeRange = 200;
    private static MaxSizeRange = 3000;

    private static AreaOf300By300Chart = 90000;

    private static DataLabelXOffset: number = 2;
    private static DataLabelYOffset: number = 1.8;

    private static TextProperties: TextProperties = {
        fontFamily: "helvetica, arial, sans-serif",
        fontSize: PixelConverter.toString(EnhancedScatterChart.AxisFontSize),
    };

    private static MinAmountOfTicks: number = 0;
    private static MinAmountOfCategories: number = 0;
    private static MinAmountOfValues: number = 0;

    private static MinIndex: number = 0;

    private static EmptyString: string = "";

    private static DefaultPositionOfCrosshair: number = 0;

    private static DefaultCrosshairYPosition: number = 1;
    private static CrosshairPrecision: number = 0.00001;
    private static CrosshairStartPosition: number = 0;
    private static CrosshairScaleFactor: number = 100;

    private static DefaultBackgroundPosition: number = 0;

    private static DefaultSelectionStateOfTheDataPoint: boolean = false;
    private static DefaultContentPosition: number = 8;

    private static DefaultColumnId: number = 0;

    private static MinAmountOfDataPointsInTheLegend: number = 1;

    private static isScrollbarVisible: boolean = false;

    private static DefaultBubbleRadius: number = 0;

    private static BubbleRadiusDivider: number = 2;

    private static DefaultBubbleRatio: number = 1;

    private static DefaultProjectedSize: number = 0;
    private static MinDelta: number = 0;
    private static ProjectedSizeFactor: number = 2;

    private static RadiusMultiplexer: number = 4;

    private static DefaultAxisXTickPadding: number = 5;
    private static DefaultAxisYTickPadding: number = 10;

    private static MinAnimationDuration: number = 0;

    private static DefaultPosition: number = 0;

    private static MinImageViewport: IViewport = {
        width: 0,
        height: 0
    };

    private static DefaultMargin: IMargin = {
        top: 8,
        right: 0,
        bottom: 25,
        left: 0
    };

    private static MinViewport: IViewport = {
        width: 0,
        height: 0
    };

    private static DefaultMarginValue: number = 1;

    private static MaxIterations: number = 2;
    private static DefaultNumIterations: number = 0;
    private static DefaultValueOfDoneWithMargins: boolean = false;

    private static AxisSide: number = 10;
    private static SecondYAxisSide: number = 15;
    private static SecondAxisSide: number = 20;
    private static XMaxOffset: number = 12;
    private static AdditionalXMaxOffset: number = 18;

    private static DefaultSizeMeasure: number = 0;

    private static EmptyDataValue: number = 0;

    private static DefaultCategoryAxisFillColor: string = "#333";

    private static TextAnchor: string = "middle";

    public static CrosshairCanvasSelector: ClassAndSelector = createClassAndSelector("crosshairCanvas");
    public static CrosshairLineSelector: ClassAndSelector = createClassAndSelector("crosshairLine");
    public static CrosshairVerticalLineSelector: ClassAndSelector = createClassAndSelector("crosshairVerticalLine");
    public static CrosshairHorizontalLineSelector: ClassAndSelector = createClassAndSelector("crosshairHorizontalLine");
    public static CrosshairTextSelector: ClassAndSelector = createClassAndSelector("crosshairText");

    public static SvgScrollableSelector: ClassAndSelector = createClassAndSelector("svgScrollable");

    public static ShowLinesOnAxisSelector: ClassAndSelector = createClassAndSelector("showLinesOnAxis");
    public static HideLinesOnAxisSelector: ClassAndSelector = createClassAndSelector("hideLinesOnAxis");

    public static XAxisSelector: ClassAndSelector = createClassAndSelector("x axis");
    public static YAxisSelector: ClassAndSelector = createClassAndSelector("y axis");

    public static TickSelector: ClassAndSelector = createClassAndSelector("tick");
    public static ZeroLineSelector: ClassAndSelector = createClassAndSelector("zero-line");

    private static DotSelector: ClassAndSelector = createClassAndSelector("dot");
    private static ImageSelector: ClassAndSelector = createClassAndSelector("img");

    private static ScatterMarkersSelector: ClassAndSelector = createClassAndSelector("ScatterMarkers");
    private static MarkerShapeSelector: ClassAndSelector = createClassAndSelector("markershape");
    private static MarkerImageSelector: ClassAndSelector = createClassAndSelector("markerimage");

    private static XAxisLabelSelector: ClassAndSelector = createClassAndSelector("xAxisLabel");
    private static YAxisLabelSelector: ClassAndSelector = createClassAndSelector("yAxisLabel");

    private static AxisLabelOffset: number = 2;
    private static YAxisLabelTransformRotate: string = "rotate(-90)";
    private static DefaultDY: string = "1em";

    private static DefaultAxisOffset: number = 0;

    private static MinAxisValue: number = 0;
    private static MaxAxisValue: number = 10;

    private static OuterPadding: number = 0;

    private static NumberSignZero: number = 0;
    private static NumberSignPositive: number = 1;

    public static MaxTranslateValue: number = 1e+25;
    public static MinTranslateValue: number = 1e-25;

    public static DefaultBubbleOpacity = 0.85;
    public static DimmedBubbleOpacity = 0.4;

    public static ColumnCategory: string = "Category";
    public static ColumnSeries: string = "Series";
    public static ColumnX: string = "X";
    public static ColumnY: string = "Y";
    public static ColumnSize: string = "Size";
    public static ColumnGradient: string = "Gradient";
    public static ColumnColorFill: string = "ColorFill";
    public static ColumnShape: string = "Shape";
    public static ColumnImage: string = "Image";
    public static ColumnRotation: string = "Rotation";
    public static ColumnBackdrop: string = "Backdrop";
    public static ColumnXStart: string = "XStart";
    public static ColumnXEnd: string = "XEnd";
    public static ColumnYStart: string = "YStart";
    public static ColumnYEnd: string = "YEnd";

    public static R2: number = 2;
    public static R3: number = 3;
    public static R5: number = 5;
    public static R6: number = 6;
    public static R10: number = 10;
    public static R12: number = 12;

    public static RMask: number = 1;
    public static RMaskResult: number = 0;

    private tooltipServiceWrapper: ITooltipServiceWrapper;

    private legend: ILegend;

    private element: HTMLElement;
    private svgScrollable: Selection<any>;
    private axisGraphicsContext: Selection<any>;
    private axisGraphicsContextScrollable: Selection<any>;
    private xAxisGraphicsContext: Selection<any>;
    private backgroundGraphicsContext: Selection<any>;
    private yAxisGraphicsContext: Selection<any>;
    private svg: Selection<any>;
    private mainGraphicsSVGSelection: Selection<any>;
    private mainGraphicsContext: Selection<any>;
    private clearCatcher: Selection<any>;
    private mainGraphicsG: Selection<any>;

    private crosshairCanvasSelection: Selection<any>;
    private crosshairVerticalLineSelection: Selection<any>;
    private crosshairHorizontalLineSelection: Selection<any>;
    private crosshairTextSelection: Selection<any>;

    private data: EnhancedScatterChartData;
    private dataView: DataView;

    private xAxisProperties: IAxisProperties;
    private yAxisProperties: IAxisProperties;
    private colorPalette: ISandboxExtendedColorPalette;

    private interactivityService: IInteractivityService<BaseDataPoint>;
    private eventService: IVisualEventService;
    private selectionManager: ISelectionManager;
    private yAxisOrientation: string;

    private scrollY: boolean = true;
    private scrollX: boolean = true;

    private visualHost: IVisualHost;

    private bottomMarginLimit: number;
    private leftRightMarginLimit: number;
    private isXScrollBarVisible: boolean;
    private isYScrollBarVisible: boolean;
    private ScrollBarWidth = 10;
    private svgDefaultImage: string = "";
    private oldBackdrop: string;

    private behavior: IInteractiveBehavior = new VisualBehavior();

    private keyArray: string[] = [];

    private _margin: IMargin;
    private get margin(): IMargin {
        return this._margin || { left: 0, right: 0, top: 0, bottom: 0 };
    }

    private set margin(value: IMargin) {
        this._margin = $.extend({}, value);
        this._viewportIn = EnhancedScatterChart.substractMargin(this.viewport, this.margin);
    }

    private _viewport: IViewport;
    private get viewport(): IViewport {
        return this._viewport || { width: 0, height: 0 };
    }

    private set viewport(value: IViewport) {
        this._viewport = $.extend({}, value);
        this._viewportIn = EnhancedScatterChart.substractMargin(this.viewport, this.margin);
    }

    private _viewportIn: IViewport;
    private get viewportIn(): IViewport {
        return this._viewportIn || this.viewport;
    }

    private get legendViewport(): IViewport {
        return this.legend.getMargins();
    }

    private static substractMargin(viewport: IViewport, margin: IMargin): IViewport {
        return {
            width: Math.max(
                viewport.width - (margin.left + margin.right),
                EnhancedScatterChart.MinViewport.width),
            height: Math.max(
                viewport.height - (margin.top + margin.bottom),
                EnhancedScatterChart.MinViewport.height)
        };
    }

    private static getCustomSymbolType(shape: any): ShapeFunction {
        const customSymbolTypes = d3.map<ShapeFunction>({
            "circle": (size: number) => {
                const r: number = Math.sqrt(size / Math.PI);

                return `M0,${r}A${r},${r} 0 1,1 0,${-r}A${r},${r} 0 1,1 0,${r}Z`;
            },

            "cross": (size: number) => {
                const r: number = Math.sqrt(size / EnhancedScatterChart.R5) / EnhancedScatterChart.R2;

                return `M${-EnhancedScatterChart.R3 * r},${-r}H${-r}V${-EnhancedScatterChart.R3 * r}H${r}V${-r}H${EnhancedScatterChart.R3 * r}V${r}H${r}V${EnhancedScatterChart.R3 * r}H${-r}V${r}H${-EnhancedScatterChart.R3 * r}Z`;
            },

            "diamond": (size: number) => {
                const ry: number = Math.sqrt(size / (EnhancedScatterChart.R2 * Math.tan(Math.PI / EnhancedScatterChart.R6))),
                    rx: number = ry * Math.tan(Math.PI / EnhancedScatterChart.R6);

                return `M0,${-ry}L${rx},0 0,${ry} ${-rx},0Z`;
            },

            "square": (size: number) => {
                const r: number = Math.sqrt(size) / EnhancedScatterChart.R2;

                return `M${-r},${-r}L${r},${-r} ${r},${r} ${-r},${r}Z`;
            },

            "triangle-up": (size: number) => {
                const rx: number = Math.sqrt(size / Math.sqrt(EnhancedScatterChart.R3)),
                    ry: number = rx * Math.sqrt(EnhancedScatterChart.R3) / EnhancedScatterChart.R2;

                return `M0,${-ry}L${rx},${ry} ${-rx},${ry}Z`;
            },

            "triangle-down": (size: number) => {
                const rx: number = Math.sqrt(size / Math.sqrt(EnhancedScatterChart.R3)),
                    ry: number = rx * Math.sqrt(EnhancedScatterChart.R3) / EnhancedScatterChart.R2;

                return `M0,${ry}L${rx},${-ry} ${-rx},${-ry}Z`;
            },

            "star": (size: number) => {
                const outerRadius: number = Math.sqrt(size / EnhancedScatterChart.R2),
                    innerRadius: number = Math.sqrt(size / EnhancedScatterChart.R10),
                    angle: number = Math.PI / EnhancedScatterChart.R5;

                let results: string = "";
                for (let i: number = 0; i < EnhancedScatterChart.R10; i++) {
                    // Use outer or inner radius depending on what iteration we are in.
                    const r: number = (i & EnhancedScatterChart.RMask) === EnhancedScatterChart.RMaskResult ? outerRadius : innerRadius;
                    const currX: number = Math.cos(i * angle) * r, currY: number = Math.sin(i * angle) * r;
                    // Our first time we simply append the coordinates, subsequet times we append a ", " to distinguish each coordinate pair.
                    if (i === 0) {
                        results = `M${currX},${currY}L`;
                    } else {
                        results += ` ${currX},${currY}`;
                    }
                }

                return `${results}Z`;
            },

            "hexagon": (size: number) => {
                const r: number = Math.sqrt(size / (EnhancedScatterChart.R6 * Math.sqrt(EnhancedScatterChart.R3))),
                    r2: number = Math.sqrt(size / (EnhancedScatterChart.R2 * Math.sqrt(EnhancedScatterChart.R3)));

                return `M0,${EnhancedScatterChart.R2 * r}L${-r2},${r} ${-r2},${-r} 0,${-EnhancedScatterChart.R2 * r} ${r2},${-r} ${r2},${r}Z`;
            },

            "x": (size: number) => {
                const r: number = Math.sqrt(size / EnhancedScatterChart.R10);

                return `M0,${r}L${-r},${EnhancedScatterChart.R2 * r} ${-EnhancedScatterChart.R2 * r},${r} ${-r},0 ${-EnhancedScatterChart.R2 * r},${-r} ${-r},${-EnhancedScatterChart.R2 * r} 0,${-r} ${r},${-EnhancedScatterChart.R2 * r} ${EnhancedScatterChart.R2 * r},${-r} ${r},0 ${EnhancedScatterChart.R2 * r},${r} ${r},${EnhancedScatterChart.R2 * r}Z`;
            },

            "uparrow": (size: number) => {
                const r: number = Math.sqrt(size / EnhancedScatterChart.R12);

                return `M${r},${EnhancedScatterChart.R3 * r}L${-r},${EnhancedScatterChart.R3 * r} ${-r},${-r} ${-EnhancedScatterChart.R2 * r},${-r} 0,${-EnhancedScatterChart.R3 * r} ${EnhancedScatterChart.R2 * r},${-r} ${r},${-r}Z`;
            },

            "downarrow": (size: number) => {
                const r: number = Math.sqrt(size / EnhancedScatterChart.R12);

                return `M0,${EnhancedScatterChart.R3 * r}L${(-EnhancedScatterChart.R2 * r)},${r} ${-r},${r} ${-r},${-EnhancedScatterChart.R3 * r} ${r},${-EnhancedScatterChart.R3 * r} ${r},${r} ${EnhancedScatterChart.R2 * r},${r}Z`;
            }
        });

        const defaultValue: ShapeFunction = customSymbolTypes.entries()[0].value;
        if (!shape) {
            return defaultValue;
        } else if (isNaN(shape)) {
            return customSymbolTypes[shape && shape.toString().toLowerCase()] || defaultValue;
        }
        const result: ShapeEntry = customSymbolTypes.entries()[Math.floor(shape)];

        return result ? result.value : defaultValue;
    }

    private static getDefinedNumberValue(value: any): number {
        return isNaN(value) || value === null
            ? EnhancedScatterChart.DefaultPosition
            : value;
    }

    private static getDefinedNumberByCategoryId(column: DataViewValueColumn, index: number, valueTypeDescriptor: ValueTypeDescriptor): number {
        const columnValue = column.values[index];
        const isDate = valueTypeDescriptor && valueTypeDescriptor.dateTime;
        const value = isDate ? new Date(<any>columnValue) : columnValue;

        return column
            && column.values
            && !(columnValue === null)
            && !isNaN(<number>value)
            ? Number(value)
            : null;
    }

    constructor(options: VisualConstructorOptions) {
        if (window.location !== window.parent.location) {
            require("core-js/stable");
        }

        this.init(options);
        this.handleContextMenu();
    }

    public init(options: VisualConstructorOptions): void {
        this.element = options.element;
        this.visualHost = options.host;
        this.colorPalette = options.host.colorPalette;

        this.tooltipServiceWrapper = createTooltipServiceWrapper(
            this.visualHost.tooltipService,
            this.element
        );

        this.selectionManager = this.visualHost.createSelectionManager();
        this.eventService = options.host.eventService;

        this.margin = {
            top: EnhancedScatterChart.DefaultMarginValue,
            right: EnhancedScatterChart.DefaultMarginValue,
            bottom: EnhancedScatterChart.DefaultMarginValue,
            left: EnhancedScatterChart.DefaultMarginValue
        };

        this.yAxisOrientation = yAxisPosition.left;

        this.adjustMargins();

        this.svg = d3.select(this.element)
            .append("svg")
            .classed(EnhancedScatterChart.ClassName, true);

        this.axisGraphicsContext = this.svg
            .append("g")
            .classed(EnhancedScatterChart.AxisGraphicsContextClassName, true);

        this.svgScrollable = this.svg
            .append("svg")
            .classed(EnhancedScatterChart.SvgScrollableSelector.className, true);

        this.axisGraphicsContextScrollable = this.svgScrollable
            .append("g")
            .classed(EnhancedScatterChart.AxisGraphicsContextClassName, true);

        this.clearCatcher = appendClearCatcher(this.axisGraphicsContextScrollable);

        const axisGroup: Selection<any> = this.scrollY
            ? this.axisGraphicsContextScrollable
            : this.axisGraphicsContext;

        this.backgroundGraphicsContext = this.axisGraphicsContext.append("svg:image");

        this.xAxisGraphicsContext = this.scrollY
            ? this.axisGraphicsContext
                .append("g")
                .classed(EnhancedScatterChart.XAxisSelector.className, true)
            : this.axisGraphicsContextScrollable
                .append("g")
                .classed(EnhancedScatterChart.XAxisSelector.className, true);

        this.yAxisGraphicsContext = axisGroup
            .append("g")
            .classed(EnhancedScatterChart.YAxisSelector.className, true);

        this.xAxisGraphicsContext.classed(
            EnhancedScatterChart.ShowLinesOnAxisSelector.className,
            this.scrollY
        );

        this.yAxisGraphicsContext.classed(
            EnhancedScatterChart.ShowLinesOnAxisSelector.className,
            this.scrollX
        );

        this.xAxisGraphicsContext.classed(
            EnhancedScatterChart.HideLinesOnAxisSelector.className,
            !this.scrollY
        );

        this.yAxisGraphicsContext.classed(
            EnhancedScatterChart.HideLinesOnAxisSelector.className,
            !this.scrollX
        );

        this.interactivityService = createInteractivitySelectionService(this.visualHost);

        this.legend = createLegend(
            this.element,
            false,
            this.interactivityService,
            true,
            undefined,
            this.colorPalette.isHighContrast
                ? new OpacityLegendBehavior()
                : new LegendBehavior(),
        );

        this.mainGraphicsG = this.axisGraphicsContextScrollable
            .append("g")
            .classed(EnhancedScatterChart.MainGraphicsContextClassName, true);

        this.mainGraphicsSVGSelection = this.mainGraphicsG.append("svg");
        this.mainGraphicsContext = this.mainGraphicsSVGSelection.append("g");
    }

    public handleContextMenu() {
        this.svg.on('contextmenu', () => {
            const mouseEvent: MouseEvent = getEvent();
            const eventTarget: EventTarget = mouseEvent.target;
            let dataPoint: any = d3.select(<d3.BaseType>eventTarget).datum();
            this.selectionManager.showContextMenu(dataPoint ? dataPoint.identity : {}, {
                x: mouseEvent.clientX,
                y: mouseEvent.clientY
            });
            mouseEvent.preventDefault();
        });
    }

    private adjustMargins(): void {
        // Adjust margins if ticks are not going to be shown on either axis
        const xAxis: JQuery = $(this.element).find(EnhancedScatterChart.XAxisSelector.selectorName);

        if (axis.getRecommendedNumberOfTicksForXAxis(this.viewportIn.width) === EnhancedScatterChart.MinAmountOfTicks
            && axis.getRecommendedNumberOfTicksForYAxis(this.viewportIn.height) === EnhancedScatterChart.MinAmountOfTicks
        ) {

            this.margin = {
                top: EnhancedScatterChart.DefaultMarginValue,
                right: EnhancedScatterChart.DefaultMarginValue,
                bottom: EnhancedScatterChart.DefaultMarginValue,
                left: EnhancedScatterChart.DefaultMarginValue
            };

            xAxis.hide();
        } else {
            xAxis.show();
        }
    }

    private static getXGrouping(
        categories: DataViewCategoryColumn[]
    ): DataViewCategoryColumn {
        return <DataViewCategoryColumn>categories.reduce(
            (previousValue: DataViewCategoryColumn, currentValue: DataViewCategoryColumn) => {
                if (!previousValue
                    && currentValue.source.roles.X
                    && currentValue.source.roles["X as Grouping"]
                ) {
                    return currentValue;
                } else {
                    return previousValue;
                }
            },
            undefined
        );
    }

    private static isXGroupingExists(categories: DataViewCategoryColumn[]): boolean {
        const xGrouping = EnhancedScatterChart.getXGrouping(categories);
        return typeof xGrouping !== undefined && !!xGrouping.values;
    }

    public parseData(
        dataView: DataView,
        colorPalette: IColorPalette,
        visualHost: IVisualHost,
        interactivityService: IInteractivityService<BaseDataPoint>,
    ): EnhancedScatterChartData {
        const settings: Settings = this.parseSettings(dataView, new ColorHelper(colorPalette));

        if (!this.isDataViewValid(dataView)) {
            return this.getDefaultData(settings);
        }

        let categoryValues: any[],
            categoryFormatter: IValueFormatter,
            categoryObjects: DataViewObjects[],
            dataViewCategorical: DataViewCategorical = dataView.categorical,
            categories: DataViewCategoryColumn[] = dataViewCategorical.categories || [],
            dataValues: DataViewValueColumns = dataViewCategorical.values,
            hasDynamicSeries: boolean = !!dataValues.source,
            grouped: DataViewValueColumnGroup[] = dataValues.grouped(),
            dvSource: DataViewMetadataColumn = dataValues.source,
            scatterMetadata: EnhancedScatterChartMeasureMetadata = EnhancedScatterChart.getMetadata(categories, grouped),
            categoryIndex: number = scatterMetadata.idx.category,
            useShape: boolean = scatterMetadata.idx.image >= EnhancedScatterChart.MinIndex,
            useCustomColor: boolean = scatterMetadata.idx.colorFill >= EnhancedScatterChart.MinIndex;

        if (dataViewCategorical.categories
            && dataViewCategorical.categories.length > 0
            && dataViewCategorical.categories[categoryIndex]
        ) {
            const mainCategory: DataViewCategoryColumn = dataViewCategorical.categories[categoryIndex];
            categoryValues = mainCategory.values;
            categoryFormatter = valueFormatter.create({
                format: valueFormatter.getFormatStringByColumn(mainCategory.source),
                value: categoryValues[0],
                value2: categoryValues[categoryValues.length - 1]
            });

            categoryObjects = mainCategory.objects;
        }
        else {
            categoryValues = [null];
            // creating default formatter for null value (to get the right string of empty value from the locale)
            categoryFormatter = valueFormatter.createDefaultFormatter(null);
        }

        const sizeRange: ValueRange<number> = EnhancedScatterChart.getSizeRangeForGroups(
            grouped,
            scatterMetadata.idx.size
        );

        settings.fillPoint.isHidden = !!(sizeRange && sizeRange.min);

        const colorHelper: ColorHelper = new ColorHelper(
            colorPalette,
            {
                objectName: "dataPoint",
                propertyName: "fill"
            },
            hasDynamicSeries
                ? undefined
                : settings.dataPoint.defaultColor
        );

        const dataPoints: EnhancedScatterChartDataPoint[] = this.createDataPoints(
            visualHost,
            dataValues,
            scatterMetadata,
            categories,
            categoryValues,
            categoryFormatter,
            categoryObjects,
            hasDynamicSeries,
            colorHelper,
            settings,
        );

        if (interactivityService) {
            interactivityService.applySelectionStateToData(dataPoints);
        }

        const legendParseResult = this.parseLegend(visualHost, dataValues, dvSource, categories, categoryIndex, colorHelper, hasDynamicSeries);
        let legendDataPoints: LegendDataPoint[] = legendParseResult.legendDataPoints;
        let legendTitle: string = legendParseResult.legendTitle;

        this.changeSettingsAndMetadata(dataPoints, scatterMetadata, settings, legendTitle);
        const hasGradientRole: boolean = gradientUtils.hasGradientRole(dataViewCategorical);

        return {
            settings,
            dataPoints,
            legendDataPoints,
            sizeRange,
            hasGradientRole,
            hasDynamicSeries,
            useShape,
            useCustomColor,
            xCol: scatterMetadata.cols.x,
            yCol: scatterMetadata.cols.y,
            axesLabels: scatterMetadata.axesLabels,
            selectedIds: [],
            size: scatterMetadata.cols.size,
        };
    }

    private changeSettingsAndMetadata(
        dataPoints: EnhancedScatterChartDataPoint[],
        scatterMetadata: EnhancedScatterChartMeasureMetadata,
        settings: Settings,
        legendTitle: string): void {

        settings.legend.titleText = settings.legend.titleText || legendTitle;
        if (!settings.categoryAxis.showAxisTitle) {
            scatterMetadata.axesLabels.x = null;
        }

        if (!settings.valueAxis.showAxisTitle) {
            scatterMetadata.axesLabels.y = null;
        }

        if (dataPoints && dataPoints[0]) {
            const dataPoint: EnhancedScatterChartDataPoint = dataPoints[0];

            if (dataPoint.backdrop != null) {
                settings.backdrop.show = true;
                settings.backdrop.url = dataPoint.backdrop;
            }

            if (dataPoint.xStart != null) {
                settings.categoryAxis.start = dataPoint.xStart;
            }

            if (dataPoint.xEnd != null) {
                settings.categoryAxis.end = dataPoint.xEnd;
            }

            if (dataPoint.yStart != null) {
                settings.valueAxis.start = dataPoint.yStart;
            }

            if (dataPoint.yEnd != null) {
                settings.valueAxis.end = dataPoint.yEnd;
            }
        }
    }

    private parseLegend(
        visualHost: IVisualHost,
        dataValues: DataViewValueColumns,
        dvSource: DataViewMetadataColumn,
        categories: DataViewCategoryColumn[],
        categoryIndex: number,
        colorHelper: ColorHelper,
        hasDynamicSeries: boolean): { legendDataPoints: LegendDataPoint[], legendTitle: string } {
        let legendDataPoints: LegendDataPoint[] = [];

        if (hasDynamicSeries) {
            const formatString: string = valueFormatter.getFormatStringByColumn(dvSource);

            legendDataPoints = EnhancedScatterChart.createSeriesLegend(
                visualHost,
                dataValues,
                formatString,
                colorHelper,
            );
        }

        let legendTitle: string = dataValues && dvSource
            ? dvSource.displayName
            : EnhancedScatterChart.EmptyString;

        if (!legendTitle) {
            legendTitle = categories
                && categories[categoryIndex]
                && categories[categoryIndex].source
                && categories[categoryIndex].source.displayName
                ? categories[categoryIndex].source.displayName
                : EnhancedScatterChart.EmptyString;
        }

        return { legendDataPoints, legendTitle };
    }

    private isDataViewValid(dataView: DataView): boolean {
        return !!(dataView && dataView.metadata);
    }

    private parseSettings(dataView: DataView, colorHelper: ColorHelper): Settings {
        const settings: Settings = <Settings>Settings.parse(dataView);

        settings.dataPoint.defaultColor = colorHelper.getHighContrastColor(
            "foreground",
            settings.dataPoint.defaultColor,
        );

        settings.dataPoint.strokeWidth = colorHelper.isHighContrast
            ? 2
            : settings.dataPoint.strokeWidth;

        settings.legend.labelColor = colorHelper.getHighContrastColor(
            "foreground",
            settings.legend.labelColor
        );

        settings.categoryLabels.show = settings.categoryLabels.show || colorHelper.isHighContrast;

        settings.categoryLabels.color = colorHelper.getHighContrastColor(
            "foreground",
            settings.categoryLabels.color
        );

        settings.fillPoint.show = colorHelper.isHighContrast
            ? true
            : settings.fillPoint.show;

        settings.outline.show = colorHelper.isHighContrast
            ? false
            : settings.outline.show;

        settings.crosshair.color = colorHelper.getHighContrastColor(
            "foreground",
            settings.crosshair.color
        );

        this.parseAxisSettings(settings.categoryAxis, colorHelper);
        this.parseAxisSettings(settings.valueAxis, colorHelper);

        settings.backdrop.show = settings.backdrop.show && !colorHelper.isHighContrast;

        return settings;
    }

    private parseAxisSettings(axisSettings: AxisSettings, colorHelper: ColorHelper): void {
        axisSettings.axisColor = colorHelper.getHighContrastColor(
            "foreground",
            axisSettings.axisColor
        );

        axisSettings.zeroLineColor = colorHelper.getHighContrastColor(
            "foreground",
            axisSettings.zeroLineColor
        );

        axisSettings.lineColor = colorHelper.getHighContrastColor(
            "foreground",
            axisSettings.lineColor
        );
    }

    private static createSeriesLegend(
        visualHost: IVisualHost,
        dataValues: DataViewValueColumns,
        formatString: string,
        colorHelper: ColorHelper,
    ): LegendDataPoint[] {
        const legendItems: LegendDataPoint[] = [];

        const grouped: DataViewValueColumnGroup[] = dataValues.grouped();

        for (let i: number = 0, len: number = grouped.length; i < len; i++) {
            const grouping: DataViewValueColumnGroup = grouped[i];

            const color: string = colorHelper.getColorForSeriesValue(
                grouping.objects,
                grouping.name,
                "foreground"
            );

            const selectionId: ISelectionId = visualHost.createSelectionIdBuilder()
                .withSeries(dataValues, grouping)
                .createSelectionId();

            legendItems.push({
                color,
                label: valueFormatter.format(grouping.name, formatString),
                identity: selectionId,
                selected: EnhancedScatterChart.DefaultSelectionStateOfTheDataPoint
            });
        }

        return legendItems;
    }

    private static getSizeRangeForGroups(
        dataViewValueGroups: DataViewValueColumnGroup[],
        sizeColumnIndex: number
    ): NumberRange {

        const result: NumberRange = {};

        if (dataViewValueGroups) {
            dataViewValueGroups.forEach((group) => {
                const sizeColumn: DataViewValueColumn = EnhancedScatterChart.getMeasureValue(
                    sizeColumnIndex,
                    group.values);

                const currentRange: NumberRange = axis.getRangeForColumn(sizeColumn);

                if (result.min == null || result.min > currentRange.min) {
                    result.min = currentRange.min;
                }

                if (result.max == null || result.max < currentRange.max) {
                    result.max = currentRange.max;
                }
            });
        }

        return result;
    }

    private static getMetadata(
        categories: DataViewCategoryColumn[],
        grouped: DataViewValueColumnGroup[],
    ): EnhancedScatterChartMeasureMetadata {
        let categoryIndex: number = getCategoryIndexOfRole(categories, EnhancedScatterChart.ColumnCategory),
            colorFillIndex: number = getCategoryIndexOfRole(categories, EnhancedScatterChart.ColumnColorFill),
            imageIndex: number = getCategoryIndexOfRole(categories, EnhancedScatterChart.ColumnImage),
            backdropIndex: number = getCategoryIndexOfRole(categories, EnhancedScatterChart.ColumnBackdrop),
            xIndex: number = getMeasureIndexOfRole(grouped, EnhancedScatterChart.ColumnX),
            yIndex: number = getMeasureIndexOfRole(grouped, EnhancedScatterChart.ColumnY),
            sizeIndex: number = getMeasureIndexOfRole(grouped, EnhancedScatterChart.ColumnSize),
            shapeIndex: number = getMeasureIndexOfRole(grouped, EnhancedScatterChart.ColumnShape),
            rotationIndex: number = getMeasureIndexOfRole(grouped, EnhancedScatterChart.ColumnRotation),
            xStartIndex: number = getMeasureIndexOfRole(grouped, EnhancedScatterChart.ColumnXStart),
            xEndIndex: number = getMeasureIndexOfRole(grouped, EnhancedScatterChart.ColumnXEnd),
            yStartIndex: number = getMeasureIndexOfRole(grouped, EnhancedScatterChart.ColumnYStart),
            yEndIndex: number = getMeasureIndexOfRole(grouped, EnhancedScatterChart.ColumnYEnd),
            xCol: DataViewMetadataColumn,
            yCol: DataViewMetadataColumn,
            sizeCol: DataViewMetadataColumn,
            xAxisLabel: string = EnhancedScatterChart.EmptyString,
            yAxisLabel: string = EnhancedScatterChart.EmptyString;

        if (grouped && grouped.length) {
            const firstGroup: DataViewValueColumnGroup = grouped[0];

            if (xIndex >= 0) {
                xCol = firstGroup.values[xIndex].source;
                xAxisLabel = firstGroup.values[xIndex].source.displayName;
            }

            if (yIndex >= 0) {
                yCol = firstGroup.values[yIndex].source;
                yAxisLabel = firstGroup.values[yIndex].source.displayName;
            }

            if (sizeIndex >= 0) {
                sizeCol = firstGroup.values[sizeIndex].source;
            }
        }

        return {
            idx: {
                category: categoryIndex,
                x: xIndex,
                y: yIndex,
                size: sizeIndex,
                colorFill: colorFillIndex,
                shape: shapeIndex,
                image: imageIndex,
                rotation: rotationIndex,
                backdrop: backdropIndex,
                xStart: xStartIndex,
                xEnd: xEndIndex,
                yStart: yStartIndex,
                yEnd: yEndIndex
            },
            cols: {
                x: xCol,
                y: yCol,
                size: sizeCol
            },
            axesLabels: {
                x: xAxisLabel,
                y: yAxisLabel
            }
        };
    }

    public static CREATE_LAZY_FORMATTED_CATEGORY(formatter: IValueFormatter, value: string): () => string {
        return () => formatter.format(value);
    }

    public static displayTimestamp = (
        timestamp: number
    ): string => {
        const value = new Date(timestamp);
        return valueFormatter.format(value, "dd MMM yyyy");
    }

    public static IS_DATE_TYPE_COLUMN(
        source: DataViewMetadataColumn
    ): boolean {
        return (source && source.type && source.type.dateTime);
    }

    private calculateMeasures(
        seriesValues: DataViewValueColumn[],
        indicies: EnhancedScatterChartMeasureMetadataIndexes,
        categories: DataViewCategoryColumn[]): { [propertyName: string]: DataViewValueColumn } {
        const measureX: DataViewValueColumn = EnhancedScatterChart.getMeasureValue(
            indicies.x,
            seriesValues
        );

        const measureY: DataViewValueColumn = EnhancedScatterChart.getMeasureValue(
            indicies.y,
            seriesValues
        );

        const measureSize: DataViewValueColumn = EnhancedScatterChart.getMeasureValue(
            indicies.size,
            seriesValues
        );

        const measureShape: DataViewValueColumn = EnhancedScatterChart.getMeasureValue(
            indicies.shape,
            seriesValues
        );

        const measureRotation: DataViewValueColumn = EnhancedScatterChart.getMeasureValue(
            indicies.rotation,
            seriesValues
        );

        const measureXStart: DataViewValueColumn = EnhancedScatterChart.getMeasureValue(
            indicies.xStart,
            seriesValues
        );

        const measureXEnd: DataViewValueColumn = EnhancedScatterChart.getMeasureValue(
            indicies.xEnd,
            seriesValues
        );

        const measureYStart: DataViewValueColumn = EnhancedScatterChart.getMeasureValue(
            indicies.yStart,
            seriesValues
        );

        const measureYEnd: DataViewValueColumn = EnhancedScatterChart.getMeasureValue(
            indicies.yEnd,
            seriesValues
        );

        return {
            measureX,
            measureY,
            measureSize,
            measureShape,
            measureRotation,
            measureXStart,
            measureXEnd,
            measureYStart,
            measureYEnd,
            measureColorFill: categories[indicies.colorFill],
            measureImage: categories[indicies.image],
            measureBackdrop: categories[indicies.backdrop]
        };
    }

    private changeSeriesData(
        measures: { [propertyName: string]: DataViewValueColumn },
        seriesData: tooltipBuilder.TooltipSeriesDataItem[],
        xVal: PrimitiveValue,
        yVal: PrimitiveValue,
        categoryIdx: number) {
        if (measures.measureX) {
            seriesData.push({
                value: EnhancedScatterChart.IS_DATE_TYPE_COLUMN(measures.measureX.source)
                    ? EnhancedScatterChart.displayTimestamp(<number>xVal)
                    : xVal,
                metadata: measures.measureX
            });
        }

        if (measures.measureY) {
            seriesData.push({
                value: EnhancedScatterChart.IS_DATE_TYPE_COLUMN(measures.measureY.source)
                    ? EnhancedScatterChart.displayTimestamp(<number>yVal)
                    : yVal,
                metadata: measures.measureY
            });
        }

        if (measures.measureSize && measures.measureSize.values
            && measures.measureSize.values.length > EnhancedScatterChart.MinAmountOfValues) {
            seriesData.push({
                value: measures.measureSize.values[categoryIdx],
                metadata: measures.measureSize
            });
        }

        if (measures.measureColorFill && measures.measureColorFill.values
            && measures.measureColorFill.values.length > EnhancedScatterChart.MinAmountOfValues) {
            seriesData.push({
                value: measures.measureColorFill.values[categoryIdx],
                metadata: measures.measureColorFill
            });
        }

        if (measures.measureShape && measures.measureShape.values
            && measures.measureShape.values.length > EnhancedScatterChart.MinAmountOfValues) {

            seriesData.push({
                value: measures.measureShape.values[categoryIdx],
                metadata: measures.measureShape
            });
        }

        if (measures.measureImage && measures.measureImage.values
            && measures.measureImage.values.length > EnhancedScatterChart.MinAmountOfValues) {
            seriesData.push({
                value: measures.measureImage.values[categoryIdx],
                metadata: measures.measureImage
            });
        }

        if (measures.measureRotation && measures.measureRotation.values
            && measures.measureRotation.values.length > EnhancedScatterChart.MinAmountOfValues) {
            seriesData.push({
                value: measures.measureRotation.values[categoryIdx],
                metadata: measures.measureRotation
            });
        }

        if (measures.measureBackdrop && measures.measureBackdrop.values
            && measures.measureBackdrop.values.length > EnhancedScatterChart.MinAmountOfValues) {
            seriesData.push({
                value: measures.measureBackdrop.values[categoryIdx],
                metadata: measures.measureBackdrop
            });
        }

        if (measures.measureXStart && measures.measureXStart.values
            && measures.measureXStart.values.length > EnhancedScatterChart.MinAmountOfValues) {
            seriesData.push({
                value: measures.measureXStart.values[categoryIdx],
                metadata: measures.measureXStart
            });
        }

        if (measures.measureXEnd && measures.measureXEnd.values
            && measures.measureXEnd.values.length > EnhancedScatterChart.MinAmountOfValues) {
            seriesData.push({
                value: measures.measureXEnd.values[categoryIdx],
                metadata: measures.measureXEnd
            });
        }

        if (measures.measureYStart && measures.measureYStart.values
            && measures.measureYStart.values.length > EnhancedScatterChart.MinAmountOfValues) {
            seriesData.push({
                value: measures.measureYStart.values[categoryIdx],
                metadata: measures.measureYStart
            });
        }

        if (measures.measureYEnd && measures.measureYEnd.values
            && measures.measureYEnd.values.length > EnhancedScatterChart.MinAmountOfValues) {
            seriesData.push({
                value: measures.measureYEnd.values[categoryIdx],
                metadata: measures.measureYEnd
            });
        }
    }

    private getValuesFromDataViewValueColumnById(measures, categoryIdx: number): { [property: string]: any } {
        const size: number = EnhancedScatterChart.getValueFromDataViewValueColumnById(measures.measureSize, categoryIdx);
        const colorFill: string = EnhancedScatterChart.getValueFromDataViewValueColumnById(measures.measureColorFill, categoryIdx);

        const shapeSymbolType: ShapeFunction = EnhancedScatterChart.getCustomSymbolType(
            EnhancedScatterChart.getValueFromDataViewValueColumnById(measures.measureShape, categoryIdx));

        const image: string = EnhancedScatterChart.getValueFromDataViewValueColumnById(measures.measureImage, categoryIdx);
        const rotation: number = EnhancedScatterChart.getNumberFromDataViewValueColumnById(measures.measureRotation, categoryIdx);
        const backdrop: string = EnhancedScatterChart.getValueFromDataViewValueColumnById(measures.measureBackdrop, categoryIdx);
        const xStart: number = EnhancedScatterChart.getValueFromDataViewValueColumnById(measures.measureXStart, categoryIdx);
        const xEnd: number = EnhancedScatterChart.getValueFromDataViewValueColumnById(measures.measureXEnd, categoryIdx);
        const yStart: number = EnhancedScatterChart.getValueFromDataViewValueColumnById(measures.measureYStart, categoryIdx);
        const yEnd: number = EnhancedScatterChart.getValueFromDataViewValueColumnById(measures.measureYEnd, categoryIdx);

        return {
            size,
            colorFill,
            shapeSymbolType,
            image,
            rotation,
            backdrop,
            xStart,
            xEnd,
            yStart,
            yEnd
        };
    }

    private createDataPoints(
        visualHost: IVisualHost,
        dataValues: DataViewValueColumns,
        metadata: EnhancedScatterChartMeasureMetadata,
        categories: DataViewCategoryColumn[],
        categoryValues: any[],
        categoryFormatter: IValueFormatter,
        categoryObjects: DataViewObjects[],
        hasDynamicSeries: boolean,
        colorHelper: ColorHelper,
        settings: Settings
    ): EnhancedScatterChartDataPoint[] {
        const dataPoints: EnhancedScatterChartDataPoint[] = [];
        const indicies: EnhancedScatterChartMeasureMetadataIndexes = metadata.idx;
        const dataValueSource: DataViewMetadataColumn = dataValues.source;
        const grouped: DataViewValueColumnGroup[] = dataValues.grouped();

        for (let categoryIdx: number = 0, ilen: number = categoryValues.length; categoryIdx < ilen; categoryIdx++) {
            const categoryValue: any = categoryValues[categoryIdx];

            for (let seriesIdx: number = 0, len: number = grouped.length; seriesIdx < len; seriesIdx++) {
                const grouping: DataViewValueColumnGroup = grouped[seriesIdx];
                const seriesValues: DataViewValueColumn[] = grouping.values;
                let measures: { [propertyName: string]: DataViewValueColumn } = this.calculateMeasures(seriesValues, indicies, categories);

                // TO BE CHANGED: need to update (refactor) these lines below.
                const xVal: PrimitiveValue = EnhancedScatterChart.getDefinedNumberByCategoryId(measures.measureX, categoryIdx, metadata.cols.x.type);
                const yVal: PrimitiveValue = EnhancedScatterChart.getDefinedNumberByCategoryId(measures.measureY, categoryIdx, metadata.cols.y.type);
                const hasNullValue: boolean = (xVal == null) || (yVal == null);

                if (hasNullValue) {
                    continue;
                }

                const { size, colorFill, shapeSymbolType, image, rotation, backdrop, xStart, xEnd, yStart, yEnd } =
                    this.getValuesFromDataViewValueColumnById(measures, categoryIdx);
                const parsedColorFill: string = colorFill
                    ? colorHelper.getHighContrastColor("foreground", d3.rgb(colorFill).toString())
                    : undefined;

                let color: string;
                if (hasDynamicSeries) {
                    color = colorHelper.getColorForSeriesValue(grouping.objects, grouping.name, "foreground");
                } else {
                    // If we have no Size measure then use a blank query name
                    const measureSource: string = measures.measureSize != null
                        ? measures.measureSize.source.queryName
                        : EnhancedScatterChart.EmptyString;

                    color = colorHelper.getColorForMeasure(categoryObjects && categoryObjects[categoryIdx], measureSource, "foreground");
                }

                let category: DataViewCategoryColumn = categories && categories.length > EnhancedScatterChart.MinAmountOfCategories
                    ? categories[indicies.category]
                    : null;
                const identity: ISelectionId = visualHost.createSelectionIdBuilder()
                    .withCategory(category, categoryIdx)
                    .withSeries(dataValues, grouping)
                    .createSelectionId();

                // TO BE CHANGED: need to refactor these lines below.
                const seriesData: tooltipBuilder.TooltipSeriesDataItem[] = [];
                if (dataValueSource) {
                    // Dynamic series
                    seriesData.push({
                        value: grouping.name,
                        metadata: {
                            source: dataValueSource,
                            values: []
                        }
                    });
                }

                this.changeSeriesData(measures, seriesData, xVal, yVal, categoryIdx);

                const tooltipInfo: VisualTooltipDataItem[] = tooltipBuilder.createTooltipInfo(
                    categoryValue,
                    category ? [category] : undefined,
                    seriesData
                );
                const currentFill: string = parsedColorFill || color;
                const stroke: string = settings.outline.show ? d3.rgb(currentFill).darker().toString() : currentFill;
                const fill: string = settings.fillPoint.show || settings.fillPoint.isHidden ? currentFill : null;

                dataPoints.push({
                    size,
                    rotation,
                    backdrop,
                    xStart,
                    xEnd,
                    fill,
                    stroke,
                    yStart,
                    yEnd,
                    identity,
                    shapeSymbolType,
                    tooltipInfo,
                    x: xVal,
                    y: yVal,
                    radius: { sizeMeasure: measures.measureSize, index: categoryIdx },
                    strokeWidth: settings.dataPoint.strokeWidth,
                    formattedCategory: EnhancedScatterChart.CREATE_LAZY_FORMATTED_CATEGORY(categoryFormatter, categoryValue),
                    selected: EnhancedScatterChart.DefaultSelectionStateOfTheDataPoint,
                    contentPosition: EnhancedScatterChart.DefaultContentPosition,
                    svgurl: image,
                });
            }
        }

        return dataPoints;
    }

    private static getMeasureValue(
        measureIndex: number,
        seriesValues: DataViewValueColumn[]
    ): DataViewValueColumn {
        if (seriesValues && measureIndex >= EnhancedScatterChart.MinIndex) {
            return seriesValues[measureIndex];
        }

        return null;
    }

    private static getNumberFromDataViewValueColumnById(
        dataViewValueColumn: DataViewCategoryColumn | DataViewValueColumn,
        index: number
    ): number {
        const value: number = EnhancedScatterChart.getValueFromDataViewValueColumnById(
            dataViewValueColumn,
            index
        );

        return value && !isNaN(value)
            ? value
            : EnhancedScatterChart.DefaultColumnId;
    }

    private static getValueFromDataViewValueColumnById(
        dataViewValueColumn: DataViewCategoryColumn | DataViewValueColumn,
        index: number
    ): any {

        return dataViewValueColumn && dataViewValueColumn.values
            ? dataViewValueColumn.values[index]
            : null;
    }

    private getDefaultData(settings?: Settings): EnhancedScatterChartData {
        return {
            settings,
            xCol: undefined,
            yCol: undefined,
            dataPoints: [],
            legendDataPoints: [],
            axesLabels: {
                x: EnhancedScatterChart.EmptyString,
                y: EnhancedScatterChart.EmptyString
            },
            selectedIds: [],
            sizeRange: undefined,
            hasDynamicSeries: false,
            useShape: false,
            useCustomColor: false,
        };
    }

    public update(options: VisualUpdateOptions) {
        const dataView: DataView = options
            && options.dataViews
            && options.dataViews[0];

        this.viewport = options && options.viewport
            ? { ...options.viewport }
            : { width: 0, height: 0 };

        this.data = this.parseData(
            dataView,
            this.colorPalette,
            this.visualHost,
            this.interactivityService,
        );

        this.eventService.renderingStarted(options);
        this.renderLegend();

        this.render();

        this.eventService.renderingFinished(options);
    }

    private renderLegend(): void {
        const legendSettings: LegendSettings = this.data.settings.legend;

        const legendDataPoints = this.data.legendDataPoints;

        const isLegendShown: boolean = legendSettings.show
            && legendDataPoints.length > EnhancedScatterChart.MinAmountOfDataPointsInTheLegend;

        const legendData: LegendData = {
            title: legendSettings.showTitle
                ? legendSettings.titleText
                : undefined,
            dataPoints: isLegendShown
                ? legendDataPoints
                : [],
            fontSize: legendSettings.fontSize,
            labelColor: legendSettings.labelColor,
        };

        const legend: ILegend = this.legend;

        legend.changeOrientation(LegendPosition[legendSettings.position]);

        legend.drawLegend(legendData, {
            height: this.viewport.height,
            width: this.viewport.width
        });

        legendModule.positionChartArea(this.svg, legend);
    }

    private shouldRenderAxis(
        axisProperties: IAxisProperties,
        axisSettings: AxisSettings
    ): boolean {
        return !!(axisSettings
            && axisSettings.show
            && axisProperties
            && axisProperties.values
            && axisProperties.values.length > EnhancedScatterChart.MinAmountOfValues
        );
    }

    private adjustViewportByBackdrop(): void {
        const img: HTMLImageElement = new Image(),
            that: EnhancedScatterChart = this;

        img.src = this.data.settings.backdrop.url;
        img.onload = function () {
            const imageElement: HTMLImageElement = <HTMLImageElement>this;

            if (that.oldBackdrop !== imageElement.src) {
                that.render();
                that.oldBackdrop = imageElement.src;
            }
        };

        if (img.width > EnhancedScatterChart.MinImageViewport.width
            && img.height > EnhancedScatterChart.MinImageViewport.height) {

            if (img.width * this.viewportIn.height < this.viewportIn.width * img.height) {
                const deltaWidth: number = this.viewportIn.width
                    - this.viewportIn.height * img.width / img.height;

                this.viewport = {
                    width: this.viewport.width - deltaWidth,
                    height: this.viewport.height
                };
            } else {
                const deltaHeight: number = this.viewportIn.height
                    - this.viewportIn.width * img.height / img.width;

                this.viewport = {
                    width: this.viewport.width,
                    height: this.viewport.height - deltaHeight
                };
            }
        }
    }

    private initMargins() {
        const maxMarginFactor: number = EnhancedScatterChart.MaxMarginFactor;

        this.leftRightMarginLimit = this.viewport.width * maxMarginFactor;

        this.bottomMarginLimit = Math.max(
            EnhancedScatterChart.DefaultMargin.bottom,
            Math.ceil(this.viewport.height * maxMarginFactor)
        );

        // reset defaults
        this.margin.top = EnhancedScatterChart.DefaultMargin.top;
        this.margin.bottom = this.bottomMarginLimit;
        this.margin.right = EnhancedScatterChart.DefaultMargin.right;
    }

    public render(): void {
        this.viewport.height -= this.legendViewport.height;
        this.viewport.width -= this.legendViewport.width;

        if (this.viewportIn.width === EnhancedScatterChart.MinViewport.width
            || this.viewportIn.height === EnhancedScatterChart.MinViewport.height
        ) {
            return;
        }

        this.initMargins();
        this.calculateAxes(
            this.data.settings.categoryAxis,
            this.data.settings.valueAxis,
            EnhancedScatterChart.TextProperties,
            true
        );

        const renderXAxis: boolean = this.shouldRenderAxis(this.xAxisProperties, this.data.settings.categoryAxis);
        const renderY1Axis: boolean = this.shouldRenderAxis(this.yAxisProperties, this.data.settings.valueAxis);

        this.isXScrollBarVisible = EnhancedScatterChart.isScrollbarVisible;
        this.isYScrollBarVisible = EnhancedScatterChart.isScrollbarVisible;

        this.calculateAxes(this.data.settings.categoryAxis, this.data.settings.valueAxis, EnhancedScatterChart.TextProperties);

        let tickLabelMargins: TickLabelMargins;
        let axisLabels: ChartAxesLabels;
        let chartHasAxisLabels: boolean;
        const showY1OnRight: boolean = this.yAxisOrientation === yAxisPosition.right;
        let changedLabelsResult = this.changeLabelMargins(
            EnhancedScatterChart.DefaultValueOfDoneWithMargins,
            tickLabelMargins,
            axisLabels,
            EnhancedScatterChart.DefaultNumIterations,
            EnhancedScatterChart.MaxIterations,
            showY1OnRight,
            renderXAxis,
            renderY1Axis,
            chartHasAxisLabels,
            true);

        // we have to do the above process again since changes are made to viewport.
        if (this.data.settings.backdrop.show && (this.data.settings.backdrop.url !== undefined)) {
            this.adjustViewportByBackdrop();
            changedLabelsResult = this.changeLabelMargins(
                EnhancedScatterChart.DefaultValueOfDoneWithMargins,
                changedLabelsResult.tickLabelMargins,
                changedLabelsResult.axisLabels,
                EnhancedScatterChart.DefaultNumIterations,
                EnhancedScatterChart.MaxIterations,
                showY1OnRight,
                renderXAxis,
                renderY1Axis,
                changedLabelsResult.chartHasAxisLabels);
        }

        this.renderChart(
            this.xAxisProperties,
            this.data.settings.categoryAxis,
            this.yAxisProperties,
            this.data.settings.valueAxis,
            changedLabelsResult.tickLabelMargins,
            changedLabelsResult.chartHasAxisLabels,
            changedLabelsResult.axisLabels
        );

        this.updateAxis();

        if (!this.data) {
            return;
        }

        this.mainGraphicsSVGSelection
            .attr("width", this.viewportIn.width)
            .attr("height", this.viewportIn.height);

        const sortedData: EnhancedScatterChartDataPoint[] = this.data.dataPoints.sort(
            (firstDataPoint: EnhancedScatterChartDataPoint, secondDataPoint: EnhancedScatterChartDataPoint) => {
                return secondDataPoint.radius.sizeMeasure
                    ? <number>secondDataPoint.radius.sizeMeasure.values[secondDataPoint.radius.index]
                    - (<number>firstDataPoint.radius.sizeMeasure.values[firstDataPoint.radius.index])
                    : EnhancedScatterChart.DefaultSizeMeasure;
            });

        const scatterMarkers: Selection<EnhancedScatterChartDataPoint> = this.drawScatterMarkers(
            sortedData,
            this.data.sizeRange,
            EnhancedScatterChart.AnimationDuration
        );

        this.drawCategoryLabels();
        this.renderCrosshair(this.data);
        this.bindTooltip(scatterMarkers);

        this.bindInteractivityService(scatterMarkers, this.data.dataPoints);
    }

    private drawCategoryLabels() {
        const dataPoints: EnhancedScatterChartDataPoint[] = this.data.dataPoints;
        if (this.data.settings.categoryLabels.show) {
            const layout: ILabelLayout = this.getLabelLayout(this.data.settings.categoryLabels, this.viewportIn, this.data.sizeRange);
            const clonedDataPoints: EnhancedScatterChartDataPoint[] = this.cloneDataPoints(dataPoints);

            // fix bug 3863: drawDefaultLabelsForDataPointChart add to datapoints[xxx].size = object, which causes when
            // category labels is on and Fill Points option off to fill the points when mouse click occures because of default size
            // is set to datapoints.
            const labels: Selection<EnhancedScatterChartDataPoint> = dataLabelUtils.drawDefaultLabelsForDataPointChart(
                clonedDataPoints,
                this.mainGraphicsG,
                layout,
                this.viewportIn
            );

            if (labels) {
                labels.attr("transform", (d: EnhancedScatterChartDataPoint) => {
                    let size: ISize = <ISize>d.size,
                        dx: number,
                        dy: number;

                    dx = size.width / EnhancedScatterChart.DataLabelXOffset;
                    dy = size.height / EnhancedScatterChart.DataLabelYOffset;

                    return manipulation.translate(dx, dy);
                });
            }
        }
        else {
            dataLabelUtils.cleanDataLabels(this.mainGraphicsG);
        }
    }


    private changeLabelMargins(
        doneWithMargins: boolean,
        tickLabelMargins: TickLabelMargins,
        axisLabels: ChartAxesLabels,
        numIterations: number,
        maxIterations: number,
        showY1OnRight: boolean,
        renderXAxis: boolean,
        renderY1Axis: boolean,
        chartHasAxisLabels: boolean,
        changeYAxisSide: boolean = false
    ): { tickLabelMargins: TickLabelMargins, axisLabels: ChartAxesLabels, chartHasAxisLabels: boolean } {
        while (!doneWithMargins && numIterations < maxIterations) {
            numIterations++;

            tickLabelMargins = axis.getTickLabelMargins(
                {
                    width: this.viewportIn.width,
                    height: this.viewport.height
                },
                this.leftRightMarginLimit,
                measureSvgTextWidth,
                measureSvgTextHeight,
                {
                    x: this.xAxisProperties,
                    y1: this.yAxisProperties
                },
                this.bottomMarginLimit,
                EnhancedScatterChart.TextProperties,
                this.isXScrollBarVisible || this.isYScrollBarVisible,
                showY1OnRight,
                renderXAxis,
                renderY1Axis,
                false);

            // We look at the y axes as main and second sides, if the y axis orientation is right so the main side represents the right side
            let maxMainYaxisSide: number = showY1OnRight
                ? tickLabelMargins.yRight
                : tickLabelMargins.yLeft;

            let maxSecondYaxisSide: number = showY1OnRight
                ? tickLabelMargins.yLeft
                : tickLabelMargins.yRight;

            let xMax = tickLabelMargins.xMax;

            maxMainYaxisSide += EnhancedScatterChart.AxisSide;

            if (changeYAxisSide) {
                maxSecondYaxisSide += EnhancedScatterChart.AxisSide;
            }

            if (showY1OnRight && renderY1Axis) {
                maxSecondYaxisSide += EnhancedScatterChart.SecondYAxisSide;
            }

            if (changeYAxisSide && !showY1OnRight && renderY1Axis) {
                maxMainYaxisSide += EnhancedScatterChart.SecondAxisSide;
            }

            xMax += EnhancedScatterChart.XMaxOffset;

            axisLabels = {
                x: this.xAxisProperties.axisLabel,
                y: this.yAxisProperties.axisLabel,
                y2: null
            };

            chartHasAxisLabels = (axisLabels.x != null) || (axisLabels.y != null || axisLabels.y2 != null);

            if (axisLabels.x != null) {
                xMax += EnhancedScatterChart.AdditionalXMaxOffset;
            }

            if (axisLabels.y != null) {
                maxMainYaxisSide += EnhancedScatterChart.SecondAxisSide;
            }

            if (axisLabels.y2 != null) {
                maxSecondYaxisSide += EnhancedScatterChart.SecondAxisSide;
            }

            this.margin.left = showY1OnRight
                ? maxSecondYaxisSide
                : maxMainYaxisSide;

            this.margin.right = showY1OnRight
                ? maxMainYaxisSide
                : maxSecondYaxisSide;

            this.margin.bottom = xMax;

            this.calculateAxes(
                this.data.settings.categoryAxis,
                this.data.settings.valueAxis,
                EnhancedScatterChart.TextProperties
            );

            // the minor padding adjustments could have affected the chosen tick values, which would then need to calculate margins again
            // e.g. [0,2,4,6,8] vs. [0,5,10] the 10 is wider and needs more margin.
            if (this.yAxisProperties.values.length === this.yAxisProperties.values.length) {
                doneWithMargins = !EnhancedScatterChart.DefaultValueOfDoneWithMargins;
            }
        }

        return { tickLabelMargins, axisLabels, chartHasAxisLabels };
    }

    private bindTooltip(selection: Selection<TooltipEnabledDataPoint>): void {
        this.tooltipServiceWrapper.addTooltip(
            selection,
            (tooltipEvent: TooltipEventArgs<TooltipEnabledDataPoint>) => tooltipEvent.data.tooltipInfo,
            (tooltipEvent: TooltipEventArgs<any>) => tooltipEvent.data.identity
        );
    }

    private bindInteractivityService(
        dataPointsSelection: Selection<EnhancedScatterChartDataPoint>,
        dataPoints: EnhancedScatterChartDataPoint[]
    ): void {
        if (!this.behavior || !this.interactivityService) {
            return;
        }

        const behaviorOptions: BehaviorOptions = {
            dataPointsSelection,
            clearCatcher: this.clearCatcher,
            interactivityService: this.interactivityService,
            behavior: this.behavior,
            dataPoints
        };

        this.interactivityService.bind(behaviorOptions);

        this.behavior.renderSelection(false);
    }

    private cloneDataPoints(dataPoints: EnhancedScatterChartDataPoint[]): EnhancedScatterChartDataPoint[] {
        return dataPoints.map((dataPoint: EnhancedScatterChartDataPoint) => {
            return _.clone(dataPoint);
        });
    }

    private getLabelLayout(
        labelSettings: CategoryLabelsSettings,
        viewport: IViewport,
        sizeRange: NumberRange
    ): ILabelLayout {
        const xScale: any = this.xAxisProperties.scale;
        const yScale: any = this.yAxisProperties.scale;
        const fontSizeInPx: string = PixelConverter.fromPoint(labelSettings.fontSize);

        return {
            labelText: (dataPoint: EnhancedScatterChartDataPoint) => {
                return getLabelFormattedText({
                    label: dataPoint.formattedCategory(),
                    fontSize: labelSettings.fontSize,
                    maxWidth: viewport.width,
                });
            },
            labelLayout: {
                x: (dataPoint: EnhancedScatterChartDataPoint) => {
                    return EnhancedScatterChart.getDefinedNumberValue(xScale(dataPoint.x));
                },
                y: (dataPoint: EnhancedScatterChartDataPoint) => {
                    const margin = EnhancedScatterChart.getBubbleRadius(dataPoint.radius, sizeRange, viewport)
                        + EnhancedScatterChart.LabelMargin;

                    return yScale(dataPoint.y) - margin;
                },
            },
            filter: (dataPoint: EnhancedScatterChartDataPoint) => {
                return dataPoint != null && dataPoint.formattedCategory() != null;
            },
            style: {
                "fill": labelSettings.color,
                "font-size": fontSizeInPx,
                "font-family": LabelTextProperties.fontFamily,
            },
        };
    }

    private static getBubbleRadius(
        radiusData: EnhancedScatterChartRadiusData,
        sizeRange: NumberRange,
        viewport: IViewport
    ): number {

        let actualSizeDataRange: EnhancedScatterDataRange = null,
            bubblePixelAreaSizeRange: EnhancedScatterDataRange = null,
            measureSize: DataViewValueColumn = radiusData.sizeMeasure;

        if (!measureSize) {
            return EnhancedScatterChart.BubbleRadius;
        }

        const minSize: number = sizeRange.min
            ? sizeRange.min
            : EnhancedScatterChart.DefaultBubbleRadius;

        const maxSize = sizeRange.max
            ? sizeRange.max
            : EnhancedScatterChart.DefaultBubbleRadius;

        const min: number = Math.min(minSize, EnhancedScatterChart.DefaultBubbleRadius),
            max: number = Math.max(maxSize, EnhancedScatterChart.DefaultBubbleRadius);

        actualSizeDataRange = {
            minRange: min,
            maxRange: max,
            delta: max - min
        };

        bubblePixelAreaSizeRange = EnhancedScatterChart.getBubblePixelAreaSizeRange(
            viewport,
            EnhancedScatterChart.MinSizeRange,
            EnhancedScatterChart.MaxSizeRange);

        if (measureSize.values) {
            const sizeValue: number = <number>measureSize.values[radiusData.index];

            if (sizeValue != null) {
                return EnhancedScatterChart.PROJECT_SIZE_TO_PIXELS(
                    sizeValue,
                    actualSizeDataRange,
                    bubblePixelAreaSizeRange) / EnhancedScatterChart.BubbleRadiusDivider;
            }
        }

        return EnhancedScatterChart.BubbleRadius;
    }

    private static getBubblePixelAreaSizeRange(
        viewPort: IViewport,
        minSizeRange: number,
        maxSizeRange: number
    ): EnhancedScatterDataRange {

        let ratio: number = EnhancedScatterChart.DefaultBubbleRatio;

        if (viewPort.height > EnhancedScatterChart.MinViewport.height
            && viewPort.width > EnhancedScatterChart.MinViewport.width) {

            const minSize: number = Math.min(viewPort.height, viewPort.width);

            ratio = (minSize * minSize) / EnhancedScatterChart.AreaOf300By300Chart;
        }

        let minRange: number = Math.round(minSizeRange * ratio),
            maxRange: number = Math.round(maxSizeRange * ratio);

        return {
            minRange: minRange,
            maxRange: maxRange,
            delta: maxRange - minRange
        };
    }

    public static PROJECT_SIZE_TO_PIXELS(
        size: number,
        actualSizeDataRange: EnhancedScatterDataRange,
        bubblePixelAreaSizeRange: EnhancedScatterDataRange
    ): number {

        let projectedSize: number = EnhancedScatterChart.DefaultProjectedSize;

        if (actualSizeDataRange) {
            // Project value on the required range of bubble area sizes
            projectedSize = bubblePixelAreaSizeRange.maxRange;

            if (actualSizeDataRange.delta !== EnhancedScatterChart.MinDelta) {
                const value: number = Math.min(
                    Math.max(size, actualSizeDataRange.minRange),
                    actualSizeDataRange.maxRange);

                projectedSize = EnhancedScatterChart.PROJECT(
                    value,
                    actualSizeDataRange,
                    bubblePixelAreaSizeRange);
            }

            projectedSize = Math.sqrt(projectedSize / Math.PI)
                * EnhancedScatterChart.ProjectedSizeFactor;
        }

        return Math.round(projectedSize);
    }

    public static PROJECT(
        value: number,
        actualSizeDataRange: EnhancedScatterDataRange,
        bubblePixelAreaSizeRange: EnhancedScatterDataRange
    ): number {

        if (actualSizeDataRange.delta === EnhancedScatterChart.MinDelta
            || bubblePixelAreaSizeRange.delta === EnhancedScatterChart.MinDelta) {

            return (EnhancedScatterChart.RANGE_CONTAINS(actualSizeDataRange, value))
                ? bubblePixelAreaSizeRange.minRange
                : null;
        }

        const relativeX: number = (value - actualSizeDataRange.minRange) / actualSizeDataRange.delta;

        return bubblePixelAreaSizeRange.minRange
            + relativeX * bubblePixelAreaSizeRange.delta;
    }

    public static RANGE_CONTAINS(range: EnhancedScatterDataRange, value: number): boolean {
        return range.minRange <= value && value <= range.maxRange;
    }

    private getValueAxisFill(): Fill {
        if (this.dataView && this.dataView.metadata.objects) {
            const valueAxis: DataViewObject = this.dataView.metadata.objects["valueAxis"];

            if (valueAxis) {
                return <Fill>valueAxis["axisColor"];
            }
        }

        return { solid: { color: EnhancedScatterChart.DefaultCategoryAxisFillColor } };
    }

    /**
     * Public for testability.
     */
    public renderCrosshair(data: EnhancedScatterChartData): Selection<any> {
        if (!this.mainGraphicsSVGSelection) {
            return;
        }

        this.crosshairCanvasSelection = this.addCrosshairCanvasToDOM(this.mainGraphicsSVGSelection);

        if (data && data.settings.crosshair.show) {
            const color: string = data.settings.crosshair.color;

            this.crosshairVerticalLineSelection = this.addCrosshairLineToDOM(
                this.crosshairCanvasSelection,
                EnhancedScatterChart.CrosshairVerticalLineSelector,
                color,
            );

            this.crosshairHorizontalLineSelection = this.addCrosshairLineToDOM(
                this.crosshairCanvasSelection,
                EnhancedScatterChart.CrosshairHorizontalLineSelector,
                color,
            );

            this.crosshairTextSelection = this.addCrosshairTextToDOM(
                this.crosshairCanvasSelection,
                color,
            );

            this.bindCrosshairEvents();
        } else {
            this.clearCrosshair();
        }

        return this.crosshairCanvasSelection;
    }

    public clearCrosshair(): void {
        if (!this.crosshairCanvasSelection) {
            return;
        }

        this.crosshairCanvasSelection
            .selectAll("*")
            .remove();
    }

    /**
     * Public for testability.
     */
    public addCrosshairCanvasToDOM(rootElement: Selection<any>): Selection<any> {
        const crosshairCanvasSelector: ClassAndSelector = EnhancedScatterChart.CrosshairCanvasSelector;

        return this.addElementToDOM(rootElement, {
            name: "g",
            selector: crosshairCanvasSelector.selectorName,
            className: crosshairCanvasSelector.className,
            styles: { display: "none" }
        });
    }

    /**
     * Public for testability.
     */
    public addCrosshairLineToDOM(
        rootElement: Selection<any>,
        elementSelector: ClassAndSelector,
        color: string
    ): Selection<any> {
        const crosshairLineSelector: ClassAndSelector = EnhancedScatterChart.CrosshairLineSelector;

        return this.addElementToDOM(rootElement, {
            name: "line",
            selector: elementSelector.selectorName,
            className: `${crosshairLineSelector.className} ${elementSelector.className}`,
            attributes: {
                x1: EnhancedScatterChart.DefaultPositionOfCrosshair,
                y1: EnhancedScatterChart.DefaultPositionOfCrosshair,
                x2: EnhancedScatterChart.DefaultPositionOfCrosshair,
                y2: EnhancedScatterChart.DefaultPositionOfCrosshair
            },
            styles: {
                "stroke": color,
            },
        });
    }

    /**
     * Public for testability.
     */
    public addCrosshairTextToDOM(rootElement: Selection<any>, color: string): Selection<any> {
        const crosshairTextSelector: ClassAndSelector = EnhancedScatterChart.CrosshairTextSelector;

        return this.addElementToDOM(rootElement, {
            name: "text",
            selector: crosshairTextSelector.selectorName,
            className: crosshairTextSelector.className,
            styles: {
                "fill": color,
            },
        });
    }

    /**
     * Public for testability.
     */
    public bindCrosshairEvents(): void {
        if (!this.axisGraphicsContextScrollable) {
            return;
        }

        this.axisGraphicsContextScrollable
            .on("mousemove", () => {
                const event: MouseEvent = <MouseEvent>getEvent();
                let currentTarget = <SVGAElement>event.currentTarget,
                    svgNode: SVGElement = currentTarget.viewportElement,
                    scaledRect: ClientRect = svgNode.getBoundingClientRect(),
                    domRect: SVGRect = (<any>svgNode).getBBox(),
                    ratioX: number = scaledRect.width / domRect.width,
                    ratioY: number = scaledRect.height / domRect.height,
                    x: number = event.pageX,
                    y: number = event.pageY;

                if (domRect.width > EnhancedScatterChart.MinViewport.width
                    && !equalWithPrecision(
                        ratioX,
                        EnhancedScatterChart.DefaultCrosshairYPosition,
                        EnhancedScatterChart.CrosshairPrecision)) {

                    x = x / ratioX;
                }

                if (domRect.height > EnhancedScatterChart.MinViewport.height
                    && !equalWithPrecision(
                        ratioY,
                        EnhancedScatterChart.DefaultCrosshairYPosition,
                        EnhancedScatterChart.CrosshairPrecision)) {

                    y = y / ratioY;
                }

                this.updateCrosshair(x, y);
            })
            .on("mouseover", () => {
                this.crosshairCanvasSelection.style("display", "block");
            })
            .on("mouseout", () => {
                this.crosshairCanvasSelection.style("display", "none");
            });
    }

    /**
     * Public for testability.
     */
    public updateCrosshair(x: number, y: number): void {
        if (!this.viewportIn
            || !this.crosshairHorizontalLineSelection
            || !this.crosshairVerticalLineSelection
            || !this.crosshairTextSelection
            || !this.xAxisProperties) {

            return;
        }

        let crosshairTextMargin: number = EnhancedScatterChart.CrosshairTextMargin,
            xScale = <ScaleLinear<number, number>>this.xAxisProperties.scale,
            yScale = <ScaleLinear<number, number>>this.yAxisProperties.scale,
            xFormated: number,
            yFormated: number;

        this.crosshairHorizontalLineSelection
            .attr("x1", EnhancedScatterChart.CrosshairStartPosition)
            .attr("y1", y)
            .attr("x2", this.viewportIn.width)
            .attr("y2", y);

        this.crosshairVerticalLineSelection
            .attr("x1", x)
            .attr("y1", EnhancedScatterChart.CrosshairStartPosition)
            .attr("x2", x)
            .attr("y2", this.viewportIn.height);

        xFormated = Math.round(xScale.invert(x) * EnhancedScatterChart.CrosshairScaleFactor)
            / EnhancedScatterChart.CrosshairScaleFactor;

        yFormated = Math.round(yScale.invert(y) * EnhancedScatterChart.CrosshairScaleFactor)
            / EnhancedScatterChart.CrosshairScaleFactor;

        this.crosshairTextSelection
            .attr("x", x + crosshairTextMargin)
            .attr("y", y - crosshairTextMargin)
            .text(`(${xFormated}, ${yFormated})`);
    }

    /**
     * Public for testability.
     */
    public addElementToDOM(
        rootElement: Selection<any>,
        properties: ElementProperties
    ): Selection<any> {

        if (!rootElement || !properties) {
            return null;
        }

        let elementSelection: Selection<any>,
            elementUpdateSelection: Selection<any>;

        elementSelection = rootElement.selectAll(properties.selector);

        elementUpdateSelection = elementSelection.data(properties.data || [[]]);

        const elementUpdateSelectionMerged = elementUpdateSelection
            .enter()
            .append(properties.name)
            .merge(elementUpdateSelection);

        const propertiesAttributes = properties.attributes ? Object.keys(properties.attributes) : [];
        for (let propKey of propertiesAttributes) {
            elementUpdateSelectionMerged.attr(propKey, properties.attributes[propKey]);
        }

        const propertiesStyles = properties.styles ? Object.keys(properties.styles) : [];
        for (let propKey of propertiesStyles) {
            elementUpdateSelectionMerged.attr(propKey, properties.styles[propKey]);
        }

        elementUpdateSelectionMerged
            .classed(properties.className, true);

        elementUpdateSelection
            .exit()
            .remove();

        return elementUpdateSelectionMerged;
    }

    private renderBackground(): void {
        if (this.data.settings.backdrop.show && this.data.settings.backdrop.url !== undefined) {

            this.backgroundGraphicsContext
                .attr("xlink:href", this.data.settings.backdrop.url)
                .attr("x", EnhancedScatterChart.DefaultBackgroundPosition)
                .attr("y", EnhancedScatterChart.DefaultBackgroundPosition)
                .attr("width", this.viewportIn.width)
                .attr("height", this.viewportIn.height);
        } else {
            this.backgroundGraphicsContext
                .attr("width", EnhancedScatterChart.DefaultBackgroundPosition)
                .attr("height", EnhancedScatterChart.DefaultBackgroundPosition);
        }
    }

    private renderXAxis(
        xAxis: IAxisProperties,
        xAxisSettings: AxisSettings,
        tickLabelMargins: any,
        duration: number): void {
        // hide show x-axis heres
        if (this.shouldRenderAxis(xAxis, xAxisSettings)) {
            const axisProperties = xAxis;
            const scale: any = axisProperties.scale;
            const ticksCount: number = axisProperties.values.length;
            const format: any = (domainValue: d3.AxisDomain, value: any) => axisProperties.values[value];

            let newAxis = d3.axisBottom(scale);
            xAxis.axis = newAxis;
            this.xAxisGraphicsContext.call(newAxis.tickArguments([ticksCount]).tickFormat(format));

            xAxis.axis
                .tickSize(-this.viewportIn.height);

            if (!xAxis.willLabelsFit) {
                xAxis.axis.tickPadding(EnhancedScatterChart.DefaultAxisXTickPadding);
            }

            if (duration) {
                this.xAxisGraphicsContext
                    .transition()
                    .duration(duration)
                    .call(xAxis.axis);
            }
            else {
                this.xAxisGraphicsContext.call(xAxis.axis);
            }

            const xAxisTextNodes: Selection<any> = this.xAxisGraphicsContext.selectAll("text");
            if (xAxis.willLabelsWordBreak) {
                xAxisTextNodes.call(
                    axis.LabelLayoutStrategy.wordBreak,
                    xAxis,
                    this.bottomMarginLimit
                );
            } else {
                xAxisTextNodes.call(
                    axis.LabelLayoutStrategy.rotate,
                    this.bottomMarginLimit,
                    getTailoredTextOrDefault,
                    EnhancedScatterChart.TextProperties,
                    !xAxis.willLabelsFit,
                    this.bottomMarginLimit === tickLabelMargins.xMax,
                    xAxis,
                    this.margin,
                    this.isXScrollBarVisible || this.isYScrollBarVisible
                );
            }
            this.applyAxisColor(this.xAxisGraphicsContext, xAxisSettings);
        }
        else {
            this.xAxisGraphicsContext
                .selectAll("*")
                .remove();
        }
    }

    private renderYAxis(
        yAxis: IAxisProperties,
        yAxisSettings: AxisSettings,
        tickLabelMargins: any,
        duration: number
    ): void {
        if (this.shouldRenderAxis(yAxis, yAxisSettings)) {
            const scale: any = yAxis.scale;
            const ticksCount: number = yAxis.values.length;
            const format: any = (domainValue: d3.AxisDomain, value: any) => yAxis.values[value];

            let newAxis = this.yAxisOrientation == yAxisPosition.left ? d3.axisLeft(scale) : d3.axisRight(scale);
            yAxis.axis = newAxis;
            this.yAxisGraphicsContext.call(newAxis.tickArguments([ticksCount]).tickFormat(format));

            yAxis.axis
                .tickSize(-this.viewportIn.width)
                .tickPadding(EnhancedScatterChart.DefaultAxisYTickPadding);

            if (duration) {
                this.yAxisGraphicsContext
                    .transition()
                    .duration(duration)
                    .call(yAxis.axis);
            }
            else {
                this.yAxisGraphicsContext.call(yAxis.axis);
            }

            this.applyAxisColor(this.yAxisGraphicsContext, yAxisSettings);

            if (tickLabelMargins.yLeft >= this.leftRightMarginLimit) {
                this.yAxisGraphicsContext
                    .selectAll("text")
                    .call(axis.LabelLayoutStrategy.clip,
                        // Can't use padding space to render text, so subtract that from available space for ellipses calculations
                        this.leftRightMarginLimit - EnhancedScatterChart.AxisSide,
                        svgEllipsis
                    );
            }

            // TO BE CHANGED: clip (svgEllipsis) the Y2 labels
        }
        else {
            this.yAxisGraphicsContext
                .selectAll("*")
                .remove();
        }
    }

    private renderChart(
        xAxis: IAxisProperties,
        xAxisSettings: AxisSettings,
        yAxis: IAxisProperties,
        yAxisSettings: AxisSettings,
        tickLabelMargins: any,
        chartHasAxisLabels: boolean,
        axisLabels: ChartAxesLabels
    ): void {
        const duration = EnhancedScatterChart.AnimationDuration;

        this.renderBackground();
        this.renderXAxis(xAxis, xAxisSettings, tickLabelMargins, duration);
        this.renderYAxis(yAxis, yAxisSettings, tickLabelMargins, duration);

        // Axis labels
        // TO BE CHANGED: Add label for second Y axis for combo chart
        if (chartHasAxisLabels) {
            const hideXAxisTitle: boolean = !(this.shouldRenderAxis(xAxis, xAxisSettings) && xAxisSettings.showAxisTitle);
            const hideYAxisTitle: boolean = !(this.shouldRenderAxis(yAxis, yAxisSettings) && yAxisSettings.showAxisTitle);

            this.renderAxesLabels(
                axisLabels,
                this.legendViewport.height,
                hideXAxisTitle,
                hideYAxisTitle,
                true,
                xAxisSettings,
                yAxisSettings
            );
        }
        else {
            this.removeAxisLabels();
        }
    }

    private applyAxisColor(selection: Selection<any>, axisSettings: AxisSettings): void {
        selection
            .selectAll("line")
            .style("stroke", axisSettings.lineColor)
            .style("stroke-width", null);

        selection
            .selectAll("path")
            .style("stroke", axisSettings.lineColor);

        selection
            .selectAll("text")
            .style("fill", axisSettings.axisColor);

        const xZeroTick: Selection<any> = selection
            .selectAll(`g${EnhancedScatterChart.TickSelector.selectorName}`)
            .filter((data) => data === EnhancedScatterChart.EmptyDataValue);

        if (xZeroTick) {
            const xZeroColor: Fill = this.getValueAxisFill();

            if (xZeroColor) {
                xZeroTick
                    .selectAll("line")
                    .style("stroke", axisSettings.zeroLineColor)
                    .style("stroke-width", PixelConverter.toString(axisSettings.zeroLineStrokeWidth));
            }
        }

    }

    private removeAxisLabels(): void {
        this.axisGraphicsContext
            .selectAll(EnhancedScatterChart.XAxisLabelSelector.selectorName)
            .remove();

        this.axisGraphicsContext
            .selectAll(EnhancedScatterChart.YAxisLabelSelector.selectorName)
            .remove();
    }

    /**
     * We have to optimize this function as soon as we have time for it.
     * There's a small memory leak by removing node from the DOM every time after calling of the update method.
     */
    private renderAxesLabels(
        axisLabels: ChartAxesLabels,
        legendMargin: number,
        hideXAxisTitle: boolean,
        hideYAxisTitle: boolean,
        hideY2AxisTitle: boolean,
        xAxisSettings: AxisSettings,
        yAxisSettings: AxisSettings
    ): void {

        this.removeAxisLabels();

        const margin: IMargin = this.margin,
            width: number = this.viewportIn.width,
            height: number = this.viewport.height,
            fontSize: number = EnhancedScatterChart.AxisFontSize,
            yAxisOrientation: string = this.yAxisOrientation,
            showY1OnRight: boolean = yAxisOrientation === yAxisPosition.right;

        if (!hideXAxisTitle) {
            const xAxisLabel: Selection<any> = this.axisGraphicsContext
                .append("text")
                .style("text-anchor", EnhancedScatterChart.TextAnchor)
                .style("fill", xAxisSettings.axisColor)
                .text(axisLabels.x)
                .call((text: Selection<any>) => {
                    text.each(function () {
                        const textSelection: Selection<any> = d3.select(this);

                        textSelection
                            .attr("class", EnhancedScatterChart.XAxisLabelSelector.className)
                            .attr("transform", manipulation.translate(
                                width / EnhancedScatterChart.AxisLabelOffset,
                                height - fontSize - EnhancedScatterChart.AxisLabelOffset
                            ),
                            );
                    });
                });

            xAxisLabel.call(
                axis.LabelLayoutStrategy.clip,
                width,
                svgEllipsis
            );
        }

        if (!hideYAxisTitle) {
            const yAxisLabel: Selection<any> = this.axisGraphicsContext
                .append("text")
                .style("text-anchor", EnhancedScatterChart.TextAnchor)
                .style("fill", yAxisSettings.axisColor)
                .text(axisLabels.y)
                .call((text: Selection<any>) => {
                    text.each(function () {
                        const text: Selection<any> = d3.select(this);

                        text.attr("class", EnhancedScatterChart.YAxisLabelSelector.className)
                            .attr("transform", EnhancedScatterChart.YAxisLabelTransformRotate)
                            .attr("y", showY1OnRight ? width + margin.right - fontSize : -margin.left)
                            .attr("x", -((height - margin.top - legendMargin) / EnhancedScatterChart.AxisLabelOffset))
                            .attr("dy", EnhancedScatterChart.DefaultDY);
                    });

                });
            yAxisLabel.call(
                axis.LabelLayoutStrategy.clip,
                height - (margin.bottom + margin.top),
                svgEllipsis
            );
        }

        if (!hideY2AxisTitle && axisLabels.y2) {
            const y2AxisLabel: Selection<any> = this.axisGraphicsContext
                .append("text")
                .style("text-anchor", EnhancedScatterChart.TextAnchor)
                .text(axisLabels.y2)
                .call((text: Selection<any>) => {
                    text.each(function () {
                        const text: Selection<any> = d3.select(this);

                        text.attr("class", EnhancedScatterChart.YAxisLabelSelector.className)
                            .attr("transform", EnhancedScatterChart.YAxisLabelTransformRotate)
                            .attr("y", showY1OnRight ? -margin.left : width + margin.right - fontSize)
                            .attr("x", -((height - margin.top - legendMargin) / EnhancedScatterChart.AxisLabelOffset))
                            .attr("dy", EnhancedScatterChart.DefaultDY);
                    });
                });

            y2AxisLabel.call(
                axis.LabelLayoutStrategy.clip,
                height - (margin.bottom + margin.top),
                svgEllipsis);
        }
    }

    private updateAxis(): void {
        this.adjustMargins();

        const yAxisOrientation: string = this.yAxisOrientation,
            showY1OnRight: boolean = yAxisOrientation === yAxisPosition.right;

        this.xAxisGraphicsContext.attr(
            "transform",
            manipulation.translate(
                EnhancedScatterChart.DefaultAxisOffset,
                this.viewportIn.height));

        this.yAxisGraphicsContext.attr(
            "transform",
            manipulation.translate(
                showY1OnRight
                    ? this.viewportIn.width
                    : EnhancedScatterChart.DefaultAxisOffset,
                EnhancedScatterChart.DefaultAxisOffset));

        this.svg.attr("width", this.viewport.width)
            .attr("height", this.viewport.height);

        this.svgScrollable.attr("width", this.viewport.width)
            .attr("height", this.viewport.height);

        this.svgScrollable.attr("x", EnhancedScatterChart.DefaultAxisOffset);

        const left: number = this.margin.left,
            top: number = this.margin.top;

        this.axisGraphicsContext.attr("transform", manipulation.translate(left, top));
        this.axisGraphicsContextScrollable.attr("transform", manipulation.translate(left, top));
        this.clearCatcher.attr("transform", manipulation.translate(-left, -top));

        if (this.isXScrollBarVisible) {
            this.svgScrollable.attr("x", left)
                .attr("width", this.viewportIn.width);

            this.axisGraphicsContextScrollable.attr("transform", manipulation.translate(0, top));

            this.svg.attr("width", this.viewport.width)
                .attr("height", this.viewport.height + this.ScrollBarWidth);
        }
        else if (this.isYScrollBarVisible) {
            this.svgScrollable.attr("height", this.viewportIn.height + top);

            this.svg.attr("width", this.viewport.width + this.ScrollBarWidth)
                .attr("height", this.viewport.height);
        }
    }

    private drawScatterMarkersUsingShapes(
        markers: Selection<EnhancedScatterChartDataPoint>,
        markersMerged: Selection<EnhancedScatterChartDataPoint>,
        scatterData: EnhancedScatterChartDataPoint[],
        sizeRange: NumberRange,
        duration: number
    ): {
            markers: Selection<EnhancedScatterChartDataPoint>,
            markersMerged: Selection<EnhancedScatterChartDataPoint>
        } {
        this.mainGraphicsContext
            .selectAll(EnhancedScatterChart.DotSelector.selectorName)
            .remove();

        markers = this.mainGraphicsContext
            .classed(EnhancedScatterChart.ScatterMarkersSelector.className, true)
            .selectAll(EnhancedScatterChart.ImageSelector.selectorName)
            .data(scatterData, (dataPoint: EnhancedScatterChartDataPoint) => {
                return (<ISelectionId>dataPoint.identity).getKey();
            });

        markersMerged = markers
            .enter()
            .append("svg:image")
            .merge(markers);

        markersMerged
            .classed(EnhancedScatterChart.ImageSelector.className, true)
            .attr("id", EnhancedScatterChart.MarkerImageSelector.className);

        const thisVisual = this;
        markersMerged
            .attr("xlink:href", (dataPoint: EnhancedScatterChartDataPoint) => {
                if (dataPoint.svgurl !== undefined
                    && dataPoint.svgurl != null
                    && dataPoint.svgurl !== "") {

                    return dataPoint.svgurl;
                }

                return this.svgDefaultImage;
            })
            .attr("title", (dataPoint: EnhancedScatterChartDataPoint) => {
                return dataPoint.formattedCategory
                    ? dataPoint.formattedCategory()
                    : null;
            })
            .each(function (dataPoint: EnhancedScatterChartDataPoint): void {
                const bubbleRadius: number = EnhancedScatterChart.getBubbleRadius(
                    dataPoint.radius,
                    sizeRange,
                    thisVisual.viewport) * EnhancedScatterChart.BubbleRadiusDivider;

                d3.select(this)
                    .attr("width", bubbleRadius)
                    .attr("height", bubbleRadius);
            })
            .transition()
            .duration((dataPoint: EnhancedScatterChartDataPoint) => {
                if (this.keyArray.indexOf((<ISelectionId>dataPoint.identity).getKey()) >= 0) {
                    return duration;
                }

                return EnhancedScatterChart.MinAnimationDuration;
            })
            .attr("transform", (dataPoint: EnhancedScatterChartDataPoint) => {
                const radius: number = EnhancedScatterChart.getBubbleRadius(
                    dataPoint.radius,
                    sizeRange,
                    this.viewport);

                const x: number = EnhancedScatterChart.getDefinedNumberValue(this.xAxisProperties.scale(dataPoint.x) - radius),
                    y: number = EnhancedScatterChart.getDefinedNumberValue(this.yAxisProperties.scale(dataPoint.y) - radius);

                return `translate(${x},${y}) rotate(${dataPoint.rotation},${radius},${radius})`;
            });

        return { markers, markersMerged };
    }

    private drawScatterMarkersWithoutShapes(
        markers: Selection<EnhancedScatterChartDataPoint>,
        markersMerged: Selection<EnhancedScatterChartDataPoint>,
        scatterData: EnhancedScatterChartDataPoint[],
        sizeRange: NumberRange,
        duration: number
    ): {
            markers: Selection<EnhancedScatterChartDataPoint>,
            markersMerged: Selection<EnhancedScatterChartDataPoint>
        } {
        this.mainGraphicsContext
            .selectAll(EnhancedScatterChart.ImageSelector.selectorName)
            .remove();

        markers = this.mainGraphicsContext
            .classed(EnhancedScatterChart.ScatterMarkersSelector.className, true)
            .selectAll(EnhancedScatterChart.DotSelector.selectorName)
            .data(scatterData, (dataPoint: EnhancedScatterChartDataPoint) => {
                return (<ISelectionId>dataPoint.identity).getKey();
            });

        markersMerged = markers
            .enter()
            .append("path")
            .merge(markers);

        markersMerged
            .classed(EnhancedScatterChart.DotSelector.className, true)
            .attr("id", EnhancedScatterChart.MarkerShapeSelector.className);

        markersMerged
            .style("stroke-width", (dataPoint: EnhancedScatterChartDataPoint) => PixelConverter.toString(dataPoint.strokeWidth))
            .style("stroke", (dataPoint: EnhancedScatterChartDataPoint) => dataPoint.stroke)
            .style("fill", (dataPoint: EnhancedScatterChartDataPoint) => dataPoint.fill)
            .attr("d", (dataPoint: EnhancedScatterChartDataPoint) => {
                const r: number = EnhancedScatterChart.getBubbleRadius(dataPoint.radius, sizeRange, this.viewport),
                    area: number = EnhancedScatterChart.RadiusMultiplexer * r * r;

                return dataPoint.shapeSymbolType(area);
            })
            .transition()
            .duration((dataPoint: EnhancedScatterChartDataPoint) => {
                if (this.keyArray.indexOf((<ISelectionId>dataPoint.identity).getKey()) >= 0) {
                    return duration;
                } else {
                    return EnhancedScatterChart.MinAnimationDuration;
                }
            })
            .attr("transform", (dataPoint: EnhancedScatterChartDataPoint) => {
                const x: number = EnhancedScatterChart.getDefinedNumberValue(this.xAxisProperties.scale(dataPoint.x)),
                    y: number = EnhancedScatterChart.getDefinedNumberValue(this.yAxisProperties.scale(dataPoint.y)),
                    rotation: number = dataPoint.rotation;

                return `translate(${x},${y}) rotate(${rotation})`;
            });

        return { markers, markersMerged };
    }

    private drawScatterMarkers(
        scatterData: EnhancedScatterChartDataPoint[],
        sizeRange: NumberRange,
        duration: number
    ): Selection<EnhancedScatterChartDataPoint> {

        const xScale: any = this.xAxisProperties.scale,
            yScale: any = this.yAxisProperties.scale,
            viewport = this.viewport;

        let markers: Selection<EnhancedScatterChartDataPoint>;
        let markersMerged: Selection<EnhancedScatterChartDataPoint>;
        let markersChanged = this.data.useShape ? this.drawScatterMarkersUsingShapes(markers, markersMerged, scatterData, sizeRange, duration) :
            this.drawScatterMarkersWithoutShapes(markers, markersMerged, scatterData, sizeRange, duration);

        markers = markersChanged.markers;
        markersMerged = markersChanged.markersMerged;

        markers
            .exit()
            .remove();

        this.keyArray = scatterData.map((dataPoint: EnhancedScatterChartDataPoint) => {
            return (<ISelectionId>dataPoint.identity).getKey();
        });

        return markersMerged;
    }

    public static GET_BUBBLE_OPACITY(d: EnhancedScatterChartDataPoint, hasSelection: boolean): number {
        if (hasSelection && !d.selected) {
            return EnhancedScatterChart.DimmedBubbleOpacity;
        }

        return EnhancedScatterChart.DefaultBubbleOpacity;
    }

    public calculateAxes(
        categoryAxisSettings: AxisSettings,
        valueAxisSettings: AxisSettings,
        textProperties: TextProperties,
        scrollbarVisible: boolean = true
    ): IAxisProperties[] {
        const visualOptions: CalculateScaleAndDomainOptions = {
            viewport: this.viewport,
            margin: this.margin,
            forcedXDomain: [
                categoryAxisSettings.start,
                categoryAxisSettings.end,
            ],
            forceMerge: false,
            showCategoryAxisLabel: false,
            showValueAxisLabel: true,
            categoryAxisScaleType: null,
            valueAxisScaleType: null,
            valueAxisDisplayUnits: valueAxisSettings.labelDisplayUnits,
            categoryAxisDisplayUnits: categoryAxisSettings.labelDisplayUnits,
            trimOrdinalDataOnOverflow: false
        };

        visualOptions.forcedYDomain = axis.applyCustomizedDomain(
            [
                valueAxisSettings.start,
                valueAxisSettings.end
            ],
            visualOptions.forcedYDomain
        );

        visualOptions.showCategoryAxisLabel = categoryAxisSettings.showAxisTitle;

        const width: number = this.viewport.width - (this.margin.left + this.margin.right);

        const axes: IAxisProperties[] = this.calculateAxesProperties(visualOptions);

        axes[0].willLabelsFit = axis.LabelLayoutStrategy.willLabelsFit(
            axes[0],
            width,
            measureSvgTextWidth,
            textProperties);

        // If labels do not fit and we are not scrolling, try word breaking
        axes[0].willLabelsWordBreak = (!axes[0].willLabelsFit && !scrollbarVisible)
            && axis.LabelLayoutStrategy.willLabelsWordBreak(
                axes[0],
                this.margin,
                width,
                measureSvgTextWidth,
                estimateSvgTextHeight,
                getTailoredTextOrDefault,
                textProperties
            );

        return axes;
    }

    public calculateAxesProperties(options: CalculateScaleAndDomainOptions): IAxisProperties[] {
        const data: EnhancedScatterChartData = this.data,
            dataPoints: EnhancedScatterChartDataPoint[] = data.dataPoints;

        this.margin = options.margin;
        this.viewport = options.viewport;

        let minY: number = EnhancedScatterChart.MinAxisValue,
            maxY: number = EnhancedScatterChart.MaxAxisValue,
            minX: number = EnhancedScatterChart.MinAxisValue,
            maxX: number = EnhancedScatterChart.MaxAxisValue;

        if (dataPoints.length > 0) {
            minY = d3.min<EnhancedScatterChartDataPoint, number>(dataPoints, dataPoint => dataPoint.y);
            maxY = d3.max<EnhancedScatterChartDataPoint, number>(dataPoints, dataPoint => dataPoint.y);
            minX = d3.min<EnhancedScatterChartDataPoint, number>(dataPoints, dataPoint => dataPoint.x);
            maxX = d3.max<EnhancedScatterChartDataPoint, number>(dataPoints, dataPoint => dataPoint.x);
        }

        const xDomain: number[] = [minX, maxX];

        const combinedXDomain: number[] = axis.combineDomain(
            this.optimizeTranslateValues(options.forcedXDomain),
            xDomain
        );

        const xAxisFormatString: string = valueFormatter.getFormatStringByColumn(data.xCol);

        this.xAxisProperties = axis.createAxis({
            pixelSpan: this.viewportIn.width,
            dataDomain: combinedXDomain,
            metaDataColumn: data.xCol,
            formatString: xAxisFormatString,
            outerPadding: EnhancedScatterChart.OuterPadding,
            isScalar: true,
            isVertical: false,
            getValueFn: (index, dataType) => dataType.dateTime ? EnhancedScatterChart.displayTimestamp(index) : index,
            forcedTickCount: options.forcedTickCount,
            useTickIntervalForDisplayUnits: true,
            isCategoryAxis: true, // scatter doesn"t have a categorical axis, but this is needed for the pane to react correctly to the x-axis toggle one/off
            scaleType: options.categoryAxisScaleType,
            axisDisplayUnits: options.categoryAxisDisplayUnits
        });

        this.xAxisProperties.axis
            .tickSize(-this.viewportIn.height)
            .tickSizeOuter(EnhancedScatterChart.OuterPadding);

        this.xAxisProperties.axisLabel = this.data.axesLabels.x;

        const combinedYDomain: number[] = axis.combineDomain(
            this.optimizeTranslateValues(options.forcedYDomain),
            [minY, maxY]
        );

        const yAxisFormatString: string = valueFormatter.getFormatStringByColumn(data.yCol);

        this.yAxisProperties = axis.createAxis({
            pixelSpan: this.viewportIn.height,
            dataDomain: combinedYDomain,
            metaDataColumn: data.yCol,
            formatString: yAxisFormatString,
            outerPadding: EnhancedScatterChart.OuterPadding,
            isScalar: true,
            isVertical: true,
            getValueFn: (index, dataType) => dataType.dateTime ? EnhancedScatterChart.displayTimestamp(index) : index,
            forcedTickCount: options.forcedTickCount,
            useTickIntervalForDisplayUnits: true,
            isCategoryAxis: false,
            scaleType: options.valueAxisScaleType,
            axisDisplayUnits: options.valueAxisDisplayUnits,
        });

        this.yAxisProperties.axisLabel = this.data.axesLabels.y;

        return [
            this.xAxisProperties,
            this.yAxisProperties
        ];
    }

    /**
     * Public for testability.
     */
    public optimizeTranslateValues(values: number[]): number[] {
        if (values && values.map) {
            return values.map((value: number) => {
                return this.optimizeTranslateValue(value);
            });
        }

        return values;
    }

    /**
     * Public for testability.
     */
    public optimizeTranslateValue(value: number): number {
        if (value) {
            const numberSign: number = value >= EnhancedScatterChart.NumberSignZero
                ? EnhancedScatterChart.NumberSignPositive
                : -EnhancedScatterChart.NumberSignPositive;

            const absoluteValue: number = Math.abs(value);

            if (absoluteValue > EnhancedScatterChart.MaxTranslateValue) {
                return EnhancedScatterChart.MaxTranslateValue * numberSign;
            } else if (absoluteValue < EnhancedScatterChart.MinTranslateValue) {
                return EnhancedScatterChart.MinTranslateValue * numberSign;
            }
        }

        return value;
    }

    private enumerateDataPoints(
        instances: VisualObjectInstance[],
        dataPointSettings: DataPointSettings
    ): VisualObjectInstance[] {
        if (!this.data) {
            return instances;
        }

        if (this.data.hasDynamicSeries) {
            return this.data.legendDataPoints.map((legendDataPoint: LegendDataPoint) => {
                return {
                    objectName: "dataPoint",
                    displayName: legendDataPoint.label,
                    selector: ColorHelper.normalizeSelector((<ISelectionId>legendDataPoint.identity).getSelector()),
                    properties: {
                        fill: { solid: { color: legendDataPoint.color } }
                    },
                };
            });
        }

        if (!dataPointSettings.showAllDataPoints) {
            return instances;
        }

        const dataPointInstances: VisualObjectInstance[] = this.data.dataPoints
            .map((seriesDataPoints: EnhancedScatterChartDataPoint) => {
                return {
                    objectName: "dataPoint",
                    displayName: seriesDataPoints.formattedCategory(),
                    selector: ColorHelper.normalizeSelector(
                        (<ISelectionId>seriesDataPoints.identity).getSelector(),
                        true
                    ),
                    properties: {
                        fill: { solid: { color: seriesDataPoints.fill } },
                    },
                };
            });

        return instances.concat(dataPointInstances);
    }

    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
        const settings: Settings = this.data && this.data.settings || new Settings();

        const instances: VisualObjectInstance[] = (<VisualObjectInstanceEnumerationObject>Settings.enumerateObjectInstances(
            settings,
            options
        )).instances || [];

        switch (options.objectName) {
            case "dataPoint": {

                if (this.data && this.data.hasGradientRole) {
                    return [];

                }

                return this.enumerateDataPoints(instances, settings.dataPoint);
            }
            case "fillPoint": {
                if (settings.fillPoint.isHidden) {
                    return [];
                }

                break;
            }
            case "legend": {
                if (!this.data || !this.data.hasDynamicSeries) {
                    return [];
                }

                break;
            }
        }

        return instances;
    }
}
