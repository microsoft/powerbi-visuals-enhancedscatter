import powerbiVisualsApi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import { legendInterfaces } from "powerbi-visuals-utils-chartutils";
import { ColorHelper } from "powerbi-visuals-utils-colorutils";
import { LegendDataPoint } from "powerbi-visuals-utils-chartutils/lib/legend/legendInterfaces";

import ISelectionId = powerbiVisualsApi.visuals.ISelectionId;
import LegendPosition = legendInterfaces.LegendPosition;

import Card = formattingSettings.Card;
import Model = formattingSettings.Model;

import IEnumMember = powerbi.IEnumMember;
import { EnhancedScatterChartDataPoint } from "./dataInterfaces";

export enum DisplayUnitsType {
    Auto = 0,
    None = 1,
    Thousands = 1000,
    Millions = 1000000,
    Billions = 1000000000,
    Triilions = 1000000000000
}

const displayUnitsOptions : IEnumMember[] = [
    {value: DisplayUnitsType.Auto, displayName : DisplayUnitsType[DisplayUnitsType.Auto]},
    {value: DisplayUnitsType.None, displayName : DisplayUnitsType[DisplayUnitsType.None]},
    {value: DisplayUnitsType.Thousands, displayName : DisplayUnitsType[DisplayUnitsType.Thousands]},
    {value: DisplayUnitsType.Millions, displayName : DisplayUnitsType[DisplayUnitsType.Millions]},
    {value: DisplayUnitsType.Billions, displayName : DisplayUnitsType[DisplayUnitsType.Billions]},
    {value: DisplayUnitsType.Triilions, displayName : DisplayUnitsType[DisplayUnitsType.Triilions]}
]

const positionOptions : IEnumMember[] = [
    {value : LegendPosition[LegendPosition.Top], displayName : LegendPosition[LegendPosition.Top]},
    {value : LegendPosition[LegendPosition.Bottom], displayName : LegendPosition[LegendPosition.Bottom]},
    {value : LegendPosition[LegendPosition.Left], displayName : LegendPosition[LegendPosition.Left]},
    {value : LegendPosition[LegendPosition.Right], displayName : LegendPosition[LegendPosition.Right]},
    {value : LegendPosition[LegendPosition.TopCenter], displayName : LegendPosition[LegendPosition.TopCenter]},
    {value : LegendPosition[LegendPosition.BottomCenter], displayName : LegendPosition[LegendPosition.BottomCenter]},
    {value : LegendPosition[LegendPosition.LeftCenter], displayName : LegendPosition[LegendPosition.LeftCenter]},
    {value : LegendPosition[LegendPosition.RightCenter], displayName : LegendPosition[LegendPosition.RightCenter]},
];

class FontSizeSettings {
    public static readonly DefaultFontSize: number = 9;
    public static readonly MinFontSize: number = 8;
    public static readonly MaxFontSize: number = 60;
}

export class EnableDataPointCardSettings extends Card {

    public strokeWidth: number = 1;

    defaultColor = new formattingSettings.ColorPicker({
        name: "defaultColor",
        displayNameKey: "Visual_DefaultColor",
        value: { value: "#01B8AA" }
    });

    showAllDataPoints = new formattingSettings.ToggleSwitch({
        name: "showAllDataPoints",
        displayNameKey: "Visual_DataPoint_Show_All",
        value: false,
        topLevelToggle: false
    });

    fill = new formattingSettings.ColorPicker({
        name: "fill",
        displayNameKey: "Visual_Fill",
        value: { value: "#888888" }
    });

    fillRule = new formattingSettings.GradientBar({
        name: "fillRule",
        displayNameKey: "Visual_ColorSaturation",
        selector: "Category",
        value: { }
    });

    name: string = "dataPoint";
    displayNameKey: string = "Visual_DataPoint";
    slices = [this.defaultColor, this.showAllDataPoints];
}

export class ScatterChartAxisCardSettings extends Card {

