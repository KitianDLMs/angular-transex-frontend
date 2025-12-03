import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

import { FormErrorLabelComponent } from 'src/app/shared/components/form-error-label/form-error-label.component';
import { ProductCarouselComponent } from '@products/components/product-carousel/product-carousel.component';
import { ObrasService } from 'src/app/obras/services/obras.service';
import { Obra } from 'src/app/obras/interfaces/obra.interface';

@Component({
  selector: 'obra-details',
  imports: [ReactiveFormsModule, FormErrorLabelComponent, ProductCarouselComponent],
  templateUrl: './obra-details.component.html',
})
export class ObraDetailsComponent implements OnInit {
  obra = input.required<Obra>();

  router = inject(Router);
  fb = inject(FormBuilder);
  obrasService = inject(ObrasService);
  wasSaved = signal(false);

  imageFileList: FileList | undefined = undefined;
  tempImages = signal<string[]>([]);

  imagesToCarousel = computed(() => {
    return [
      ...(this.obra().images ?? []),
      ...(this.tempImages() ?? []),
    ];
  });

  obraForm = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    encargado: ['', Validators.required],
    direccion: [''],
    fechaInicio: ['', Validators.required],
    fechaTermino: [''],
    estado: ['en_ejecucion', Validators.required],
  });

  ngOnInit(): void {
    this.setFormValue(this.obra());
  }

  setFormValue(obra: Partial<Obra>) {
    this.obraForm.reset(obra as any);
  }

  async onSubmit() {
    const isValid = this.obraForm.valid;
    this.obraForm.markAllAsTouched();
    if (!isValid) return;

    const formValue = {
      ...this.obraForm.value,
      estado: this.obraForm.value.estado ?? 'en_ejecucion'
    };

    if (this.obra().id === 'new') {
      const nuevaObra = await firstValueFrom(
        this.obrasService.createObra(formValue, this.imageFileList)
      );
      this.router.navigate(['/admin/obras', nuevaObra.id]);
    } else {
      await firstValueFrom(
        this.obrasService.updateObra(this.obra().id, formValue, this.imageFileList)
      );
    }

    this.wasSaved.set(true);
    setTimeout(() => this.wasSaved.set(false), 3000);
  }

  onFilesChanged(event: Event) {
    const fileList = (event.target as HTMLInputElement).files;
    this.imageFileList = fileList ?? undefined;
    const imageUrls = Array.from(fileList ?? []).map((file) =>
      URL.createObjectURL(file)
    );
    this.tempImages.set(imageUrls);
  }
}
