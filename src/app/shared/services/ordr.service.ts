import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Ordr } from 'src/app/ordr/interfaces/ordr.interface';
import { environment } from 'src/environments/environment';

const API_BASE = '/api'; // ajústalo a tu base real (ej: http://localhost:3000)

@Injectable({ providedIn: 'root' })
export class OrdrService {
  baseUrl = environment.baseUrl;
  private ordrCache = new Map<string, Ordr[]>();

  constructor(private http: HttpClient) {}

  createOrdr(dto: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/ordr`, dto);
  }

  getAllOrdrs(): Observable<Ordr[]> {
    return this.http.get<Ordr[]>(`${this.baseUrl}/ordr`).pipe(
      catchError(err => {
        return of([]);
      })
    );
  }

  getOrdrByCustCode(cust_code: string): Observable<Ordr[]> {
    return this.http.get<Ordr[]>(`${this.baseUrl}/ordr/by-cust/${cust_code}`);
  }

  getOrdrsByCust(cust_code: string): Observable<Ordr[]> {
    const key = cust_code?.trim();
    if (!key) return of([])
    if (this.ordrCache.has(key)) return of(this.ordrCache.get(key)!);
    const params = new HttpParams().set('cust_code', key);
    return this.http.get<Ordr[]>(`${API_BASE}/ordr`, { params }).pipe(
      tap(list => this.ordrCache.set(key, list || [])),
      catchError(err => {
        return of([]);
      })
    );
  }

  updateOrdr(order_code: string, dto: any): Observable<any> {
    return this.http.patch(
      `${this.baseUrl}/ordr/${order_code}`,
      dto
    );
  }

  getOne(order_code: string): Observable<Ordr> {
    return this.http.get<Ordr>(
      `${this.baseUrl}/ordr/${order_code}`
    );
  }


  refreshOrdrs(cust_code: string) {
    this.ordrCache.delete(cust_code?.trim());
    return this.getOrdrsByCust(cust_code);
  }
}
