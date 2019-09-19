import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
const {dialog} = require('electron').remote;

@Component({
  selector: 'split-dialog',
  templateUrl: './split-dialog.component.html',
  styleUrls: ['./split-dialog.component.scss']
})
export class SplitDialog {

  constructor(
    public dialogRef: MatDialogRef<SplitDialog>,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  selectDirectory() {
    dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
    }).then(async (path) => {
      if (path.filePaths.length > 0) {
        this.data.directory = path.filePaths[0];
      }
    });
  }

  disableButton() {
    return !(this.data.directory && (this.data.name || this.data.doNaming) && this.data.split > 0);
  }

}
