import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProjService } from '@shared/services/proj.service';
import { Proj } from 'src/app/proj/interfaces/proj.interface';

@Component({
  selector: 'app-proj-edit-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './proj-edit-page.component.html',
})
export class ProjEditPageComponent implements OnInit {

  form!: FormGroup;
  loading = false;
  error = '';
  cust_code!: string;
  proj_code!: string;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private projService: ProjService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cust_code = this.route.snapshot.paramMap.get('cust_code')!;
    this.proj_code = this.route.snapshot.paramMap.get('proj_code')!;

    this.form = this.fb.group({
      cust_code: [{ value: '', disabled: true }, Validators.required],
      proj_code: [{ value: '', disabled: true }, Validators.required],
      proj_name: ['', Validators.required],
      sort_name: [''],
      ship_cust_code: [''],
      ref_cust_code: [''],
      po: [''],
      cust_job_num: [''],
      setup_date: [''],      
    });

    this.loadProj();
  }

  loadProj() {
    this.loading = true;
    this.projService.getOne(this.proj_code).subscribe({
      next: (proj: Proj) => {
        this.loading = false;
        this.form.patchValue(proj);
      },
      error: () => {
        this.loading = false;
        this.error = 'Error cargando el proyecto';
      }
    });
  }

  save() {
    if (this.form.invalid) return;

    const updateData = this.form.getRawValue();
    this.projService.update(this.proj_code, updateData).subscribe({
      next: () => {
        alert('Proyecto actualizado');
        this.router.navigate(['/admin/proj']);
      },
      error: () => {
        this.error = 'Error actualizando el proyecto';
      }
    });
  }
}
