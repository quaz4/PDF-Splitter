import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';

import { TranslateModule } from '@ngx-translate/core';

import { PageNotFoundComponent } from './components/';
import { WebviewDirective } from './directives/';
import { SplitDialog } from './components/split-dialog/split-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@NgModule({
  declarations: [PageNotFoundComponent, WebviewDirective, SplitDialog],
  imports: [CommonModule, TranslateModule, MatFormFieldModule, MatButtonModule, FormsModule, MatDialogModule, MatInputModule, MatSlideToggleModule],
  exports: [TranslateModule, WebviewDirective]
})
export class SharedModule {}
