import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '@auth/interfaces/user.interface';
import {
  Gender,
  Product,
  ProductsResponse,
} from '@products/interfaces/product.interface';
import { delay, forkJoin, map, Observable, of, pipe, switchMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Obra, ObrasResponse } from '../interfaces/obra.interface';

const baseUrl = environment.baseUrl;

interface Options {
  limit?: number;
  offset?: number;
  gender?: string;
}

const emptyUser: User = {
  id: '',
  email: '',
  fullName: '',
  isActive: false,
  roles: []
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

  private productsCache = new Map<string, ObrasResponse>();
  private productCache = new Map<string, Obra>();

  getObras(options: Options): Observable<ObrasResponse> {
    const { limit = 9, offset = 0, gender = '' } = options;

    const key = `${limit}-${offset}-${gender}`;
    if (this.productsCache.has(key)) {
      return of(this.productsCache.get(key)!);
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
        tap((resp) => this.productsCache.set(key, resp))
      );
  }

  getObraByIdSlug(idSlug: string): Observable<Obra> {
    if (this.productCache.has(idSlug)) {
      return of(this.productCache.get(idSlug)!);
    }

    return this.http
      .get<Obra>(`${baseUrl}/obras/${idSlug}`)
      .pipe(tap((product) => this.productCache.set(idSlug, product)));
  }

  getObraById(id: string): Observable<Obra> {
    if (id === 'new') {
      return of(emptyObra);
    }

    if (this.productCache.has(id)) {
      return of(this.productCache.get(id)!);
    }

    return this.http
      .get<Obra>(`${baseUrl}/products/${id}`)
      .pipe(tap((product) => this.productCache.set(id, product)));
  }

  updateProduct(
    id: string,
    productLike: Partial<Obra>,
    imageFileList?: FileList
  ): Observable<Obra> {
    const currentImages = productLike.images ?? [];
    return this.uploadImages(imageFileList)
      .pipe(
        map(imageNames => ({
          ...productLike,
          images: [...currentImages, ...imageNames]
        })
      ),
      switchMap((updatedProduct) => 
        this.http.patch<Obra>(`${baseUrl}/products/${id}`, productLike)
      ),
      tap((product) => this.updateProductCache(product)));
    // return this.http
    //   .patch<Product>(`${baseUrl}/products/${id}`, productLike)
    //   .pipe(tap((product) => this.updateProductCache(product)));
  }

  createProduct(productLike: Partial<Product>, imageFileList?: FileList): Observable<Obra> {
    return this.http
      .post<Obra>(`${baseUrl}/products`, productLike)
      .pipe(tap((product) => this.updateProductCache(product)));
  }

  updateProductCache(product: Obra) {
    const productId = product.id;

    this.productCache.set(productId, product);

    this.productsCache.forEach((productResponse) => {
      productResponse.obras = productResponse.obras.map(
        (currentProduct) =>
          currentProduct.id === productId ? product : currentProduct
      );
    });

    console.log('Caché actualizado');
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
