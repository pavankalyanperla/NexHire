import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { RatingModule } from 'primeng/rating';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';

const PRIMENG = [
  TableModule, CardModule, ButtonModule, DialogModule, SelectModule,
  InputTextModule, InputNumberModule, RatingModule, TagModule, TextareaModule,
  ProgressSpinnerModule, DividerModule, AvatarModule, BadgeModule
];

@NgModule({
  declarations: [],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, ...PRIMENG],
  exports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, ...PRIMENG]
})
export class SharedModule {}
