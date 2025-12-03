import { Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Proj } from 'src/app/proj/interfaces/proj.interface';

@Component({
  selector: 'proj-table',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './proj-table.component.html',
})
export class ProjTableComponent {

  @Input() projs: Proj[] | null = null;

  constructor(private router: Router) {}

  trackByProjCode(_: number, proj: Proj) {
    return proj.proj_code;
  }
}
