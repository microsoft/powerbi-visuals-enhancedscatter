import powerbi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import { legendInterfaces } from "powerbi-visuals-utils-chartutils";
import { ColorHelper } from "powerbi-visuals-utils-colorutils";
import { LegendDataPoint } from "powerbi-visuals-utils-chartutils/lib/legend/legendInterfaces";

import ISelectionId = powerbi.visuals.ISelectionId;
import LegendPosition = legendInterfaces.LegendPosition;

import ILocalizationManager = powerbi.extensibility.ILocalizationManager;

import Card = formattingSettings.Card;
import Model = formattingSettings.Model;

import IEnumMember = powerbi.IEnumMember;
import { EnhancedScatterChartDataPoint } from "./dataInterfaces";

const positionOptions : IEnumMember[] = [
    {value : LegendPosition[LegendPosition.Top], displayName : "Visual_LegendPosition_Top"},
    {value : LegendPosition[LegendPosition.Bottom], displayName : "Visual_LegendPosition_Bottom"},
    {value : LegendPosition[LegendPosition.Left], displayName : "Visual_LegendPosition_Left"},
    {value : LegendPosition[LegendPosition.Right], displayName : "Visual_LegendPosition_Right"},
    {value : LegendPosition[LegendPosition.TopCenter], displayName : "Visual_LegendPosition_TopCenter"},
    {value : LegendPosition[LegendPosition.BottomCenter], displayName : "Visual_LegendPosition_BottomCenter"},
    {value : LegendPosition[LegendPosition.LeftCenter], displayName : "Visual_LegendPosition_LeftCenter"},
    {value : LegendPosition[LegendPosition.RightCenter], displayName : "Visual_LegendPosition_RightCenter"},
];

class FontSizeSettings {
    public static readonly DefaultFontSize: number = 9;
    public static readonly MinFontSize: number = 8;
    public static readonly MaxFontSize: number = 60;
}

class StrokeWidthSettings {
    public static readonly DefaultStrokeWidth: number = 1;
    public static readonly MinStrokeWidth: number = 1;
    public static readonly MaxStrokeWidth: number = 5;
}

export class EnableDataPointCardSettings extends Card {

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

    labelDisplayUnits = new formattingSettings.AutoDropdown({
        name: "labelDisplayUnits",
        displayNameKey: "Visual_DisplayUnits",
        value: 0
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
                type: powerbi.visuals.ValidatorType.Min,
                value: FontSizeSettings.MinFontSize,
            },
            maxValue: {
                type: powerbi.visuals.ValidatorType.Max,
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
                type: powerbi.visuals.ValidatorType.Min,
                value: FontSizeSettings.MinFontSize,
            },
            maxValue: {
                type: powerbi.visuals.ValidatorType.Max,
                value: FontSizeSettings.MaxFontSize,
            }
        }
    });

    name: string = "categoryLabels";
    displayNameKey: string = "Visual_CategoryLabels";
    slices = [this.show, this.color, this.fontSize];
}

export class EnableFillPointCardSettings extends Card {

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

    strokeWidth = new formattingSettings.NumUpDown({
        name: "strokeWidth",
        displayNameKey: "Visual_StrokeWidth",
        value: StrokeWidthSettings.DefaultStrokeWidth,
        options: {
            minValue: {
                type: powerbi.visuals.ValidatorType.Min,
                value: StrokeWidthSettings.MinStrokeWidth,
            },
            maxValue: {
                type: powerbi.visuals.ValidatorType.Max,
                value: StrokeWidthSettings.MaxStrokeWidth,
            }
        }
    });

    name: string = "outline";
    displayNameKey: string = "Visual_Outline";
    slices = [this.show, this.strokeWidth];
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

    setLocalizedOptions(localizationManager: ILocalizationManager) { 
        this.setLocalizedDisplayName(positionOptions, localizationManager);
    }

    public setLocalizedDisplayName(options: IEnumMember[], localizationManager: ILocalizationManager) {
        options.forEach(option => {
            option.displayName = localizationManager.getDisplayName(option.displayName.toString())
        });
    }

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
                        value: { value: dataPoint.fill },
                        selector: ColorHelper.normalizeSelector((<ISelectionId>dataPoint.identity).getSelector(), true)
                    }));
                });
            }
        }
        this.enableDataPointCardSettings.slices = slices;
    }
}