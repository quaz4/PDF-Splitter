import { Component, OnInit, ViewChild, Inject } from '@angular/core';
const {dialog} = require('electron').remote;
import { readFileSync, writeFileSync } from 'fs';
import { SplitDialog } from '../shared/components/split-dialog/split-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import SplitState from './SplitState';
import { PDFDocument, values } from 'pdf-lib';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {
  @ViewChild('pdfViewerAutoLoad', {static: true}) pdfViewerAutoLoad;

  public filePath = '';
  public buffer: Buffer = null;

  public splitState: SplitState = null;
  public name = '';

  public zoom = 'page-fit';
  public page = 0;

  constructor(public matDialog: MatDialog) {
  }

  ngOnInit() {
  }

  loadFile() {
    dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Documents', extensions: ['pdf'] },
      ]
    }).then(async (path) => {
      console.log(path);
      if (path.filePaths.length > 0) {
        this.filePath = path.filePaths[0];

        this.getFile(this.filePath);
      }
    });
  }

  clearFile() {
    this.filePath = '';
    this.buffer = null;
    this.pdfViewerAutoLoad.pdfSrc = this.buffer;
    this.pdfViewerAutoLoad.refresh();
    this.splitState = null;
  }

  getFile(path: string) {
    this.buffer = readFileSync(path);
    this.pdfViewerAutoLoad.pdfSrc = this.buffer;
    this.pdfViewerAutoLoad.refresh();
  }

  split() {
    const dialogRef = this.matDialog.open(SplitDialog, {
      width: '250px',
      data: { split: 1, name: 'SplitDocument', directory: '', doNaming: 'true' }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      console.log('The dialog was closed');
      console.log(result);

      // Stop if result is falsy
      if (!result) { return; }

      const splitState = new SplitState();
      splitState.directory = result.directory;
      splitState.pages = await this.getPdfPageCount(this.buffer);
      splitState.split = result.split;
      splitState.start = 0;
      splitState.end = result.split - 1;
      splitState.doNaming = result.doNaming;
      splitState.defaultName = result.name;
      splitState.pdfs = [];
      this.splitState = splitState;

      const temp = await this.getPdfPages(this.buffer, this.splitState.start, this.splitState.end);
      this.pdfViewerAutoLoad.pdfSrc = temp;
      this.pdfViewerAutoLoad.refresh();

      this.splitState.pdfs.push(temp);

      if (this.splitState.doNaming === false) {
        let done = false;

        while (!done) {
          done = await this.nextSplit();
        }

        return;
      }

      console.log(this.splitState);
    });
  }

  async nextSplit() {
    console.log('Split end ' + this.splitState.end);
    if (!this.name && this.splitState.doNaming) { return; }

    if (!this.splitState.doNaming) {
      this.name = this.splitState.defaultName + this.splitState.count;
    }

    this.saveFile(this.splitState.directory, this.name, this.splitState.pdfs[this.splitState.pdfs.length - 1]);

    console.log(this.pdfViewerAutoLoad.PDFViewerApplication.toolbar);

    // If its a number the scale is wrong, for example it needs to be 150 not 1.5
    if (isNaN(this.pdfViewerAutoLoad.PDFViewerApplication.toolbar.pageScaleValue)) {
      this.zoom = this.pdfViewerAutoLoad.PDFViewerApplication.toolbar.pageScaleValue;
    } else {
      this.zoom = this.pdfViewerAutoLoad.PDFViewerApplication.toolbar.pageScaleValue * 100 + '';
    }

    this.page = this.pdfViewerAutoLoad.PDFViewerApplication.toolbar.pageNumber;

    this.name = '';
    this.splitState.count++;

    let done = false;

    // Check if this is the final document
    if (this.splitState.end === this.splitState.pages - 1) {
      done = true;
    }

    // Move the window
    this.splitState.start += this.splitState.split;
    this.splitState.end += this.splitState.split;

    // Prevent overflow
    if (this.splitState.end > this.splitState.pages - 1) {
      this.splitState.end = this.splitState.pages - 1;
    }

    const temp = await this.getPdfPages(this.buffer, this.splitState.start, this.splitState.end);
    this.pdfViewerAutoLoad.pdfSrc = temp;
    this.pdfViewerAutoLoad.refresh();

    this.splitState.pdfs.push(temp);

    if (done) {
      this.cleanupSplit();
    }

    return done;
  }

  cleanupSplit() {
    this.splitState = null;
    this.pdfViewerAutoLoad.pdfSrc = this.buffer;
    this.pdfViewerAutoLoad.refresh();
  }

  async getPdfPageCount(pdf: Buffer): Promise<number> {
    const pdfDoc = await PDFDocument.load(this.buffer);
    const pages = pdfDoc.getPages();
    return pages.length;
  }

  async getPdfPages(pdf: Buffer, start: number, end: number): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.load(this.buffer);

    const splitDoc = await PDFDocument.create();

    for (let step = start; step <= end; step++) {
      console.log('Copying page ' + step);
      const [donorPages] = await splitDoc.copyPages(pdfDoc, [step]);
      await splitDoc.addPage(donorPages);
    }

    const pdfBytes = await splitDoc.save();

    console.log(splitDoc.getPageCount());

    console.log(pdfBytes);
    // return new Buffer(pdfBytes);
    return pdfBytes;
  }

  saveFile(path: string, name, contents: any) {
    console.log('Saving PDF');
    writeFileSync(path + '/' + name + '.pdf', contents);
  }
}
