export default class SplitState {
    pdfs: any[]; // Pdf Data
    start: number; // Head
    end: number; // Tail
    split: number; // Size of each document to split
    pages: number; // Total number of pages in initial pdf
    directory: string; // Location to save
    doNaming: boolean; // Individual naming flag
    defaultName: string; // Name to use if not naming individually
    name: string;
    count: number = 0;
}