    public lineColor: string = "#777777";
    public zeroLineColor: string = "#333";
    public zeroLineStrokeWidth: number = 2;

    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayNameKey: "Visual_Show",
        value: true,
        topLevelToggle: true
    });

    start = new formattingSettings.NumUpDown({
        name: "start",
        displayNameKey: "Visual_Axis_Start",
        value: undefined
    });

    end = new formattingSettings.NumUpDown({
        name: "end",
        displayNameKey: "Visual_Axis_End",
        value: undefined
    });

    labelDisplayUnits = new formattingSettings.ItemDropdown({
        name: "labelDisplayUnits",
        displayNameKey: "Visual_DisplayUnits",
        items: displayUnitsOptions,
        value: displayUnitsOptions[0]
    });

    axisColor = new formattingSettings.ColorPicker({
        name: "axisColor",
        displayNameKey: "Visual_Axis_LabelColor",
        value: { value: "#777777" }
    });

    showAxisTitle = new formattingSettings.ToggleSwitch({
        name: "showAxisTitle",
        displayNameKey: "Visual_Axis_Title",
        value: true,
        topLevelToggle: false
    });
}

export class EnableCategoryAxisCardSettings extends ScatterChartAxisCardSettings {
    name: string = "categoryAxis";
    displayNameKey: string = "Visual_XAxis";
    slices = [this.show, this.start, this.end, this.labelDisplayUnits, this.axisColor, this.showAxisTitle];
}

export class EnableValueAxisCardSettings extends ScatterChartAxisCardSettings {
    name: string = "valueAxis";
    displayNameKey: string = "Visual_YAxis";
    slices = [this.show, this.start, this.end, this.labelDisplayUnits, this.axisColor, this.showAxisTitle];
}

export class EnableLegendCardSettings extends Card {
    public static DefaultTitleText: string = "";
    public static DefaultFontSizeInPoints: number = 9;

    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayNameKey: "Visual_Show",
        value: true,
        topLevelToggle: true
    });

    positionDropDown = new formattingSettings.ItemDropdown({
        name: "positionDropDown",
        displayNameKey: "Visual_LegendPosition",
        description: "Select the location for the legend",
        descriptionKey: "Visual_Description_LegendPosition",
        items: positionOptions,
        value: positionOptions[0]
    });

    showTitle = new formattingSettings.ToggleSwitch({
        name: "showTitle",
        displayNameKey: "Visual_LegendShowTitle",
        description: "Display a title for legend symbols",
        descriptionKey: "Visual_Description_LegendShowTitle",
        value: true,
        topLevelToggle: false
    });

    titleText = new formattingSettings.TextInput({
        name: "titleText",
        displayNameKey: "Visual_LegendName",
        description: "Title text",
        descriptionKey: "Visual_Description_LegendName",
        placeholder: "",
        value: ""
    });

    labelColor = new formattingSettings.ColorPicker({
        name: "labelColor",
        displayNameKey: "Visual_LegendTitleColor",
        value: { value: "#666666" }
    });

    fontSize = new formattingSettings.NumUpDown({
        name: "fontSize",
        displayNameKey: "Visual_TextSize",
        value: FontSizeSettings.DefaultFontSize,
        options: {
            minValue: {
                type: powerbiVisualsApi.visuals.ValidatorType.Min,
                value: FontSizeSettings.MinFontSize,
            },
            maxValue: {
                type: powerbiVisualsApi.visuals.ValidatorType.Max,
                value: FontSizeSettings.MaxFontSize,
            }
        }
    });

    name: string = "legend";
    displayNameKey: string = "Visual_Legend";
    slices = [this.show, this.showTitle, this.titleText, this.labelColor, this.fontSize, this.positionDropDown];
}

export class EnableCategoryLabelsCardSettings extends Card {

    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayNameKey: "Visual_Show",
        value: false,
        topLevelToggle: true
    });

    color = new formattingSettings.ColorPicker({
        name: "color",
        displayNameKey: "Visual_LabelsFill",
        value: { value: "#777777" }
    });

    fontSize = new formattingSettings.NumUpDown({
        name: "fontSize",
        displayNameKey: "Visual_TextSize",
        value: FontSizeSettings.DefaultFontSize,
        options: {
            minValue: {
                type: powerbiVisualsApi.visuals.ValidatorType.Min,
                value: FontSizeSettings.MinFontSize,
            },
            maxValue: {
                type: powerbiVisualsApi.visuals.ValidatorType.Max,
                value: FontSizeSettings.MaxFontSize,
            }
        }
    });

    name: string = "categoryLabels";
    displayNameKey: string = "Visual_CategoryLabels";
    slices = [this.show, this.color, this.fontSize];
}

