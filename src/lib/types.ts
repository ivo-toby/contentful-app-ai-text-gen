export interface AutoComplete {
    text: string;
    index: number;
}
export interface AutoCompleteResponse {
    choices: AutoComplete[];
}
