import Big from "big.js";
import { Component, ReactNode, createElement } from "react";
import { BingAutoSuggestContainerProps } from "../typings/BingAutoSuggestProps";
import _ from "lodash";

import "./ui/BingAutoSuggest.css";

const MapsLibScript = `bingAutoSuggestMicrosoftMapsLoad`;

export default class BingAutoSuggest extends Component<BingAutoSuggestContainerProps> {
    private src?: HTMLScriptElement;
    private manager?: Microsoft.Maps.AutosuggestManager;
    private id: string;

    constructor(props: BingAutoSuggestContainerProps) {
        super(props);
        this.id = _.uniqueId(`${props.name}-`);
    }

    componentDidMount(): void {
        if (!(window as any)[MapsLibScript] && window.Microsoft?.Maps?.loadModule === undefined) {
            this.log(`creating script element...`);
            const script = document.createElement("script");

            this.log(`setting script element details...`);

            script.src = `https://www.bing.com/api/maps/mapcontrol?callback=${MapsLibScript}&key=${this.props.apiKey.value}`;
            script.async = true;
            script.defer = true;

            this.src = script;

            (window as any)[MapsLibScript] = () => this.onMicrosoftMapsLoad();

            document.head.appendChild(script);

            this.log(`called bing src file with callback...`);
        } else if (window.Microsoft?.Maps?.loadModule === undefined) {
            this.log(`waiting for adjacent Microsoft Maps load`);
            this.waitUntil(
                () => window.Microsoft?.Maps?.loadModule !== undefined,
                () => this.onMicrosoftMapsLoad(),
                () => console.error(`${this.props.name} took too long to wait for adjacent load, quitting`)
            );
        } else {
            this.log(`utilizing existing Microsoft Maps`);
            this.onMicrosoftMapsLoad();
        }
    }

    componentWillUnmount(): void {
        if (this.src) {
            document.head.removeChild(this.src);
            (window as any)[`onMicrosoftMapsLoad${this.props.name}`] = undefined;
        }
        if (this.manager) {
            this.manager.dispose();
        }
        this.log(`dismounted`);
    }

    render(): ReactNode {
        return (
            <div>
                <div id={`${this.id}__SuggestionContainer`}>
                    <input type="text" className="form-control" id={`${this.id}__SuggestionInput`} />
                </div>
            </div>
        );
    }

    onMicrosoftMapsLoad(): void {
        this.log(`starting onMicrosoftMapsLoad callback...`);

        if (Microsoft?.Maps?.loadModule) {
            this.log(`Loaded Microsoft Maps Base`);
            if (Microsoft?.Maps?.AutosuggestManager) {
                this.log(`utilizing existing Microsoft Maps AutoSuggest`);
                this.onAutoSuggestLoad();
            } else {
                this.log(`loading Microsoft Maps AutoSugguest`);
                Microsoft.Maps.loadModule("Microsoft.Maps.AutoSuggest", () => {
                    this.log(`Loaded Microsoft Maps AutoSuggest`);
                    this.onAutoSuggestLoad();
                });
            }
        } else {
            console.error(`${this.props.name} failed to load base, unable to mount`);
        }
        this.log(`ending callback...`);
    }

    onAutoSuggestLoad(): void {
        this.log(`starting onAutoSuggestLoad...`);

        const options = { maxResults: this.props.resultsCount?.value?.toNumber() || 5 };
        this.manager = new Microsoft.Maps.AutosuggestManager(options);
        this.manager.attachAutosuggest(
            `#${this.id}__SuggestionInput`,
            `#${this.id}__SuggestionContainer`,
            (suggestionResult: any) => this.selectedSuggestion(suggestionResult)
        );

        this.log(`attached ${this.id}
        ending onAutoSuggestLoad...`);
    }

    selectedSuggestion(suggestionResult: Microsoft.Maps.ISuggestionResult): void {
        this.props.searchString.setValue(suggestionResult.formattedSuggestion);
        this.props.latDecimal?.setValue(Big(suggestionResult.location.latitude));
        this.props.longDecimal?.setValue(Big(suggestionResult.location.longitude));
        this.props.formattedResultString?.setValue(suggestionResult.formattedSuggestion);
        this.props.jsonResultString?.setValue(JSON.stringify(suggestionResult));

        if (this.props.onSelectAction && this.props.onSelectAction.canExecute) {
            this.props.onSelectAction.execute();
        }

        this.log(
            `Suggestion selected
            Suggestion: ${suggestionResult.formattedSuggestion}
            Latitude: ${suggestionResult.location.latitude}
            longitude: ${suggestionResult.location.longitude}
            JSON: ${JSON.stringify(suggestionResult)}`
        );
    }

    log(logdetails: string): void {
        if (this.props.verboseLog) {
            console.log(`${this.props.name}: ${logdetails}`);
        }
    }

    waitUntil(
        isready: () => boolean,
        success: () => void,
        error?: () => void,
        count?: number,
        interval?: number
    ): void {
        if (count === undefined) {
            count = 50;
        }
        if (interval === undefined) {
            interval = 200;
        }
        if (isready()) {
            success();
            return;
        }
        // The call back isn't ready. We need to wait for it
        setTimeout(() => {
            if (!count) {
                // We have run out of retries
                if (error !== undefined) {
                    error();
                }
            } else {
                // Try again
                this.waitUntil(isready, success, error, count - 1, interval);
            }
        }, interval);
    }
}