export class EnableFillPointCardSettings extends Card {

    public isHidden: boolean = true

    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayNameKey: "Visual_Fill",
        value: true,
        topLevelToggle: true
    });

    name: string = "fillPoint";
    displayNameKey: string = "Visual_FillPoint";
    slices = [this.show];
}

export class EnableBackdropCardSettings extends Card {

    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayNameKey: "Visual_Show",
        value: false,
        topLevelToggle: true
    });

    url = new formattingSettings.TextInput({
        name: "url",
        displayNameKey: "Visual_Backdrop_ImageURL",
        value: "",
        placeholder: ""
    });

    name: string = "backdrop";
    displayNameKey: string = "Visual_Backdrop";
    slices = [this.show, this.url];
}

export class EnableCrosshairCardSettings extends Card {

    public color: string = "#808080";

    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayNameKey: "Visual_Crosshair",
        value: false,
        topLevelToggle: true
    });

    name: string = "crosshair";
    displayNameKey: string = "Visual_Crosshair";
    slices = [this.show];
}

export class EnableOutlineCardSettings extends Card {

    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayNameKey: "Visual_Outline",
        value: false,
        topLevelToggle: true
    });

    name: string = "outline";
    displayNameKey: string = "Visual_Outline";
    slices = [this.show];
}

export class EnhancedScatterChartSettingsModel extends Model {
    enableDataPointCardSettings = new EnableDataPointCardSettings();
    enableCategoryAxisCardSettings = new EnableCategoryAxisCardSettings();
    enableValueAxisCardSettings = new EnableValueAxisCardSettings();
    enableLegendCardSettings = new EnableLegendCardSettings();
    enableCategoryLabelsCardSettings = new EnableCategoryLabelsCardSettings();
    enableFillPointCardSettings = new EnableFillPointCardSettings();
    enableBackdropCardSettings = new EnableBackdropCardSettings();
    enableCrosshairCardSettings = new EnableCrosshairCardSettings();
    enableOutlineCardSettings = new EnableOutlineCardSettings();

    cards = [this.enableDataPointCardSettings, this.enableCategoryAxisCardSettings, this.enableValueAxisCardSettings,
        this.enableLegendCardSettings, this.enableCategoryLabelsCardSettings, this.enableFillPointCardSettings,
        this.enableBackdropCardSettings, this.enableCrosshairCardSettings, this.enableOutlineCardSettings];

    /**
     * populate colorSelector object categories formatting properties
     * @param dataPoints
     */
    populateColorSelector(dataPointsLegends: LegendDataPoint[], seriesDataPoints: EnhancedScatterChartDataPoint[]) {
        let slices = this.enableDataPointCardSettings.slices;
        if (dataPointsLegends && dataPointsLegends.length > 0) {
            slices = [];
            dataPointsLegends.forEach(dataPointsLegend => {
                slices.push(new formattingSettings.ColorPicker({
                    name: "fill",
                    displayName: dataPointsLegend.label,
                    value: { value: dataPointsLegend.color },
                    selector: ColorHelper.normalizeSelector((<ISelectionId>dataPointsLegend.identity).getSelector())
                }));
            });
        }

        else {
            if(this.enableDataPointCardSettings.showAllDataPoints.value)
            {
                slices = [this.enableDataPointCardSettings.defaultColor, this.enableDataPointCardSettings.showAllDataPoints];
                seriesDataPoints.forEach(dataPoint => {
                    slices.push(new formattingSettings.ColorPicker({
                        name: "fill",
                        displayName: dataPoint.formattedCategory(),
                        value: { value: dataPoint.stroke },
                        selector: ColorHelper.normalizeSelector((<ISelectionId>dataPoint.identity).getSelector(), true)
                    }));
                });
            }
        }
        this.enableDataPointCardSettings.slices = slices;
    }
}