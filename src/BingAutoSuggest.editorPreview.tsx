import { Component, ReactNode, createElement } from "react";
import { BingAutoSuggestPreviewProps } from "../typings/BingAutoSuggestProps";

export class preview extends Component<BingAutoSuggestPreviewProps> {
    render(): ReactNode {
        return <div>{this.props.searchString}</div>;
    }
}
