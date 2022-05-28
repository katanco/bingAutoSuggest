/**
 * This file was generated from BingAutoSuggest.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix UI Content Team
 */
import { CSSProperties } from "react";
import { ActionValue, DynamicValue, EditableValue } from "mendix";
import { Big } from "big.js";

export interface BingAutoSuggestContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    searchString: EditableValue<string>;
    formattedResultString?: EditableValue<string>;
    latDecimal?: EditableValue<Big>;
    longDecimal?: EditableValue<Big>;
    jsonResultString?: EditableValue<string>;
    onSelectAction?: ActionValue;
    apiKey: DynamicValue<string>;
    resultsCount?: DynamicValue<Big>;
    verboseLog: boolean;
}

export interface BingAutoSuggestPreviewProps {
    className: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    searchString: string;
    formattedResultString: string;
    latDecimal: string;
    longDecimal: string;
    jsonResultString: string;
    onSelectAction: {} | null;
    apiKey: string;
    resultsCount: string;
    verboseLog: boolean;
}
