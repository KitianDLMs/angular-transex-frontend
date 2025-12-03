import { Component, Input } from '@angular/core';
import { Cust } from '@dashboard/cust/interfaces/cust.interface';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'cust-table',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cust-table.component.html',
})
export class CustTableComponent {
  @Input() custs: Cust[] | null = null;

  constructor(private router: Router) { }

  trackByCustCode(_: number, cust: Cust) {
    return cust.cust_code;
  }
}
