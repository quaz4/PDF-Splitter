import { Component, OnInit } from '@angular/core';
const {dialog} = require('electron').remote;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})


export class HomeComponent implements OnInit {

  public filePath = "";

  constructor() { }

  ngOnInit() {
  }

  loadFile() {
    dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Documents', extensions: ['pdf'] },
      ]
    }).then((path) => {
      console.log(path);
      if (path.filePaths.length > 0) {
        this.filePath = path.filePaths[0];
      }
    });
  }
}
