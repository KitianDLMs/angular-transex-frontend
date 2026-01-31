import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  Gender,
  Product,
  ProductsResponse,
} from '@products/interfaces/product.interface';
import { delay, forkJoin, map, Observable, of, pipe, switchMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Obra, ObrasResponse } from '../interfaces/obra.interface';
import { User } from '@shared/interfaces/user.interface';

const baseUrl = environment.baseUrl;

interface Options {
  limit?: number;
  offset?: number;
  gender?: string;
}

const emptyUser: User = {
  id: '',
  email: '',
  rut: '',
  fullName: '',
  isActive: false,
  roles: [],
  cust: {cust_code: '', name: ''},
  projects: []
};

export const emptyObra: Obra = {
  id: '',
  name: '',
  location: '',
  budget: 0,
  startDate: '',
  endDate: '',
  description: '',
  images: [],
  user: emptyUser,
};


@Injectable({ providedIn: 'root' })
export class ObrasService {
  private http = inject(HttpClient);

  private obrasCache = new Map<string, ObrasResponse>();
  private obraCache = new Map<string, Obra>();

  getObras(options: Options): Observable<ObrasResponse> {
    const { limit = 9, offset = 0, gender = '' } = options;

    const key = `${limit}-${offset}-${gender}`;
    if (this.obrasCache.has(key)) {
      return of(this.obrasCache.get(key)!);
    }

    return this.http
      .get<ObrasResponse>(`${baseUrl}/obras`, {
        params: {
          limit,
          offset,
          gender,
        },
      })
      .pipe(
        tap((resp) => console.log(resp)),
        tap((resp) => this.obrasCache.set(key, resp))
      );
  }

  getObraByIdSlug(idSlug: string): Observable<Obra> {
    if (this.obraCache.has(idSlug)) {
      return of(this.obraCache.get(idSlug)!);
    }

    return this.http
      .get<Obra>(`${baseUrl}/obras/${idSlug}`)
      .pipe(tap((obra) => this.obraCache.set(idSlug, obra)));
  }

  getObraById(id: string): Observable<Obra> {
    if (id === 'new') {
      return of(emptyObra);
    }

    if (this.obraCache.has(id)) {
      return of(this.obraCache.get(id)!);
    }

    return this.http
      .get<Obra>(`${baseUrl}/obras/${id}`)
      .pipe(tap((obra) => this.obraCache.set(id, obra)));
  }

//  Crear nueva obra
  createObra(obraLike: Partial<Obra>, imageFileList?: FileList): Observable<Obra> {
    return this.uploadImages(imageFileList).pipe(
      switchMap((imageNames) => {
        const nuevaObra = { ...obraLike, images: imageNames };
        return this.http.post<Obra>(`${baseUrl}/obras`, nuevaObra);
      }),
      tap((obra) => this.updateObraCache(obra))
    );
  }

  // 🔹 Actualizar obra existente
  updateObra(id: string, obraLike: Partial<Obra>, imageFileList?: FileList): Observable<Obra> {
    const currentImages = obraLike.images ?? [];

    return this.uploadImages(imageFileList).pipe(
      map((imageNames) => ({
        ...obraLike,
        images: [...currentImages, ...imageNames],
      })),
      switchMap((obraActualizada) =>
        this.http.patch<Obra>(`${baseUrl}/obras/${id}`, obraActualizada)
      ),
      tap((obra) => this.updateObraCache(obra))
    );
  }

  // 🔹 Actualizar caché
  private updateObraCache(obra: Obra) {
    const obraId = obra.id;
    this.obraCache.set(obraId, obra);

    this.obrasCache.forEach((obraResponse) => {
      obraResponse.obras = obraResponse.obras.map((o) =>
        o.id === obraId ? obra : o
      );
    });

    console.log('✅ Caché de obras actualizada');
  }

  uploadImages(images?: FileList): Observable<string[]> {
    if (!images) return of([]);

    const uploadObservables = Array.from(images).map((imageFile) => 
      this.uploadImage(imageFile)
    );

    return forkJoin(uploadObservables).pipe(
      tap((imageNames) => console.log(imageNames))      
    )
  }

  uploadImage(imageFile: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', imageFile);
    return this.http.post<{filename: string}>(`${baseUrl}/files/product`, formData)
      .pipe(
        map((resp) => resp.filename)
      );
  }
}
