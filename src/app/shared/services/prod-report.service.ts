import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment.development';

export interface OrderDetail {
  ordencompra: string | null;
  respaldado: number;
  utilizado: number;
  saldo: number;
}
export interface ProductReport {
  codigo: string;
  producto: string;
  respaldado: number;
  utilizado: number;
  saldo: number;
  ordencompra?: any; 
  ordenes: OrderDetail[];
}

@Injectable({ providedIn: 'root' })
export class ProdReportService {
  private baseUrl = environment.baseUrl;
  private reportCache = new Map<string, ProductReport[]>();

  constructor(private http: HttpClient) {}

  getReport(filters: {
    custCode: string;
    projCode?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Observable<any> {

    const key = JSON.stringify(filters);

    if (this.reportCache.has(key)) {
      return of(this.reportCache.get(key)!);
    }

    let params = new HttpParams()
      .set('custCode', filters.custCode)
      .set('page', (filters.page ?? 1).toString())
      .set('limit', (filters.limit ?? 10).toString());

    if (filters.projCode) params = params.set('projCode', filters.projCode);
    if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params = params.set('dateTo', filters.dateTo);
    if (filters.search) params = params.set('search', filters.search);
    console.log(filters);    
    return this.http.get<any>(`${this.baseUrl}/product-report`, { params }).pipe(
      // tap((resp) => this.reportCache.set(key, resp)),
      tap((resp) => {
        console.log('Respuesta de la API:', resp); // <--- Aquí ves lo que llega
        this.reportCache.set(key, resp);
      }),
      catchError((err) => {
        console.error('Error fetching product report', err);
        return of({ page: 1, limit: 10, total: 0, totalPages: 1, data: [] });
      })
    );
  }

  refresh(filters: {
    custCode: string;
    projCode?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Observable<any> {
    const key = JSON.stringify(filters);
    this.reportCache.delete(key);
    return this.getReport(filters);
  }
}
