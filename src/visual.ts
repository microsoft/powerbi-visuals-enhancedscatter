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
    import UpdateSelection = d3.selection.Update;
    import LinearScale = d3.scale.Linear;

    // powerbi.visuals
    import ISelectionId = powerbi.visuals.ISelectionId;

    // powerbi.extensibility.utils.dataview
    import DataViewObject = powerbi.extensibility.utils.dataview.DataViewObject;
    import DataViewObjects = powerbi.extensibility.utils.dataview.DataViewObjects;
    import getMeasureIndexOfRole = powerbi.extensibility.utils.dataview.DataRoleHelper.getMeasureIndexOfRole;
    import getCategoryIndexOfRole = powerbi.extensibility.utils.dataview.DataRoleHelper.getCategoryIndexOfRole;
    import ValidationHelper = powerbi.extensibility.utils.dataview.validationHelper;

    // powerbi.extensibility.utils.svg
    import svg = powerbi.extensibility.utils.svg;
    import IMargin = powerbi.extensibility.utils.svg.IMargin;
    import ISize = powerbi.extensibility.utils.svg.shapes.ISize;
    import ClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.ClassAndSelector;
    import createClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.createClassAndSelector;

    // powerbi.extensibility.utils.chart
    import ILegend = powerbi.extensibility.utils.chart.legend.ILegend;
    import LegendData = powerbi.extensibility.utils.chart.legend.LegendData;
    import legendDataModule = powerbi.extensibility.utils.chart.legend.data;
    import legendModule = powerbi.extensibility.utils.chart.legend;
    import legendProps = powerbi.extensibility.utils.chart.legend.legendProps;
    import LegendPosition = powerbi.extensibility.utils.chart.legend.LegendPosition;
    import LegendIcon = powerbi.extensibility.utils.chart.legend.LegendIcon;
    import createLegend = powerbi.extensibility.utils.chart.legend.createLegend;
    import LegendDataPoint = powerbi.extensibility.utils.chart.legend.LegendDataPoint;
    import axis = powerbi.extensibility.utils.chart.axis;
    import IAxisProperties = powerbi.extensibility.utils.chart.axis.IAxisProperties;
    import dataLabelUtils = powerbi.extensibility.utils.chart.dataLabel.utils;
    import ILabelLayout = powerbi.extensibility.utils.chart.dataLabel.ILabelLayout;
    import PointLabelPosition = powerbi.extensibility.utils.chart.dataLabel.PointLabelPosition;
    import LabelTextProperties = powerbi.extensibility.utils.chart.dataLabel.utils.LabelTextProperties;
    import getLabelFormattedText = powerbi.extensibility.utils.chart.dataLabel.utils.getLabelFormattedText;
    import PointDataLabelsSettings = powerbi.extensibility.utils.chart.dataLabel.PointDataLabelsSettings;
    import axisScale = powerbi.extensibility.utils.chart.axis.scale;
    import axisStyle = powerbi.extensibility.utils.chart.axis.style;

    // powerbi.extensibility.utils.type
    import PixelConverter = powerbi.extensibility.utils.type.PixelConverter;
    import equalWithPrecision = powerbi.extensibility.utils.type.Double.equalWithPrecision;

    // powerbi.extensibility.utils.formatting
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;

    // powerbi.extensibility.utils.interactivity
    import appendClearCatcher = powerbi.extensibility.utils.interactivity.appendClearCatcher;
    import IInteractiveBehavior = powerbi.extensibility.utils.interactivity.IInteractiveBehavior;
    import IInteractivityService = powerbi.extensibility.utils.interactivity.IInteractivityService;
    import createInteractivityService = powerbi.extensibility.utils.interactivity.createInteractivityService;

    // powerbi.extensibility.utils.formatting
    import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    import svgEllipsis = powerbi.extensibility.utils.formatting.textMeasurementService.svgEllipsis;
    import measureSvgTextWidth = powerbi.extensibility.utils.formatting.textMeasurementService.measureSvgTextWidth;
    import measureSvgTextHeight = powerbi.extensibility.utils.formatting.textMeasurementService.measureSvgTextHeight;
    import estimateSvgTextHeight = powerbi.extensibility.utils.formatting.textMeasurementService.estimateSvgTextHeight;
    import getTailoredTextOrDefault = powerbi.extensibility.utils.formatting.textMeasurementService.getTailoredTextOrDefault;

    // powerbi.extensibility.utils.color
    import ColorHelper = powerbi.extensibility.utils.color.ColorHelper;

    // powerbi.extensibility.utils.tooltip
    import TooltipEventArgs = powerbi.extensibility.utils.tooltip.TooltipEventArgs;
    import ITooltipServiceWrapper = powerbi.extensibility.utils.tooltip.ITooltipServiceWrapper;
    import TooltipEnabledDataPoint = powerbi.extensibility.utils.tooltip.TooltipEnabledDataPoint;
    import createTooltipServiceWrapper = powerbi.extensibility.utils.tooltip.createTooltipServiceWrapper;

    interface ShapeFunction {
        (value: any): string;
    }

    interface ShapeEntry {
        key: string;
        value: ShapeFunction;
    }

    export class EnhancedScatterChart implements IVisual {
        private static MaxMarginFactor: number = 0.25;

        private static AnimationDuration: number = 0;

        private static LabelMargin: number = 8;

        private static AxisGraphicsContextClassName: string = "axisGraphicsContext";
        private static ClassName: string = "enhancedScatterChart";
        private static MainGraphicsContextClassName: string = "mainGraphicsContext";
        private static LegendLabelFontSizeDefault: number = 9;
        private static LabelDisplayUnitsDefault: number = 0;
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

        private static DefaultFillPoint: boolean = false;
        private static DefaultCrosshair: boolean = false;
        private static DefaultOutline: boolean = false;
        private static DefaultShowAllDataPoints: boolean = true;

        private static DefaultSelectionStateOfTheDataPoint: boolean = false;
        private static DefaultContentPosition: number = 8;

        private static DefaultColumnId: number = 0;

        private static MinAmountOfDataViews: number = 0;
        private static MinAmountOfDataPointsInTheLegend: number = 1;

        private static isScrollbarVisible: boolean = false;

        private static DefaultBubbleRadius: number = 0;
        private static MinBubbleOpacity: number = 0;

        private static BubbleRadiusDivider: number = 2;

        private static DefaultBubbleRatio: number = 1;

        private static DefaultProjectedSize: number = 0;
        private static MinDelta: number = 0;
        private static ProjectedSizeFactor: number = 2;

        private static RadiusMultiplexer: number = 4;

        private static DefaultXAxisOrientation: string = "bottom";
        private static DefaultAxisXTickPadding: number = 5;
        private static DefaultAxisYTickPadding: number = 10;

        private static MinAnimationDuration: number = 0;

        private static DefaultPosition: number = 0;

        private static MinImageViewport: IViewport = {
            width: 0,
            height: 0
        };

        private static DefaultBackdrop: EnhancedScatterChartBackdrop = {
            show: false,
            url: ""
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

        private static StrokeWidth: number = 1;

        private static DefaultAxisOffset: number = 0;

        private static DisplayUnitValue: number = 1;

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

        private element: Element;
        private svgScrollable: Selection<any>;
        private axisGraphicsContext: Selection<any>;
        private axisGraphicsContextScrollable: Selection<any>;
        private xAxisGraphicsContext: Selection<any>;
        private backgroundGraphicsContext: Selection<any>;
        private y1AxisGraphicsContext: Selection<any>;
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
        private colorPalette: IColorPalette;

        private interactivityService: IInteractivityService;
        private categoryAxisProperties: DataViewObject;
        private valueAxisProperties: DataViewObject;
        private yAxisOrientation: string;

        private scrollY: boolean = true;
        private scrollX: boolean = true;

        private dataViews: DataView[];
        private legendObjectProperties: DataViewObject;
        private visualHost: IVisualHost;
        private layerLegendData: LegendData;
        private legendLabelFontSize: number;
        private hasCategoryAxis: boolean;
        private yAxisIsCategorical: boolean;
        private bottomMarginLimit: number;
        private leftRightMarginLimit: number;
        private isXScrollBarVisible: boolean;
        private isYScrollBarVisible: boolean;
        private ScrollBarWidth = 10;
        private categoryAxisHasUnitType: boolean;
        private valueAxisHasUnitType: boolean;
        private svgDefaultImage: string = "";
        private oldBackdrop: string;

        private behavior: IInteractiveBehavior;

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
                        const r: number = (i & EnhancedScatterChart.RMask) === EnhancedScatterChart.RMaskResult
                            ? outerRadius
                            : innerRadius;

                        const currX: number = Math.cos(i * angle) * r,
                            currY: number = Math.sin(i * angle) * r;

                        // Our first time we simply append the coordinates, subsequet times
                        // we append a ", " to distinguish each coordinate pair.
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

            return result
                ? result.value
                : defaultValue;
        }

        private static getDefinedNumberValue(value: any): number {
            return isNaN(value) || value === null
                ? EnhancedScatterChart.DefaultPosition
                : value;
        }

        private static getDefinedNumberByCategoryId(column: DataViewValueColumn, index: number): number {
            return column
                && column.values
                && !(column.values[index] === null)
                && !isNaN(column.values[index] as number)
                ? Number(column.values[index])
                : null;
        }

        constructor(options: VisualConstructorOptions) {
            this.init(options);
        }

        public init(options: VisualConstructorOptions): void {
            this.element = options.element;

            this.behavior = new CustomVisualBehavior([new EnhancedScatterChartWebBehavior(
                EnhancedScatterChart.DimmedBubbleOpacity,
                EnhancedScatterChart.DefaultBubbleOpacity
            )]);

            this.visualHost = options.host;
            this.colorPalette = options.host.colorPalette;

            this.tooltipServiceWrapper = createTooltipServiceWrapper(
                this.visualHost.tooltipService,
                this.element);

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
                .classed(EnhancedScatterChart.SvgScrollableSelector.class, true);

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
                    .classed(EnhancedScatterChart.XAxisSelector.class, true)
                : this.axisGraphicsContextScrollable
                    .append("g")
                    .classed(EnhancedScatterChart.XAxisSelector.class, true);

            this.y1AxisGraphicsContext = axisGroup
                .append("g")
                .classed(EnhancedScatterChart.YAxisSelector.class, true);

            this.xAxisGraphicsContext.classed(
                EnhancedScatterChart.ShowLinesOnAxisSelector.class,
                this.scrollY);

            this.y1AxisGraphicsContext.classed(
                EnhancedScatterChart.ShowLinesOnAxisSelector.class,
                this.scrollX);

            this.xAxisGraphicsContext.classed(
                EnhancedScatterChart.HideLinesOnAxisSelector.class,
                !this.scrollY);

            this.y1AxisGraphicsContext.classed(
                EnhancedScatterChart.HideLinesOnAxisSelector.class,
                !this.scrollX);

            this.interactivityService = createInteractivityService(this.visualHost);

            this.legend = createLegend(
                $(this.element),
                false,
                this.interactivityService,
                true);

            this.mainGraphicsG = this.axisGraphicsContextScrollable
                .append("g")
                .classed(EnhancedScatterChart.MainGraphicsContextClassName, true);

            this.mainGraphicsSVGSelection = this.mainGraphicsG.append("svg");
            this.mainGraphicsContext = this.mainGraphicsSVGSelection.append("g");
        }

        private adjustMargins(): void {
            // Adjust margins if ticks are not going to be shown on either axis
            const xAxis: JQuery = $(this.element).find(EnhancedScatterChart.XAxisSelector.selector);

            if (axis.getRecommendedNumberOfTicksForXAxis(this.viewportIn.width) === EnhancedScatterChart.MinAmountOfTicks
                && axis.getRecommendedNumberOfTicksForYAxis(this.viewportIn.height) === EnhancedScatterChart.MinAmountOfTicks) {

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

        private getValueAxisProperties(
            dataViewMetadata: DataViewMetadata,
            axisTitleOnByDefault?: boolean): DataViewObject {

            let dataViewObject: DataViewObject = {};

            if (!dataViewMetadata) {
                return dataViewObject;
            }

            const objects: DataViewObjects = dataViewMetadata.objects;

            if (objects) {
                const valueAxisObject: DataViewObject = objects["valueAxis"];

                if (valueAxisObject) {
                    dataViewObject = {
                        show: valueAxisObject["show"],
                        position: valueAxisObject["position"],
                        axisScale: valueAxisObject["axisScale"],
                        start: valueAxisObject["start"],
                        end: valueAxisObject["end"],
                        showAxisTitle: valueAxisObject["showAxisTitle"] == null
                            ? axisTitleOnByDefault
                            : valueAxisObject["showAxisTitle"],
                        axisStyle: valueAxisObject["axisStyle"],
                        axisColor: valueAxisObject["axisColor"],
                        secShow: valueAxisObject["secShow"],
                        secPosition: valueAxisObject["secPosition"],
                        secAxisScale: valueAxisObject["secAxisScale"],
                        secStart: valueAxisObject["secStart"],
                        secEnd: valueAxisObject["secEnd"],
                        secShowAxisTitle: valueAxisObject["secShowAxisTitle"],
                        secAxisStyle: valueAxisObject["secAxisStyle"],
                        labelDisplayUnits: valueAxisObject["labelDisplayUnits"],
                    };
                }
            }

            return dataViewObject;
        }

        private getCategoryAxisProperties(
            dataViewMetadata: DataViewMetadata,
            axisTitleOnByDefault?: boolean): DataViewObject {

            let dataViewObject: DataViewObject = {};

            if (!dataViewMetadata) {
                return dataViewObject;
            }

            const objects: DataViewObjects = dataViewMetadata.objects;

            if (objects) {
                const categoryAxisObject: DataViewObject = objects["categoryAxis"];

                if (categoryAxisObject) {
                    dataViewObject = {
                        show: categoryAxisObject["show"],
                        axisType: categoryAxisObject["axisType"],
                        axisScale: categoryAxisObject["axisScale"],
                        axisColor: categoryAxisObject["axisColor"],
                        start: categoryAxisObject["start"],
                        end: categoryAxisObject["end"],
                        showAxisTitle: categoryAxisObject["showAxisTitle"] == null
                            ? axisTitleOnByDefault
                            : categoryAxisObject["showAxisTitle"],
                        axisStyle: categoryAxisObject["axisStyle"],
                        labelDisplayUnits: categoryAxisObject["labelDisplayUnits"]
                    };
                }
            }

            return dataViewObject;
        }

        public static converter(
            dataView: DataView,
            colorPalette: IColorPalette,
            visualHost: IVisualHost,
            interactivityService?: IInteractivityService,
            categoryAxisProperties?: DataViewObject,
            valueAxisProperties?: DataViewObject): EnhancedScatterChartData {

            if (!dataView) {
                return EnhancedScatterChart.getDefaultData();
            }

            let categoryValues: any[],
                categoryFormatter: IValueFormatter,
                categoryObjects: DataViewObjects[],
                categoryIdentities: DataViewScopeIdentity[],
                categoryQueryName: string,
                dataViewCategorical: DataViewCategorical = dataView.categorical,
                dataViewMetadata: DataViewMetadata = dataView.metadata,
                categories: DataViewCategoryColumn[] = dataViewCategorical.categories || [],
                dataValues: DataViewValueColumns = dataViewCategorical.values,
                hasDynamicSeries: boolean = !!dataValues.source,
                grouped: DataViewValueColumnGroup[] = dataValues.grouped(),
                dvSource: DataViewMetadataColumn = dataValues.source,
                scatterMetadata: EnhancedScatterChartMeasureMetadata = EnhancedScatterChart.getMetadata(
                    categories,
                    grouped,
                    dvSource),
                categoryIndex: number = scatterMetadata.idx.category,
                useShape: boolean = scatterMetadata.idx.image >= EnhancedScatterChart.MinIndex,
                useCustomColor: boolean = scatterMetadata.idx.colorFill >= EnhancedScatterChart.MinIndex;

            if (dataViewCategorical.categories
                && dataViewCategorical.categories.length > 0
                && dataViewCategorical.categories[categoryIndex]) {

                const mainCategory: DataViewCategoryColumn = dataViewCategorical.categories[categoryIndex];

                categoryValues = mainCategory.values;

                categoryFormatter = valueFormatter.create({
                    format: valueFormatter.getFormatStringByColumn(mainCategory.source),
                    value: categoryValues[0],
                    value2: categoryValues[categoryValues.length - 1]
                });

                categoryIdentities = mainCategory.identity;
                categoryObjects = mainCategory.objects;

                categoryQueryName = mainCategory.source
                    ? mainCategory.source.queryName
                    : null;
            }
            else {
                categoryValues = [null];

                // creating default formatter for null value (to get the right string of empty value from the locale)
                categoryFormatter = valueFormatter.createDefaultFormatter(null);
            }

            let dataLabelsSettings: PointDataLabelsSettings = dataLabelUtils.getDefaultPointLabelSettings(),
                fillPoint: boolean = EnhancedScatterChart.DefaultFillPoint,
                backdrop: EnhancedScatterChartBackdrop = {
                    show: EnhancedScatterChart.DefaultBackdrop.show,
                    url: EnhancedScatterChart.DefaultBackdrop.url
                },
                crosshair: boolean = EnhancedScatterChart.DefaultCrosshair,
                outline: boolean = EnhancedScatterChart.DefaultOutline,
                defaultDataPointColor: string = EnhancedScatterChart.EmptyString,
                showAllDataPoints: boolean = EnhancedScatterChart.DefaultShowAllDataPoints;

            if (dataViewMetadata && dataViewMetadata.objects) {
                const objects: DataViewObjects = dataViewMetadata.objects;

                defaultDataPointColor = DataViewObjects.getFillColor(
                    objects,
                    PropertiesOfCapabilities["dataPoint"]["defaultColor"]);

                showAllDataPoints = DataViewObjects.getValue<boolean>(
                    objects,
                    PropertiesOfCapabilities["dataPoint"]["showAllDataPoints"]);

                const labelsObj: DataViewObject = objects["categoryLabels"];

                if (labelsObj) {
                    dataLabelsSettings.show = (labelsObj["show"] !== undefined)
                        ? labelsObj["show"] as boolean
                        : dataLabelsSettings.show;

                    dataLabelsSettings.fontSize = (labelsObj["fontSize"] !== undefined)
                        ? labelsObj["fontSize"] as number
                        : dataLabelsSettings.fontSize;

                    if (labelsObj["color"] !== undefined) {
                        dataLabelsSettings.labelColor = (labelsObj["color"] as Fill).solid.color;
                    }
                }

                fillPoint = DataViewObjects.getValue<boolean>(
                    objects,
                    PropertiesOfCapabilities["fillPoint"]["show"],
                    fillPoint);

                const backdropObject: DataViewObject = objects["backdrop"];

                if (backdropObject !== undefined) {
                    backdrop.show = backdropObject["show"] as boolean;

                    if (backdrop.show) {
                        backdrop.url = backdropObject["url"] as string;
                    }
                }

                const crosshairObject: DataViewObject = objects["crosshair"];

                if (crosshairObject !== undefined) {
                    crosshair = crosshairObject["show"] as boolean;
                }

                const outlineObject: DataViewObject = objects["outline"];

                if (outlineObject !== undefined) {
                    outline = outlineObject["show"] as boolean;
                }
            }

            const dataPoints: EnhancedScatterChartDataPoint[] = EnhancedScatterChart.createDataPoints(
                visualHost,
                dataValues,
                scatterMetadata,
                categories,
                categoryValues,
                categoryFormatter,
                categoryIdentities,
                categoryObjects,
                colorPalette,
                hasDynamicSeries,
                dataLabelsSettings,
                defaultDataPointColor,
                categoryQueryName);

            if (interactivityService) {
                interactivityService.applySelectionStateToData(dataPoints);
            }

            let legendItems: LegendDataPoint[] = [];

            if (hasDynamicSeries) {
                const formatString: string = valueFormatter.getFormatStringByColumn(dvSource);

                legendItems = EnhancedScatterChart.createSeriesLegend(
                    visualHost,
                    dataValues,
                    colorPalette,
                    dataValues,
                    formatString,
                    defaultDataPointColor);
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

            const legendData: LegendData = {
                title: legendTitle,
                dataPoints: legendItems
            };

            const sizeRange: ValueRange<number> = EnhancedScatterChart.getSizeRangeForGroups(
                grouped,
                scatterMetadata.idx.size);

            if (categoryAxisProperties
                && categoryAxisProperties["showAxisTitle"] !== null
                && categoryAxisProperties["showAxisTitle"] === false) {
                scatterMetadata.axesLabels.x = null;
            }
            if (valueAxisProperties
                && valueAxisProperties["showAxisTitle"] !== null
                && valueAxisProperties["showAxisTitle"] === false) {
                scatterMetadata.axesLabels.y = null;
            }

            if (dataPoints && dataPoints[0]) {
                const dataPoint: EnhancedScatterChartDataPoint = dataPoints[0];

                if (dataPoint.backdrop != null) {
                    backdrop.show = true;
                    backdrop.url = dataPoint.backdrop;
                }

                if (dataPoint.xStart != null) {
                    categoryAxisProperties["start"] = dataPoint.xStart;
                }

                if (dataPoint.xEnd != null) {
                    categoryAxisProperties["end"] = dataPoint.xEnd;
                }

                if (dataPoint.yStart != null) {
                    valueAxisProperties["start"] = dataPoint.yStart;
                }

                if (dataPoint.yEnd != null) {
                    valueAxisProperties["end"] = dataPoint.yEnd;
                }
            }

            return {
                dataPoints,
                legendData,
                sizeRange,
                dataLabelsSettings,
                defaultDataPointColor,
                hasDynamicSeries,
                showAllDataPoints,
                fillPoint,
                useShape,
                useCustomColor,
                backdrop,
                crosshair,
                outline,
                xCol: scatterMetadata.cols.x,
                yCol: scatterMetadata.cols.y,
                axesLabels: scatterMetadata.axesLabels,
                selectedIds: [],
                size: scatterMetadata.cols.size
            };
        }

        private static createSeriesLegend(
            visualHost: IVisualHost,
            dataValues: DataViewValueColumns,
            colorPalette: IColorPalette,
            categorical: DataViewValueColumns,
            formatString: string,
            defaultDataPointColor: string): LegendDataPoint[] {

            const legendItems: LegendDataPoint[] = [],
                grouped: DataViewValueColumnGroup[] = dataValues.grouped(),
                colorHelper: ColorHelper = new ColorHelper(
                    colorPalette,
                    PropertiesOfCapabilities["dataPoint"]["fill"],
                    defaultDataPointColor);

            for (let i: number = 0, len: number = grouped.length; i < len; i++) {
                let grouping: DataViewValueColumnGroup = grouped[i],
                    selectionId: ISelectionId,
                    color: string;

                color = colorHelper.getColorForSeriesValue(
                    grouping.objects,
                    grouping.name);

                selectionId = visualHost.createSelectionIdBuilder()
                    .withSeries(dataValues, grouping)
                    .createSelectionId();

                legendItems.push({
                    color: color,
                    icon: LegendIcon.Circle,
                    label: valueFormatter.format(grouping.name, formatString),
                    identity: selectionId,
                    selected: EnhancedScatterChart.DefaultSelectionStateOfTheDataPoint
                });
            }

            return legendItems;
        }

        private static getSizeRangeForGroups(
            dataViewValueGroups: DataViewValueColumnGroup[],
            sizeColumnIndex: number): NumberRange {

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
            source: DataViewMetadataColumn): EnhancedScatterChartMeasureMetadata {

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

        public static createLazyFormattedCategory(formatter: IValueFormatter, value: string): () => string {
            return () => formatter.format(value);
        }

        private static createDataPoints(
            visualHost: IVisualHost,
            dataValues: DataViewValueColumns,
            metadata: EnhancedScatterChartMeasureMetadata,
            categories: DataViewCategoryColumn[],
            categoryValues: any[],
            categoryFormatter: IValueFormatter,
            categoryIdentities: DataViewScopeIdentity[],
            categoryObjects: DataViewObjects[],
            colorPalette: IColorPalette,
            hasDynamicSeries: boolean,
            labelSettings: PointDataLabelsSettings,
            defaultDataPointColor?: string,
            categoryQueryName?: string): EnhancedScatterChartDataPoint[] {

            let dataPoints: EnhancedScatterChartDataPoint[] = [],
                colorHelper: ColorHelper,
                indicies: EnhancedScatterChartMeasureMetadataIndexes = metadata.idx,
                dataValueSource: DataViewMetadataColumn = dataValues.source,
                grouped: DataViewValueColumnGroup[] = dataValues.grouped(),
                fontSizeInPx: string = PixelConverter.fromPoint(labelSettings.fontSize);

            colorHelper = new ColorHelper(
                colorPalette,
                PropertiesOfCapabilities.dataPoint.fill,
                defaultDataPointColor);

            for (let categoryIdx: number = 0, ilen: number = categoryValues.length; categoryIdx < ilen; categoryIdx++) {
                const categoryValue: any = categoryValues[categoryIdx];

                for (let seriesIdx: number = 0, len: number = grouped.length; seriesIdx < len; seriesIdx++) {
                    const measureColorFill: DataViewCategoryColumn = categories[indicies.colorFill],
                        measureImage: DataViewCategoryColumn = categories[indicies.image],
                        measureBackdrop: DataViewCategoryColumn = categories[indicies.backdrop];

                    const grouping: DataViewValueColumnGroup = grouped[seriesIdx],
                        seriesValues: DataViewValueColumn[] = grouping.values,
                        measureX: DataViewValueColumn = EnhancedScatterChart.getMeasureValue(
                            indicies.x,
                            seriesValues),
                        measureY: DataViewValueColumn = EnhancedScatterChart.getMeasureValue(
                            indicies.y,
                            seriesValues),
                        measureSize: DataViewValueColumn = EnhancedScatterChart.getMeasureValue(
                            indicies.size,
                            seriesValues),
                        measureShape: DataViewValueColumn = EnhancedScatterChart.getMeasureValue(
                            indicies.shape,
                            seriesValues),
                        measureRotation: DataViewValueColumn = EnhancedScatterChart.getMeasureValue(
                            indicies.rotation,
                            seriesValues),
                        measureXStart: DataViewValueColumn = EnhancedScatterChart.getMeasureValue(
                            indicies.xStart,
                            seriesValues),
                        measureXEnd: DataViewValueColumn = EnhancedScatterChart.getMeasureValue(
                            indicies.xEnd,
                            seriesValues),
                        measureYStart: DataViewValueColumn = EnhancedScatterChart.getMeasureValue(
                            indicies.yStart,
                            seriesValues),
                        measureYEnd: DataViewValueColumn = EnhancedScatterChart.getMeasureValue(
                            indicies.yEnd,
                            seriesValues);

                    // TODO: need to update (refactor) these lines below.
                    const xVal: PrimitiveValue = EnhancedScatterChart.getDefinedNumberByCategoryId(
                        measureX,
                        categoryIdx);

                    const yVal: PrimitiveValue = EnhancedScatterChart.getDefinedNumberByCategoryId(
                        measureY,
                        categoryIdx);

                    const hasNullValue: boolean = (xVal == null) || (yVal == null);

                    if (hasNullValue) {
                        continue;
                    }

                    let size: number,
                        colorFill: string,
                        shapeSymbolType: ShapeFunction,
                        image: string,
                        rotation: number,
                        backdrop: string,
                        xStart: number,
                        xEnd: number,
                        yStart: number,
                        yEnd: number,
                        color: string;

                    size = EnhancedScatterChart.getValueFromDataViewValueColumnById(measureSize, categoryIdx);

                    colorFill = EnhancedScatterChart.getValueFromDataViewValueColumnById(
                        measureColorFill, categoryIdx);

                    shapeSymbolType = EnhancedScatterChart.getCustomSymbolType(
                        EnhancedScatterChart.getValueFromDataViewValueColumnById(measureShape, categoryIdx));

                    image = EnhancedScatterChart.getValueFromDataViewValueColumnById(measureImage, categoryIdx);

                    if (image && !ValidationHelper.isImageUrlAllowed(image)) {
                        image = null;
                    }

                    rotation = EnhancedScatterChart.getNumberFromDataViewValueColumnById(measureRotation, categoryIdx);
                    backdrop = EnhancedScatterChart.getValueFromDataViewValueColumnById(measureBackdrop, categoryIdx);
                    xStart = EnhancedScatterChart.getValueFromDataViewValueColumnById(measureXStart, categoryIdx);
                    xEnd = EnhancedScatterChart.getValueFromDataViewValueColumnById(measureXEnd, categoryIdx);
                    yStart = EnhancedScatterChart.getValueFromDataViewValueColumnById(measureYStart, categoryIdx);
                    yEnd = EnhancedScatterChart.getValueFromDataViewValueColumnById(measureYEnd, categoryIdx);

                    if (hasDynamicSeries) {
                        color = colorHelper.getColorForSeriesValue(grouping.objects, grouping.name);
                    } else {
                        // If we have no Size measure then use a blank query name
                        let measureSource: string = (measureSize != null)
                            ? measureSize.source.queryName
                            : EnhancedScatterChart.EmptyString;

                        color = colorHelper.getColorForMeasure(
                            categoryObjects && categoryObjects[categoryIdx],
                            measureSource);
                    }

                    let category: DataViewCategoryColumn = categories && categories.length > EnhancedScatterChart.MinAmountOfCategories
                        ? categories[indicies.category]
                        : null;

                    const identity: ISelectionId = visualHost.createSelectionIdBuilder()
                        .withCategory(category, categoryIdx)
                        .withSeries(dataValues, grouping)
                        .createSelectionId();

                    // TODO: need to refactor these lines below.
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

                    if (measureX) {
                        seriesData.push({
                            value: xVal,
                            metadata: measureX
                        });
                    }

                    if (measureY) {
                        seriesData.push({
                            value: yVal,
                            metadata: measureY
                        });
                    }

                    if (measureSize
                        && measureSize.values
                        && measureSize.values.length > EnhancedScatterChart.MinAmountOfValues) {

                        seriesData.push({
                            value: measureSize.values[categoryIdx],
                            metadata: measureSize
                        });
                    }

                    if (measureColorFill
                        && measureColorFill.values
                        && measureColorFill.values.length > EnhancedScatterChart.MinAmountOfValues) {

                        seriesData.push({
                            value: measureColorFill.values[categoryIdx],
                            metadata: measureColorFill
                        });
                    }

                    if (measureShape
                        && measureShape.values
                        && measureShape.values.length > EnhancedScatterChart.MinAmountOfValues) {

                        seriesData.push({
                            value: measureShape.values[categoryIdx],
                            metadata: measureShape
                        });
                    }

                    if (measureImage
                        && measureImage.values
                        && measureImage.values.length > EnhancedScatterChart.MinAmountOfValues) {

                        seriesData.push({
                            value: measureImage.values[categoryIdx],
                            metadata: measureImage
                        });
                    }

                    if (measureRotation
                        && measureRotation.values
                        && measureRotation.values.length > EnhancedScatterChart.MinAmountOfValues) {

                        seriesData.push({
                            value: measureRotation.values[categoryIdx],
                            metadata: measureRotation
                        });
                    }

                    if (measureBackdrop
                        && measureBackdrop.values
                        && measureBackdrop.values.length > EnhancedScatterChart.MinAmountOfValues) {

                        seriesData.push({
                            value: measureBackdrop.values[categoryIdx],
                            metadata: measureBackdrop
                        });
                    }

                    if (measureXStart
                        && measureXStart.values
                        && measureXStart.values.length > EnhancedScatterChart.MinAmountOfValues) {

                        seriesData.push({
                            value: measureXStart.values[categoryIdx],
                            metadata: measureXStart
                        });
                    }

                    if (measureXEnd
                        && measureXEnd.values
                        && measureXEnd.values.length > EnhancedScatterChart.MinAmountOfValues) {

                        seriesData.push({
                            value: measureXEnd.values[categoryIdx],
                            metadata: measureXEnd
                        });
                    }

                    if (measureYStart
                        && measureYStart.values
                        && measureYStart.values.length > EnhancedScatterChart.MinAmountOfValues) {

                        seriesData.push({
                            value: measureYStart.values[categoryIdx],
                            metadata: measureYStart
                        });
                    }

                    if (measureYEnd
                        && measureYEnd.values
                        && measureYEnd.values.length > EnhancedScatterChart.MinAmountOfValues) {

                        seriesData.push({
                            value: measureYEnd.values[categoryIdx],
                            metadata: measureYEnd
                        });
                    }

                    const tooltipInfo: VisualTooltipDataItem[] = tooltipBuilder.createTooltipInfo(
                        categoryValue,
                        category ? [category] : undefined,
                        seriesData);

                    dataPoints.push({
                        size,
                        rotation,
                        backdrop,
                        xStart,
                        xEnd,
                        yStart,
                        yEnd,
                        identity,
                        colorFill,
                        shapeSymbolType,
                        tooltipInfo,
                        x: xVal,
                        y: yVal,
                        radius: {
                            sizeMeasure: measureSize,
                            index: categoryIdx
                        },
                        fill: color,
                        formattedCategory: this.createLazyFormattedCategory(categoryFormatter, categoryValue),
                        selected: EnhancedScatterChart.DefaultSelectionStateOfTheDataPoint,
                        labelFill: labelSettings.labelColor,
                        labelFontSize: fontSizeInPx,
                        contentPosition: EnhancedScatterChart.DefaultContentPosition,
                        svgurl: image,
                    });
                }
            }

            return dataPoints;
        }

        private static getMeasureValue(
            measureIndex: number,
            seriesValues: DataViewValueColumn[]): DataViewValueColumn {

            if (seriesValues && measureIndex >= EnhancedScatterChart.MinIndex) {
                return seriesValues[measureIndex];
            }

            return null;
        }

        private static getNumberFromDataViewValueColumnById(
            dataViewValueColumn: DataViewCategoryColumn | DataViewValueColumn,
            index: number): number {

            const value: number = EnhancedScatterChart.getValueFromDataViewValueColumnById(
                dataViewValueColumn,
                index);

            return value && !isNaN(value)
                ? value
                : EnhancedScatterChart.DefaultColumnId;
        }

        private static getValueFromDataViewValueColumnById(
            dataViewValueColumn: DataViewCategoryColumn | DataViewValueColumn,
            index: number): any {

            return dataViewValueColumn && dataViewValueColumn.values
                ? dataViewValueColumn.values[index]
                : null;
        }

        private static getDefaultData(): EnhancedScatterChartData {
            return {
                xCol: undefined,
                yCol: undefined,
                dataPoints: [],
                legendData: {
                    dataPoints: []
                },
                axesLabels: {
                    x: EnhancedScatterChart.EmptyString,
                    y: EnhancedScatterChart.EmptyString
                },
                selectedIds: [],
                sizeRange: [],
                dataLabelsSettings: dataLabelUtils.getDefaultPointLabelSettings(),
                defaultDataPointColor: null,
                hasDynamicSeries: false,
                useShape: false,
                useCustomColor: false,
            };
        }

        public setData(dataViews: DataView[]): void {
            this.data = EnhancedScatterChart.getDefaultData();

            if (dataViews && dataViews.length > 0) {
                const dataView: DataView = dataViews[0];

                if (dataView) {
                    this.categoryAxisProperties = this.getCategoryAxisProperties(dataView.metadata, true);
                    this.valueAxisProperties = this.getValueAxisProperties(dataView.metadata, true);

                    this.dataView = dataView;

                    if (dataView.categorical && dataView.categorical.values) {
                        this.data = EnhancedScatterChart.converter(
                            dataView,
                            this.colorPalette,
                            this.visualHost,
                            this.interactivityService,
                            this.categoryAxisProperties,
                            this.valueAxisProperties);
                    }
                }
            }
        }

        public update(options: VisualUpdateOptions) {
            const dataViews: DataView[] = this.dataViews = options.dataViews;

            this.viewport = _.clone(options.viewport);

            if (!dataViews) {
                return;
            }

            if (dataViews && dataViews.length > EnhancedScatterChart.MinAmountOfDataViews) {
                this.populateObjectProperties(dataViews);
            }

            this.setData(dataViews);

            this.renderLegend();
            this.render();
        }

        private populateObjectProperties(dataViews: DataView[]): void {
            if (dataViews && dataViews.length > EnhancedScatterChart.MinAmountOfDataViews) {
                const dataViewMetadata: DataViewMetadata = dataViews[0].metadata;

                if (dataViewMetadata) {
                    this.legendObjectProperties = DataViewObjects.getObject(
                        dataViewMetadata.objects,
                        "legend",
                        {});
                }
                else {
                    this.legendObjectProperties = {};
                }

                this.categoryAxisProperties = this.getCategoryAxisProperties(dataViewMetadata);
                this.valueAxisProperties = this.getValueAxisProperties(dataViewMetadata);

                const axisPosition: DataViewPropertyValue = this.valueAxisProperties["position"];

                this.yAxisOrientation = axisPosition
                    ? axisPosition.toString()
                    : yAxisPosition.left;
            }
        }

        private renderLegend(): void {
            const legendData: LegendData = {
                title: EnhancedScatterChart.EmptyString,
                dataPoints: []
            };

            const legend: ILegend = this.legend;

            this.layerLegendData = this.data.legendData;

            if (this.layerLegendData) {
                legendData.title = this.layerLegendData.title || EnhancedScatterChart.EmptyString;

                legendData.dataPoints = legendData.dataPoints.concat(this.layerLegendData.dataPoints || []);

                legendData.fontSize = this.legendLabelFontSize
                    ? this.legendLabelFontSize
                    : EnhancedScatterChart.LegendLabelFontSizeDefault;

                legendData.grouped = !!this.layerLegendData.grouped;
            }

            const legendProperties: DataViewObject = this.legendObjectProperties;

            if (legendProperties) {
                legendDataModule.update(legendData, legendProperties);

                const position: string = legendProperties[legendProps.position] as string;

                if (position) {
                    legend.changeOrientation(LegendPosition[position]);
                }
            }
            else {
                legend.changeOrientation(LegendPosition.Top);
            }

            if (legendData.dataPoints.length === EnhancedScatterChart.MinAmountOfDataPointsInTheLegend
                && !legendData.grouped) {

                legendData.dataPoints = [];
            }

            legend.drawLegend(legendData, {
                height: this.viewport.height,
                width: this.viewport.width
            });

            legendModule.positionChartArea(this.svg, legend);
        }

        private shouldRenderAxis(
            axisProperties: IAxisProperties,
            propertyName: string = "show"): boolean {

            if (!axisProperties) {
                return false;
            }
            else if (axisProperties.isCategoryAxis
                && (!this.categoryAxisProperties
                    || this.categoryAxisProperties[propertyName] == null
                    || this.categoryAxisProperties[propertyName])) {

                return axisProperties.values && axisProperties.values.length > EnhancedScatterChart.MinAmountOfValues;
            }
            else if (!axisProperties.isCategoryAxis && (!this.valueAxisProperties
                || this.valueAxisProperties[propertyName] == null
                || this.valueAxisProperties[propertyName])) {

                return axisProperties.values && axisProperties.values.length > EnhancedScatterChart.MinAmountOfValues;
            }

            return false;
        }

        private adjustViewportbyBackdrop(): void {
            const img: HTMLImageElement = new Image(),
                that: EnhancedScatterChart = this;

            img.src = this.data.backdrop.url;
            img.onload = function () {
                const imageElement: HTMLImageElement = this as HTMLImageElement;
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

        public render(): void {
            this.viewport.height -= this.legendViewport.height;
            this.viewport.width -= this.legendViewport.width;

            if (this.viewportIn.width === EnhancedScatterChart.MinViewport.width
                || this.viewportIn.height === EnhancedScatterChart.MinViewport.height) {

                return;
            }

            const maxMarginFactor: number = EnhancedScatterChart.MaxMarginFactor;

            this.leftRightMarginLimit = this.viewport.width * maxMarginFactor;

            this.bottomMarginLimit = Math.max(
                EnhancedScatterChart.DefaultMargin.bottom,
                Math.ceil(this.viewport.height * maxMarginFactor));

            // reset defaults
            this.margin.top = EnhancedScatterChart.DefaultMargin.top;
            this.margin.bottom = this.bottomMarginLimit;
            this.margin.right = EnhancedScatterChart.DefaultMargin.right;

            this.calculateAxes(
                this.categoryAxisProperties,
                this.valueAxisProperties,
                EnhancedScatterChart.TextProperties,
                true);

            this.yAxisIsCategorical = this.yAxisProperties.isCategoryAxis;

            this.hasCategoryAxis = this.yAxisIsCategorical
                ? this.yAxisProperties && this.yAxisProperties.values.length > EnhancedScatterChart.MinAmountOfValues
                : this.xAxisProperties && this.xAxisProperties.values.length > EnhancedScatterChart.MinAmountOfValues;

            const renderXAxis: boolean = this.shouldRenderAxis(this.xAxisProperties),
                renderY1Axis: boolean = this.shouldRenderAxis(this.yAxisProperties);

            this.isXScrollBarVisible = EnhancedScatterChart.isScrollbarVisible;
            this.isYScrollBarVisible = EnhancedScatterChart.isScrollbarVisible;

            let tickLabelMargins: axis.TickLabelMargins,
                axisLabels: ChartAxesLabels,
                chartHasAxisLabels: boolean;

            const showY1OnRight: boolean = this.yAxisOrientation === yAxisPosition.right;

            this.calculateAxes(
                this.categoryAxisProperties,
                this.valueAxisProperties,
                EnhancedScatterChart.TextProperties);

            let doneWithMargins: boolean = EnhancedScatterChart.DefaultValueOfDoneWithMargins,
                maxIterations: number = EnhancedScatterChart.MaxIterations,
                numIterations: number = EnhancedScatterChart.DefaultNumIterations;

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

                let xMax: number = tickLabelMargins.xMax;

                maxMainYaxisSide += EnhancedScatterChart.AxisSide;
                maxSecondYaxisSide += EnhancedScatterChart.AxisSide;

                xMax += EnhancedScatterChart.XMaxOffset;

                if (showY1OnRight && renderY1Axis) {
                    maxSecondYaxisSide += EnhancedScatterChart.SecondAxisSide;
                }

                if (!showY1OnRight && renderY1Axis) {
                    maxMainYaxisSide += EnhancedScatterChart.SecondAxisSide;
                }

                this.addUnitTypeToAxisLabel(this.xAxisProperties, this.yAxisProperties);

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

                // re-calculate the axes with the new margins
                const previousTickCountY1: number = this.yAxisProperties.values.length;

                this.calculateAxes(
                    this.categoryAxisProperties,
                    this.valueAxisProperties,
                    EnhancedScatterChart.TextProperties);

                // the minor padding adjustments could have affected the chosen tick values, which would then need to calculate margins again
                // e.g. [0,2,4,6,8] vs. [0,5,10] the 10 is wider and needs more margin.
                if (this.yAxisProperties.values.length === previousTickCountY1) {
                    doneWithMargins = !EnhancedScatterChart.DefaultValueOfDoneWithMargins;
                }
            }

            let isImageValid: boolean = ValidationHelper.isImageUrlAllowed(this.data.backdrop.url);

            // we have to do the above process again since changes are made to viewport.
            if (this.data.backdrop
                && this.data.backdrop.show
                && (this.data.backdrop.url !== undefined)
                && isImageValid) {

                this.adjustViewportbyBackdrop();

                doneWithMargins = EnhancedScatterChart.DefaultValueOfDoneWithMargins;
                maxIterations = EnhancedScatterChart.MaxIterations;
                numIterations = EnhancedScatterChart.DefaultNumIterations;

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

                    if (showY1OnRight && renderY1Axis) {
                        maxSecondYaxisSide += EnhancedScatterChart.SecondYAxisSide;
                    }

                    xMax += EnhancedScatterChart.XMaxOffset;

                    this.addUnitTypeToAxisLabel(this.xAxisProperties, this.yAxisProperties);

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
                        this.categoryAxisProperties,
                        this.valueAxisProperties,
                        EnhancedScatterChart.TextProperties);

                    // the minor padding adjustments could have affected the chosen tick values, which would then need to calculate margins again
                    // e.g. [0,2,4,6,8] vs. [0,5,10] the 10 is wider and needs more margin.
                    if (this.yAxisProperties.values.length === this.yAxisProperties.values.length) {
                        doneWithMargins = !EnhancedScatterChart.DefaultValueOfDoneWithMargins;
                    }
                }
            }

            this.renderChart(
                this.xAxisProperties,
                this.yAxisProperties,
                tickLabelMargins,
                chartHasAxisLabels,
                axisLabels,
                isImageValid);

            this.updateAxis();

            if (!this.data) {
                return;
            }

            const data: EnhancedScatterChartData = this.data,
                dataPoints: EnhancedScatterChartDataPoint[] = this.data.dataPoints,
                hasSelection: boolean = this.interactivityService && this.interactivityService.hasSelection();

            this.mainGraphicsSVGSelection.attr({
                "width": this.viewportIn.width,
                "height": this.viewportIn.height
            });

            const sortedData: EnhancedScatterChartDataPoint[] = dataPoints.sort(
                (firstDataPoint: EnhancedScatterChartDataPoint, secondDataPoint: EnhancedScatterChartDataPoint) => {
                    return secondDataPoint.radius.sizeMeasure
                        ? secondDataPoint.radius.sizeMeasure.values[secondDataPoint.radius.index] as number
                        - (firstDataPoint.radius.sizeMeasure.values[firstDataPoint.radius.index] as number)
                        : EnhancedScatterChart.DefaultSizeMeasure;
                });

            const scatterMarkers: UpdateSelection<EnhancedScatterChartDataPoint> = this.drawScatterMarkers(
                sortedData,
                hasSelection,
                data.sizeRange,
                EnhancedScatterChart.AnimationDuration),
                dataLabelsSettings: PointDataLabelsSettings = this.data.dataLabelsSettings;

            if (dataLabelsSettings.show) {
                let layout: ILabelLayout,
                    clonedDataPoints: EnhancedScatterChartDataPoint[],
                    labels: UpdateSelection<any>;

                layout = this.getEnhanchedScatterChartLabelLayout(dataLabelsSettings, this.viewportIn, data.sizeRange);

                clonedDataPoints = this.cloneDataPoints(dataPoints);

                // fix bug 3863: drawDefaultLabelsForDataPointChart add to datapoints[xxx].size = object, which causes when
                // category labels is on and Fill Points option off to fill the points when mouse click occures because of default size
                // is set to datapoints.
                labels = dataLabelUtils.drawDefaultLabelsForDataPointChart(
                    clonedDataPoints,
                    this.mainGraphicsG,
                    layout,
                    this.viewportIn);

                if (labels) {
                    labels.attr("transform", (d: EnhancedScatterChartDataPoint) => {
                        let size: ISize = <ISize>d.size,
                            dx: number,
                            dy: number;

                        dx = size.width / EnhancedScatterChart.DataLabelXOffset;
                        dy = size.height / EnhancedScatterChart.DataLabelYOffset;

                        return svg.translate(dx, dy);
                    });
                }
            }
            else {
                dataLabelUtils.cleanDataLabels(this.mainGraphicsG);
            }

            this.renderCrosshair(data);

            this.bindTooltip(scatterMarkers);

            this.bindInteractivityService(
                scatterMarkers,
                dataPoints);
        }

        private bindTooltip(selection: Selection<TooltipEnabledDataPoint>): void {
            this.tooltipServiceWrapper.addTooltip(
                selection,
                (tooltipEvent: TooltipEventArgs<TooltipEnabledDataPoint>) => {
                    return tooltipEvent.data.tooltipInfo;
                });
        }

        private bindInteractivityService(
            dataPointsSelection: Selection<EnhancedScatterChartDataPoint>,
            dataPoints: EnhancedScatterChartDataPoint[]): void {

            if (!this.behavior || !this.interactivityService) {
                return;
            }

            const behaviorOptions: EnhancedScatterBehaviorOptions = {
                dataPointsSelection,
                data: this.data,
                plotContext: this.mainGraphicsSVGSelection,
            };

            const cbehaviorOptions: CustomVisualBehaviorOptions = {
                layerOptions: [behaviorOptions],
                clearCatcher: this.clearCatcher,
            };

            this.interactivityService.bind(dataPoints, this.behavior, cbehaviorOptions);
        }

        private cloneDataPoints(dataPoints: EnhancedScatterChartDataPoint[]): EnhancedScatterChartDataPoint[] {
            return dataPoints.map((dataPoint: EnhancedScatterChartDataPoint) => {
                return _.clone(dataPoint);
            });
        }

        private darkenZeroLine(selection: Selection<any>): void {
            const zeroTick: Selection<any> = selection
                .selectAll(`g${EnhancedScatterChart.TickSelector.selector}`)
                .filter((data: any) => data === EnhancedScatterChart.EmptyDataValue);

            if (zeroTick.node()) {
                zeroTick
                    .select("line")
                    .classed(EnhancedScatterChart.ZeroLineSelector.class, true);
            }
        }

        private getCategoryAxisFill(): Fill {
            if (this.dataView && this.dataView.metadata.objects) {
                const label: DataViewObject = this.dataView.metadata.objects["categoryAxis"];

                if (label) {
                    return label["axisColor"];
                }
            }

            return { solid: { color: EnhancedScatterChart.DefaultCategoryAxisFillColor } };
        }

        private getEnhanchedScatterChartLabelLayout(labelSettings: PointDataLabelsSettings,
            viewport: IViewport,
            sizeRange: NumberRange): ILabelLayout {

            const xScale: any = this.xAxisProperties.scale,
                yScale: any = this.yAxisProperties.scale,
                fontSizeInPx: string = PixelConverter.fromPoint(labelSettings.fontSize),
                fontFamily: string = LabelTextProperties.fontFamily;

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

                        return labelSettings.position === PointLabelPosition.Above
                            ? yScale(dataPoint.y) - margin
                            : yScale(dataPoint.y) + margin;
                    },
                },
                filter: (dataPoint: EnhancedScatterChartDataPoint) => {
                    return dataPoint != null && dataPoint.formattedCategory() != null;
                },
                style: {
                    "fill": (dataPoint: EnhancedScatterChartDataPoint) => dataPoint.labelFill,
                    "font-size": fontSizeInPx,
                    "font-family": fontFamily,
                },
            };
        }

        private static getBubbleRadius(
            radiusData: EnhancedScatterChartRadiusData,
            sizeRange: NumberRange,
            viewport: IViewport): number {

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
                const sizeValue: number = measureSize.values[radiusData.index] as number;

                if (sizeValue != null) {
                    return EnhancedScatterChart.projectSizeToPixels(
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
            maxSizeRange: number): EnhancedScatterDataRange {

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

        public static projectSizeToPixels(
            size: number,
            actualSizeDataRange: EnhancedScatterDataRange,
            bubblePixelAreaSizeRange: EnhancedScatterDataRange): number {

            let projectedSize: number = EnhancedScatterChart.DefaultProjectedSize;

            if (actualSizeDataRange) {
                // Project value on the required range of bubble area sizes
                projectedSize = bubblePixelAreaSizeRange.maxRange;

                if (actualSizeDataRange.delta !== EnhancedScatterChart.MinDelta) {
                    const value: number = Math.min(
                        Math.max(size, actualSizeDataRange.minRange),
                        actualSizeDataRange.maxRange);

                    projectedSize = EnhancedScatterChart.project(
                        value,
                        actualSizeDataRange,
                        bubblePixelAreaSizeRange);
                }

                projectedSize = Math.sqrt(projectedSize / Math.PI)
                    * EnhancedScatterChart.ProjectedSizeFactor;
            }

            return Math.round(projectedSize);
        }

        public static project(
            value: number,
            actualSizeDataRange: EnhancedScatterDataRange,
            bubblePixelAreaSizeRange: EnhancedScatterDataRange): number {

            if (actualSizeDataRange.delta === EnhancedScatterChart.MinDelta
                || bubblePixelAreaSizeRange.delta === EnhancedScatterChart.MinDelta) {

                return (EnhancedScatterChart.rangeContains(actualSizeDataRange, value))
                    ? bubblePixelAreaSizeRange.minRange
                    : null;
            }

            const relativeX: number = (value - actualSizeDataRange.minRange) / actualSizeDataRange.delta;

            return bubblePixelAreaSizeRange.minRange
                + relativeX * bubblePixelAreaSizeRange.delta;
        }

        public static rangeContains(range: EnhancedScatterDataRange, value: number): boolean {
            return range.minRange <= value && value <= range.maxRange;
        }

        private getValueAxisFill(): Fill {
            if (this.dataView && this.dataView.metadata.objects) {
                const valueAxis: DataViewObject = this.dataView.metadata.objects["valueAxis"];

                if (valueAxis) {
                    return valueAxis["axisColor"];
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

            if (data && data.crosshair) {
                this.crosshairVerticalLineSelection = this.addCrosshairLineToDOM(
                    this.crosshairCanvasSelection,
                    EnhancedScatterChart.CrosshairVerticalLineSelector);

                this.crosshairHorizontalLineSelection = this.addCrosshairLineToDOM(
                    this.crosshairCanvasSelection,
                    EnhancedScatterChart.CrosshairHorizontalLineSelector);

                this.crosshairTextSelection = this.addCrosshairTextToDOM(this.crosshairCanvasSelection);

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
                selector: crosshairCanvasSelector.selector,
                className: crosshairCanvasSelector.class,
                styles: { display: "none" }
            });
        }

        /**
         * Public for testability.
         */
        public addCrosshairLineToDOM(
            rootElement: Selection<any>,
            elementSelector: ClassAndSelector): Selection<any> {

            const crosshairLineSelector: ClassAndSelector = EnhancedScatterChart.CrosshairLineSelector;

            return this.addElementToDOM(rootElement, {
                name: "line",
                selector: elementSelector.selector,
                className: `${crosshairLineSelector.class} ${elementSelector.class}`,
                attributes: {
                    x1: EnhancedScatterChart.DefaultPositionOfCrosshair,
                    y1: EnhancedScatterChart.DefaultPositionOfCrosshair,
                    x2: EnhancedScatterChart.DefaultPositionOfCrosshair,
                    y2: EnhancedScatterChart.DefaultPositionOfCrosshair
                }
            });
        }

        /**
         * Public for testability.
         */
        public addCrosshairTextToDOM(rootElement: Selection<any>): Selection<any> {
            const crosshairTextSelector: ClassAndSelector = EnhancedScatterChart.CrosshairTextSelector;

            return this.addElementToDOM(rootElement, {
                name: "text",
                selector: crosshairTextSelector.selector,
                className: crosshairTextSelector.class
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
                    let currentTarget: SVGElement = (d3.event as MouseEvent).currentTarget as SVGElement,
                        coordinates: number[] = d3.mouse(currentTarget),
                        svgNode: SVGElement = currentTarget.viewportElement,
                        scaledRect: ClientRect = svgNode.getBoundingClientRect(),
                        domRect: SVGRect = (svgNode as any).getBBox(),
                        ratioX: number = scaledRect.width / domRect.width,
                        ratioY: number = scaledRect.height / domRect.height,
                        x: number = coordinates[0],
                        y: number = coordinates[1];

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
                xScale = <LinearScale<number, number>>this.xAxisProperties.scale,
                yScale = <LinearScale<number, number>>this.yAxisProperties.scale,
                xFormated: number,
                yFormated: number;

            this.crosshairHorizontalLineSelection.attr({
                x1: EnhancedScatterChart.CrosshairStartPosition,
                y1: y,
                x2: this.viewportIn.width,
                y2: y
            });

            this.crosshairVerticalLineSelection.attr({
                x1: x,
                y1: EnhancedScatterChart.CrosshairStartPosition,
                x2: x,
                y2: this.viewportIn.height
            });

            xFormated = Math.round(xScale.invert(x) * EnhancedScatterChart.CrosshairScaleFactor)
                / EnhancedScatterChart.CrosshairScaleFactor;

            yFormated = Math.round(yScale.invert(y) * EnhancedScatterChart.CrosshairScaleFactor)
                / EnhancedScatterChart.CrosshairScaleFactor;

            this.crosshairTextSelection
                .attr({
                    x: x + crosshairTextMargin,
                    y: y - crosshairTextMargin
                })
                .text(`(${xFormated}, ${yFormated})`);
        }

        /**
         * Public for testability.
         */
        public addElementToDOM(
            rootElement: Selection<any>,
            properties: ElementProperties): Selection<any> {

            if (!rootElement || !properties) {
                return null;
            }

            let elementSelection: Selection<any>,
                elementUpdateSelection: UpdateSelection<any>;

            elementSelection = rootElement.selectAll(properties.selector);

            elementUpdateSelection = elementSelection.data(properties.data || [[]]);

            elementUpdateSelection
                .enter()
                .append(properties.name)
                .attr(properties.attributes)
                .style(properties.styles)
                .classed(properties.className, true);

            elementUpdateSelection
                .exit()
                .remove();

            return elementUpdateSelection;
        }

        private renderBackground(isImageValid: boolean): void {
            if (this.data.backdrop
                && this.data.backdrop.show
                && (this.data.backdrop.url !== undefined)
                && isImageValid) {

                this.backgroundGraphicsContext.attr({
                    "xlink:href": this.data.backdrop.url,
                    "x": EnhancedScatterChart.DefaultBackgroundPosition,
                    "y": EnhancedScatterChart.DefaultBackgroundPosition,
                    "width": this.viewportIn.width,
                    "height": this.viewportIn.height
                });
            } else {
                this.backgroundGraphicsContext.attr({
                    "width": EnhancedScatterChart.DefaultBackgroundPosition,
                    "height": EnhancedScatterChart.DefaultBackgroundPosition
                });
            }
        }

        private renderChart(
            xAxis: IAxisProperties,
            yAxis: IAxisProperties,
            tickLabelMargins: any,
            chartHasAxisLabels: boolean,
            axisLabels: ChartAxesLabels,
            isImageValid: boolean): void {

            let bottomMarginLimit: number = this.bottomMarginLimit,
                leftRightMarginLimit: number = this.leftRightMarginLimit,
                duration: number = EnhancedScatterChart.AnimationDuration;

            this.renderBackground(isImageValid);


            // hide show x-axis here
            if (this.shouldRenderAxis(xAxis)) {
                xAxis.axis.orient(EnhancedScatterChart.DefaultXAxisOrientation);

                if (!xAxis.willLabelsFit) {
                    xAxis.axis.tickPadding(EnhancedScatterChart.DefaultAxisXTickPadding);
                }

                if (duration) {
                    this.xAxisGraphicsContext
                        .transition()
                        .duration(duration)
                        .call(xAxis.axis)
                        .call(this.darkenZeroLine as any);
                }
                else {
                    this.xAxisGraphicsContext
                        .call(xAxis.axis)
                        .call(this.darkenZeroLine);
                }

                const xZeroTick: Selection<any> = this.xAxisGraphicsContext
                    .selectAll(`g${EnhancedScatterChart.TickSelector.selector}`)
                    .filter((data: any) => data === EnhancedScatterChart.EmptyDataValue);

                if (xZeroTick) {
                    const xZeroColor: Fill = this.getValueAxisFill();

                    if (xZeroColor) {
                        xZeroTick
                            .selectAll("line")
                            .style("stroke", xZeroColor.solid.color);
                    }
                }

                const xAxisTextNodes: Selection<any> = this.xAxisGraphicsContext.selectAll("text");

                if (xAxis.willLabelsWordBreak) {
                    xAxisTextNodes.call(
                        axis.LabelLayoutStrategy.wordBreak,
                        xAxis,
                        bottomMarginLimit);
                } else {
                    xAxisTextNodes.call(
                        axis.LabelLayoutStrategy.rotate,
                        bottomMarginLimit,
                        getTailoredTextOrDefault,
                        EnhancedScatterChart.TextProperties,
                        !xAxis.willLabelsFit,
                        bottomMarginLimit === tickLabelMargins.xMax,
                        xAxis,
                        this.margin,
                        this.isXScrollBarVisible || this.isYScrollBarVisible);
                }
            }
            else {
                this.xAxisGraphicsContext
                    .selectAll("*")
                    .remove();
            }

            if (this.shouldRenderAxis(yAxis)) {
                yAxis.axis
                    .tickSize(-this.viewportIn.width)
                    .tickPadding(EnhancedScatterChart.DefaultAxisYTickPadding)
                    .orient(this.yAxisOrientation.toLowerCase());

                if (duration) {
                    this.y1AxisGraphicsContext
                        .transition()
                        .duration(duration)
                        .call(yAxis.axis)
                        .call(this.darkenZeroLine as any);
                }
                else {
                    this.y1AxisGraphicsContext
                        .call(yAxis.axis)
                        .call(this.darkenZeroLine);
                }

                const yZeroTick: Selection<any> = this.y1AxisGraphicsContext
                    .selectAll(`g${EnhancedScatterChart.TickSelector.selector}`)
                    .filter((data: any) => data === EnhancedScatterChart.EmptyDataValue);

                if (yZeroTick) {
                    const yZeroColor: Fill = this.getCategoryAxisFill();

                    if (yZeroColor) {
                        yZeroTick
                            .selectAll("line")
                            .style("stroke", yZeroColor.solid.color);
                    }
                }

                if (tickLabelMargins.yLeft >= leftRightMarginLimit) {
                    this.y1AxisGraphicsContext
                        .selectAll("text")
                        .call(axis.LabelLayoutStrategy.clip,
                        // Can't use padding space to render text, so subtract that from available space for ellipses calculations
                        leftRightMarginLimit - EnhancedScatterChart.AxisSide,
                        svgEllipsis);
                }

                // TODO: clip (svgEllipsis) the Y2 labels
            }
            else {
                this.y1AxisGraphicsContext
                    .selectAll("*")
                    .remove();
            }

            // Axis labels
            // TODO: Add label for second Y axis for combo chart
            if (chartHasAxisLabels) {
                const hideXAxisTitle: boolean = !this.shouldRenderAxis(xAxis, "showAxisTitle"),
                    hideYAxisTitle: boolean = !this.shouldRenderAxis(yAxis, "showAxisTitle"),
                    hideY2AxisTitle: boolean = this.valueAxisProperties
                        && this.valueAxisProperties["secShowAxisTitle"] != null
                        && this.valueAxisProperties["secShowAxisTitle"] === false;

                this.renderAxesLabels(axisLabels, this.legendViewport.height, hideXAxisTitle, hideYAxisTitle, hideY2AxisTitle);
            }
            else {
                this.removeAxisLabels();
            }
        }

        private removeAxisLabels(): void {
            this.axisGraphicsContext
                .selectAll(EnhancedScatterChart.XAxisLabelSelector.selector)
                .remove();

            this.axisGraphicsContext
                .selectAll(EnhancedScatterChart.YAxisLabelSelector.selector)
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
            hideY2AxisTitle: boolean): void {

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
                    .text(axisLabels.x)
                    .call((text: Selection<any>) => {
                        text.each(function () {
                            const textSelection: Selection<any> = d3.select(this);

                            textSelection.attr({
                                "class": EnhancedScatterChart.XAxisLabelSelector.class,
                                "transform": svg.translate(
                                    width / EnhancedScatterChart.AxisLabelOffset,
                                    height - fontSize - EnhancedScatterChart.AxisLabelOffset)
                            });
                        });
                    });

                xAxisLabel.call(
                    axis.LabelLayoutStrategy.clip,
                    width,
                    svgEllipsis);
            }

            if (!hideYAxisTitle) {
                const yAxisLabel: Selection<any> = this.axisGraphicsContext
                    .append("text")
                    .style("text-anchor", EnhancedScatterChart.TextAnchor)
                    .text(axisLabels.y)
                    .call((text: Selection<any>) => {
                        text.each(function () {
                            const text: Selection<any> = d3.select(this);

                            text.attr({
                                "class": EnhancedScatterChart.YAxisLabelSelector.class,
                                "transform": EnhancedScatterChart.YAxisLabelTransformRotate,
                                "y": showY1OnRight
                                    ? width + margin.right - fontSize
                                    : -margin.left,
                                "x": -((height - margin.top - legendMargin) / EnhancedScatterChart.AxisLabelOffset),
                                "dy": EnhancedScatterChart.DefaultDY
                            });
                        });
                    });

                yAxisLabel.call(
                    axis.LabelLayoutStrategy.clip,
                    height - (margin.bottom + margin.top),
                    svgEllipsis);
            }

            if (!hideY2AxisTitle && axisLabels.y2) {
                const y2AxisLabel: Selection<any> = this.axisGraphicsContext
                    .append("text")
                    .style("text-anchor", EnhancedScatterChart.TextAnchor)
                    .text(axisLabels.y2)
                    .call((text: Selection<any>) => {
                        text.each(function () {
                            const text: Selection<any> = d3.select(this);

                            text.attr({
                                "class": EnhancedScatterChart.YAxisLabelSelector.class,
                                "transform": EnhancedScatterChart.YAxisLabelTransformRotate,
                                "y": showY1OnRight
                                    ? -margin.left
                                    : width + margin.right - fontSize,
                                "x": -((height - margin.top - legendMargin) / EnhancedScatterChart.AxisLabelOffset),
                                "dy": EnhancedScatterChart.DefaultDY
                            });
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
                svg.translate(
                    EnhancedScatterChart.DefaultAxisOffset,
                    this.viewportIn.height));

            this.y1AxisGraphicsContext.attr(
                "transform",
                svg.translate(
                    showY1OnRight
                        ? this.viewportIn.width
                        : EnhancedScatterChart.DefaultAxisOffset,
                    EnhancedScatterChart.DefaultAxisOffset));

            this.svg.attr({
                "width": this.viewport.width,
                "height": this.viewport.height
            });

            this.svgScrollable.attr({
                "width": this.viewport.width,
                "height": this.viewport.height
            });

            this.svgScrollable.attr({
                "x": EnhancedScatterChart.DefaultAxisOffset
            });

            const left: number = this.margin.left,
                top: number = this.margin.top;

            this.axisGraphicsContext.attr("transform", svg.translate(left, top));
            this.axisGraphicsContextScrollable.attr("transform", svg.translate(left, top));
            this.clearCatcher.attr("transform", svg.translate(-left, -top));

            if (this.isXScrollBarVisible) {
                this.svgScrollable.attr({
                    "x": left,
                    "width": this.viewportIn.width
                });

                this.axisGraphicsContextScrollable.attr("transform", svg.translate(0, top));

                this.svg.attr({
                    "width": this.viewport.width,
                    "height": this.viewport.height + this.ScrollBarWidth
                });
            }
            else if (this.isYScrollBarVisible) {
                this.svgScrollable.attr("height", this.viewportIn.height + top);

                this.svg.attr({
                    "width": this.viewport.width + this.ScrollBarWidth,
                    "height": this.viewport.height
                });
            }
        }

        private getUnitType(xAxis: IAxisProperties): string {
            if (xAxis.formatter
                && xAxis.formatter.displayUnit
                && xAxis.formatter.displayUnit.value > EnhancedScatterChart.DisplayUnitValue) {

                return xAxis.formatter.displayUnit.title;
            }

            return null;
        }

        private addUnitTypeToAxisLabel(xAxis: IAxisProperties, yAxis: IAxisProperties): void {
            let unitType: string = this.getUnitType(xAxis);

            if (xAxis.isCategoryAxis) {
                this.categoryAxisHasUnitType = unitType !== null;
            }
            else {
                this.valueAxisHasUnitType = unitType !== null;
            }

            if (xAxis.axisLabel && unitType) {
                if (xAxis.isCategoryAxis) {
                    xAxis.axisLabel = axis.createAxisLabel(
                        this.categoryAxisProperties,
                        xAxis.axisLabel,
                        unitType);
                }
                else {
                    xAxis.axisLabel = axis.createAxisLabel(
                        this.valueAxisProperties,
                        xAxis.axisLabel,
                        unitType);
                }
            }

            unitType = this.getUnitType(yAxis);

            if (!yAxis.isCategoryAxis) {
                this.valueAxisHasUnitType = unitType !== null;
            }
            else {
                this.categoryAxisHasUnitType = unitType !== null;
            }

            if (yAxis.axisLabel && unitType) {
                if (!yAxis.isCategoryAxis) {
                    yAxis.axisLabel = axis.createAxisLabel(
                        this.valueAxisProperties,
                        yAxis.axisLabel,
                        unitType);
                }
                else {
                    yAxis.axisLabel = axis.createAxisLabel(
                        this.categoryAxisProperties,
                        yAxis.axisLabel,
                        unitType);
                }
            }
        }

        private drawScatterMarkers(
            scatterData: EnhancedScatterChartDataPoint[],
            hasSelection: boolean,
            sizeRange: NumberRange,
            duration: number): UpdateSelection<EnhancedScatterChartDataPoint> {

            const xScale: any = this.xAxisProperties.scale,
                yScale: any = this.yAxisProperties.scale,
                viewport = this.viewport,
                shouldEnableFill: boolean = (!sizeRange || !sizeRange.min) && this.data.fillPoint;

            let markers: UpdateSelection<EnhancedScatterChartDataPoint>,
                useCustomColor: boolean = this.data.useCustomColor;

            if (!this.data.useShape) {
                this.mainGraphicsContext
                    .selectAll(EnhancedScatterChart.ImageSelector.selector)
                    .remove();

                markers = this.mainGraphicsContext
                    .classed(EnhancedScatterChart.ScatterMarkersSelector.class, true)
                    .selectAll(EnhancedScatterChart.DotSelector.selector)
                    .data(scatterData, (dataPoint: EnhancedScatterChartDataPoint) => {
                        return (dataPoint.identity as ISelectionId).getKey();
                    });

                markers
                    .enter()
                    .append("path")
                    .classed(EnhancedScatterChart.DotSelector.class, true)
                    .attr("id", EnhancedScatterChart.MarkerShapeSelector.class);

                markers
                    .style({
                        "stroke-opacity": (dataPoint: EnhancedScatterChartDataPoint) => {
                            return EnhancedScatterChart.getBubbleOpacity(dataPoint, hasSelection);
                        },
                        "stroke-width": PixelConverter.toString(EnhancedScatterChart.StrokeWidth),
                        "stroke": (dataPoint: EnhancedScatterChartDataPoint) => {
                            const color: string = useCustomColor
                                ? dataPoint.colorFill
                                : dataPoint.fill;

                            if (this.data.outline) {
                                return d3.rgb(color).darker().toString();
                            }

                            return d3.rgb(color).toString();
                        },
                        "fill": (dataPoint: EnhancedScatterChartDataPoint) => {
                            return d3.rgb(useCustomColor
                                ? dataPoint.colorFill
                                : dataPoint.fill).toString();
                        },
                        "fill-opacity": (dataPoint: EnhancedScatterChartDataPoint) => {
                            return (dataPoint.size != null || shouldEnableFill)
                                ? EnhancedScatterChart.getBubbleOpacity(dataPoint, hasSelection)
                                : EnhancedScatterChart.MinBubbleOpacity;
                        }
                    })
                    .attr("d", (dataPoint: EnhancedScatterChartDataPoint) => {
                        const r: number = EnhancedScatterChart.getBubbleRadius(dataPoint.radius, sizeRange, viewport),
                            area: number = EnhancedScatterChart.RadiusMultiplexer * r * r;

                        return dataPoint.shapeSymbolType(area);
                    })
                    .transition()
                    .duration((dataPoint: EnhancedScatterChartDataPoint) => {
                        if (this.keyArray.indexOf((dataPoint.identity as ISelectionId).getKey()) >= 0) {
                            return duration;
                        } else {
                            return EnhancedScatterChart.MinAnimationDuration;
                        }
                    })
                    .attr("transform", (dataPoint: EnhancedScatterChartDataPoint) => {
                        const x: number = EnhancedScatterChart.getDefinedNumberValue(xScale(dataPoint.x)),
                            y: number = EnhancedScatterChart.getDefinedNumberValue(yScale(dataPoint.y)),
                            rotation: number = dataPoint.rotation;

                        return `translate(${x},${y}) rotate(${rotation})`;
                    });
            } else {
                this.mainGraphicsContext
                    .selectAll(EnhancedScatterChart.DotSelector.selector)
                    .remove();

                markers = this.mainGraphicsContext
                    .classed(EnhancedScatterChart.ScatterMarkersSelector.class, true)
                    .selectAll(EnhancedScatterChart.ImageSelector.selector)
                    .data(scatterData, (dataPoint: EnhancedScatterChartDataPoint) => {
                        return (dataPoint.identity as ISelectionId).getKey();
                    });

                markers
                    .enter()
                    .append("svg:image")
                    .classed(EnhancedScatterChart.ImageSelector.class, true)
                    .attr("id", EnhancedScatterChart.MarkerImageSelector.class);

                markers
                    .attr({
                        "xlink:href": (dataPoint: EnhancedScatterChartDataPoint) => {
                            if (dataPoint.svgurl !== undefined
                                && dataPoint.svgurl != null
                                && dataPoint.svgurl !== "") {

                                return dataPoint.svgurl;
                            }

                            return this.svgDefaultImage;
                        }
                    })
                    .each(function (dataPoint: EnhancedScatterChartDataPoint): void {
                        const bubbleRadius: number = EnhancedScatterChart.getBubbleRadius(
                            dataPoint.radius,
                            sizeRange,
                            viewport) * EnhancedScatterChart.BubbleRadiusDivider;

                        d3.select(this).attr({
                            "width": bubbleRadius,
                            "height": bubbleRadius
                        });
                    })
                    .transition()
                    .duration((dataPoint: EnhancedScatterChartDataPoint) => {
                        if (this.keyArray.indexOf((dataPoint.identity as ISelectionId).getKey()) >= 0) {
                            return duration;
                        }

                        return EnhancedScatterChart.MinAnimationDuration;
                    })
                    .attr("transform", (dataPoint: EnhancedScatterChartDataPoint) => {
                        const radius: number = EnhancedScatterChart.getBubbleRadius(
                            dataPoint.radius,
                            sizeRange,
                            viewport);

                        const x: number = EnhancedScatterChart.getDefinedNumberValue(xScale(dataPoint.x) - radius),
                            y: number = EnhancedScatterChart.getDefinedNumberValue(yScale(dataPoint.y) - radius);

                        return `translate(${x},${y}) rotate(${dataPoint.rotation},${radius},${radius})`;
                    });
            }

            markers
                .exit()
                .remove();

            this.keyArray = scatterData.map((dataPoint: EnhancedScatterChartDataPoint) => {
                return (dataPoint.identity as ISelectionId).getKey();
            });

            return markers;
        }

        public static getBubbleOpacity(d: EnhancedScatterChartDataPoint, hasSelection: boolean): number {
            if (hasSelection && !d.selected) {
                return EnhancedScatterChart.DimmedBubbleOpacity;
            }

            return EnhancedScatterChart.DefaultBubbleOpacity;
        }

        public calculateAxes(
            categoryAxisProperties: DataViewObject,
            valueAxisProperties: DataViewObject,
            textProperties: TextProperties,
            scrollbarVisible: boolean = true): IAxisProperties[] {

            let visualOptions: CalculateScaleAndDomainOptions = {
                viewport: this.viewport,
                margin: this.margin,
                forcedXDomain: [
                    categoryAxisProperties
                        ? categoryAxisProperties["start"]
                        : null,
                    categoryAxisProperties
                        ? categoryAxisProperties["end"]
                        : null
                ],
                forceMerge: valueAxisProperties && valueAxisProperties["secShow"] === false,
                showCategoryAxisLabel: false,
                showValueAxisLabel: true,
                categoryAxisScaleType: categoryAxisProperties && categoryAxisProperties["axisScale"] != null
                    ? <string>categoryAxisProperties["axisScale"]
                    : null,
                valueAxisScaleType: valueAxisProperties && valueAxisProperties["axisScale"] != null
                    ? <string>valueAxisProperties["axisScale"]
                    : null,
                valueAxisDisplayUnits: valueAxisProperties && valueAxisProperties["labelDisplayUnits"] != null
                    ? <number>valueAxisProperties["labelDisplayUnits"]
                    : EnhancedScatterChart.LabelDisplayUnitsDefault,
                categoryAxisDisplayUnits: categoryAxisProperties && categoryAxisProperties["labelDisplayUnits"] != null
                    ? <number>categoryAxisProperties["labelDisplayUnits"]
                    : EnhancedScatterChart.LabelDisplayUnitsDefault,
                trimOrdinalDataOnOverflow: false
            };

            if (valueAxisProperties) {
                visualOptions.forcedYDomain = axis.applyCustomizedDomain(
                    [
                        valueAxisProperties["start"],
                        valueAxisProperties["end"]
                    ],
                    visualOptions.forcedYDomain);
            }

            visualOptions.showCategoryAxisLabel = !!categoryAxisProperties
                && !!categoryAxisProperties["showAxisTitle"];

            const width: number = this.viewport.width - (this.margin.left + this.margin.right),
                axes: axis.IAxisProperties[] = this.calculateAxesProperties(visualOptions);

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
                    textProperties);

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

            let xDomain: number[] = [minX, maxX],
                combinedXDomain: number[],
                combinedYDomain: number[],
                xAxisFormatString: string,
                yAxisFormatString: string;

            combinedXDomain = axis.combineDomain(
                this.optimizeTranslateValues(options.forcedXDomain),
                xDomain);

            xAxisFormatString = valueFormatter.getFormatStringByColumn(data.xCol);

            this.xAxisProperties = axis.createAxis({
                pixelSpan: this.viewportIn.width,
                dataDomain: combinedXDomain,
                metaDataColumn: data.xCol,
                formatString: xAxisFormatString,
                outerPadding: EnhancedScatterChart.OuterPadding,
                isScalar: true,
                isVertical: false,
                forcedTickCount: options.forcedTickCount,
                useTickIntervalForDisplayUnits: true,
                isCategoryAxis: true, // scatter doesn"t have a categorical axis, but this is needed for the pane to react correctly to the x-axis toggle one/off
                scaleType: options.categoryAxisScaleType,
                axisDisplayUnits: options.categoryAxisDisplayUnits
            });

            this.xAxisProperties.axis.tickSize(
                -this.viewportIn.height,
                EnhancedScatterChart.OuterPadding);

            this.xAxisProperties.axisLabel = this.data.axesLabels.x;

            combinedYDomain = axis.combineDomain(
                this.optimizeTranslateValues(options.forcedYDomain), [minY, maxY]);

            yAxisFormatString = valueFormatter.getFormatStringByColumn(data.yCol);

            this.yAxisProperties = axis.createAxis({
                pixelSpan: this.viewportIn.height,
                dataDomain: combinedYDomain,
                metaDataColumn: data.yCol,
                formatString: yAxisFormatString,
                outerPadding: EnhancedScatterChart.OuterPadding,
                isScalar: true,
                isVertical: true,
                forcedTickCount: options.forcedTickCount,
                useTickIntervalForDisplayUnits: true,
                isCategoryAxis: false,
                scaleType: options.valueAxisScaleType,
                axisDisplayUnits: options.valueAxisDisplayUnits
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

        private enumerateDataPoints(instances: VisualObjectInstance[]): void {
            if (!this.data) {
                return;
            }

            const seriesCount: number = this.data.dataPoints.length;

            if (!this.data.hasDynamicSeries) {
                const showAllDataPoints: boolean = this.data.showAllDataPoints;

                // Add default color and show all slices
                instances.push({
                    objectName: "dataPoint",
                    selector: null,
                    properties: {
                        defaultColor: {
                            solid: {
                                color: this.data.defaultDataPointColor || this.colorPalette.getColor("0").value
                            }
                        }
                    }
                });

                instances.push({
                    objectName: "dataPoint",
                    selector: null,
                    properties: { showAllDataPoints }
                });

                if (showAllDataPoints) {
                    for (let i: number = 0; i < seriesCount; i++) {
                        const seriesDataPoints = this.data.dataPoints[i];

                        instances.push({
                            objectName: "dataPoint",
                            displayName: seriesDataPoints.formattedCategory(),
                            selector: ColorHelper.normalizeSelector(
                                (seriesDataPoints.identity as ISelectionId).getSelector(),
                                true),
                            properties: {
                                fill: { solid: { color: seriesDataPoints.fill } }
                            },
                        });
                    }
                }
            }
            else {
                const legendDataPointLength: number = this.data.legendData.dataPoints.length;

                for (let i: number = 0; i < legendDataPointLength; i++) {
                    const series: legendModule.LegendDataPoint = this.data.legendData.dataPoints[i];

                    instances.push({
                        objectName: "dataPoint",
                        displayName: series.label,
                        selector: ColorHelper.normalizeSelector((series.identity as ISelectionId).getSelector()),
                        properties: {
                            fill: { solid: { color: series.color } }
                        },
                    });
                }
            }
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            const instances: VisualObjectInstance[] = [];

            switch (options.objectName) {
                case "dataPoint": {
                    const categoricalDataView: DataViewCategorical = this.dataView && this.dataView.categorical
                        ? this.dataView.categorical
                        : null;

                    if (!gradientUtils.hasGradientRole(categoricalDataView)) {
                        this.enumerateDataPoints(instances);
                    }

                    break;
                }
                case "categoryAxis": {
                    this.getCategoryAxisValues(instances);

                    break;
                }
                case "valueAxis": {
                    this.getValueAxisValues(instances);

                    break;
                }
                case "categoryLabels": {
                    let instanceEnumerationObject: VisualObjectInstanceEnumerationObject = {
                        instances
                    };

                    if (this.data) {
                        dataLabelUtils.enumerateCategoryLabels(
                            instanceEnumerationObject,
                            this.data.dataLabelsSettings,
                            true);
                    } else {
                        dataLabelUtils.enumerateCategoryLabels(
                            instanceEnumerationObject,
                            null,
                            true);
                    }

                    break;
                }
                case "fillPoint": {
                    const sizeRange: ValueRange<number> = this.data.sizeRange;

                    // Check if the card should be shown or not
                    if (sizeRange && sizeRange.min) {
                        break;
                    }

                    instances.push({
                        objectName: "fillPoint",
                        selector: null,
                        properties: {
                            show: this.data.fillPoint,
                        },
                    });

                    break;
                }
                case "backdrop": {
                    instances.push({
                        objectName: "backdrop",
                        displayName: "Backdrop",
                        selector: null,
                        properties: {
                            show: this.data.backdrop
                                ? this.data.backdrop.show
                                : false,
                            url: this.data.backdrop
                                ? this.data.backdrop.url
                                : null
                        },
                    });

                    break;
                }
                case "crosshair": {
                    instances.push({
                        objectName: "crosshair",
                        selector: null,
                        properties: {
                            show: this.data.crosshair
                        },
                    });

                    break;
                }
                case "outline": {
                    instances.push({
                        objectName: "outline",
                        selector: null,
                        properties: {
                            show: this.data.outline
                        },
                    });

                    break;
                }
                case "legend": {
                    this.enumerateLegend(instances);

                    break;
                }
            }

            return instances;
        }

        public hasLegend(): boolean {
            return this.data && this.data.hasDynamicSeries;
        }

        private enumerateLegend(instances: VisualObjectInstance[]): void {
            if (!this.hasLegend()) {
                return;
            }

            const show: boolean = DataViewObject.getValue<boolean>(
                this.legendObjectProperties,
                legendProps.show,
                this.legend.isVisible());

            const showTitle: boolean = DataViewObject.getValue<boolean>(
                this.legendObjectProperties,
                legendProps.showTitle,
                true);

            const titleText: string = DataViewObject.getValue<string>(
                this.legendObjectProperties,
                legendProps.titleText,
                this.layerLegendData ? this.layerLegendData.title : "");

            const legendLabelColor: string = DataViewObject.getValue<string>(
                this.legendObjectProperties,
                legendProps.labelColor,
                legendDataModule.DefaultLegendLabelFillColor);

            this.legendLabelFontSize = DataViewObject.getValue<number>(
                this.legendObjectProperties,
                legendProps.fontSize,
                EnhancedScatterChart.LegendLabelFontSizeDefault);

            const position: string = DataViewObject.getValue<string>(
                this.legendObjectProperties,
                legendProps.position,
                LegendPosition[LegendPosition.Top]);

            instances.push({
                selector: null,
                properties: {
                    show: show,
                    position: position,
                    showTitle: showTitle,
                    titleText: titleText,
                    labelColor: legendLabelColor,
                    fontSize: this.legendLabelFontSize,
                },
                objectName: "legend"
            });
        }

        private getCategoryAxisValues(instances: VisualObjectInstance[]): void {
            const isScalar: boolean = true,
                logPossible: boolean = false,
                scaleOptions: string[] = [
                    axisScale.log,
                    axisScale.linear
                ]; // until options can be update in propPane, show all options

            if (!isScalar) {
                if (this.categoryAxisProperties) {
                    this.categoryAxisProperties["start"] = null;
                    this.categoryAxisProperties["end"] = null;
                }
            }

            const instance: VisualObjectInstance = {
                selector: null,
                properties: {},
                objectName: "categoryAxis",
                validValues: {
                    axisScale: scaleOptions
                }
            };

            instance.properties["show"] = this.categoryAxisProperties && this.categoryAxisProperties["show"] != null
                ? this.categoryAxisProperties["show"]
                : true;

            if (this.yAxisIsCategorical) { // in case of e.g. barChart
                instance.properties["position"] = this.valueAxisProperties && this.valueAxisProperties["position"] != null
                    ? this.valueAxisProperties["position"]
                    : yAxisPosition.left;
            }

            instance.properties["axisType"] = isScalar
                ? axisType.scalar
                : axisType.categorical;

            if (isScalar) {
                instance.properties["axisScale"] = (this.categoryAxisProperties
                    && this.categoryAxisProperties["axisScale"] != null
                    && logPossible)
                    ? this.categoryAxisProperties["axisScale"]
                    : axisScale.linear;

                instance.properties["start"] = this.categoryAxisProperties
                    ? this.categoryAxisProperties["start"]
                    : null;

                instance.properties["end"] = this.categoryAxisProperties
                    ? this.categoryAxisProperties["end"]
                    : null;

                instance.properties["labelDisplayUnits"] = this.categoryAxisProperties
                    && this.categoryAxisProperties["labelDisplayUnits"] != null
                    ? this.categoryAxisProperties["labelDisplayUnits"]
                    : EnhancedScatterChart.LabelDisplayUnitsDefault;
            }
            instance.properties["showAxisTitle"] = this.categoryAxisProperties
                && this.categoryAxisProperties["showAxisTitle"] != null
                ? this.categoryAxisProperties["showAxisTitle"]
                : true;

            instances.push(instance);

            instances.push({
                selector: null,
                properties: {
                    axisStyle: this.categoryAxisProperties && this.categoryAxisProperties["axisStyle"]
                        ? this.categoryAxisProperties["axisStyle"]
                        : axisStyle.showTitleOnly,
                    labelColor: this.categoryAxisProperties
                        ? this.categoryAxisProperties["labelColor"]
                        : null
                },
                objectName: "categoryAxis",
                validValues: {
                    axisStyle: this.categoryAxisHasUnitType
                        ? [axisStyle.showTitleOnly, axisStyle.showUnitOnly, axisStyle.showBoth]
                        : [axisStyle.showTitleOnly]
                }
            });
        }

        // TODO: wrap all these object getters and other related stuff into an interface
        private getValueAxisValues(instances: VisualObjectInstance[]): void {
            let scaleOptions: string[] = [axisScale.log, axisScale.linear],
                logPossible: boolean = false;

            const instance: VisualObjectInstance = {
                selector: null,
                properties: {},
                objectName: "valueAxis",
                validValues: {
                    axisScale: scaleOptions,
                    secAxisScale: scaleOptions
                }
            };

            instance.properties["show"] = this.valueAxisProperties && this.valueAxisProperties["show"] != null
                ? this.valueAxisProperties["show"]
                : true;

            if (!this.yAxisIsCategorical) {
                instance.properties["position"] = this.valueAxisProperties && this.valueAxisProperties["position"] != null
                    ? this.valueAxisProperties["position"]
                    : yAxisPosition.left;
            }
            instance.properties["axisScale"] = (this.valueAxisProperties
                && this.valueAxisProperties["axisScale"] != null
                && logPossible)
                ? this.valueAxisProperties["axisScale"]
                : axisScale.linear;

            instance.properties["start"] = this.valueAxisProperties
                ? this.valueAxisProperties["start"]
                : null;

            instance.properties["end"] = this.valueAxisProperties
                ? this.valueAxisProperties["end"]
                : null;

            instance.properties["showAxisTitle"] = this.valueAxisProperties
                && this.valueAxisProperties["showAxisTitle"] != null
                ? this.valueAxisProperties["showAxisTitle"]
                : true;

            instance.properties["labelDisplayUnits"] = this.valueAxisProperties
                && this.valueAxisProperties["labelDisplayUnits"] != null
                ? this.valueAxisProperties["labelDisplayUnits"]
                : EnhancedScatterChart.LabelDisplayUnitsDefault;

            instances.push(instance);

            instances
                .push({
                    selector: null,
                    properties: {
                        axisStyle: this.valueAxisProperties && this.valueAxisProperties["axisStyle"] != null
                            ? this.valueAxisProperties["axisStyle"]
                            : axisStyle.showTitleOnly,
                        labelColor: this.valueAxisProperties
                            ? this.valueAxisProperties["labelColor"]
                            : null
                    },
                    objectName: "valueAxis",
                    validValues: {
                        axisStyle: this.valueAxisHasUnitType
                            ? [axisStyle.showTitleOnly, axisStyle.showUnitOnly, axisStyle.showBoth]
                            : [axisStyle.showTitleOnly]
                    },
                });
        }

        public onClearSelection(): void {
            if (this.interactivityService) {
                this.interactivityService.clearSelection();
            }
        }
    }
}
