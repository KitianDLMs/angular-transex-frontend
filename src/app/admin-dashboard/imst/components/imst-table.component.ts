import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Imst } from '../interfaces/imst.interface';

@Component({
  selector: 'app-imst-table',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './imst-table.component.html',
})
export class ImstTableComponent {
  @Input() products: Imst[] = [];
  loading = signal(false);
  error = signal<string | null>(null);
  

  trackByItemCode(index: number, item: any) {
    return item.item_code;
  }

}
