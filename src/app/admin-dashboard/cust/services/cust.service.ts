import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { Cust } from '../interfaces/cust.interface';
import { environment } from 'src/environments/environment.development';

const baseUrl = environment.baseUrl;

@Injectable({ providedIn: 'root' })
export class CustService {
  private http = inject(HttpClient);

  private custCache = new Map<string, Cust>();
  private custsCache: Cust[] | null = null;
  
  getCusts(): Observable<Cust[]> {
    if (this.custsCache) {
      return of(this.custsCache);
    }

    return this.http.get<Cust[]>(`${baseUrl}/cust`).pipe(
      tap((custs) => this.custsCache = custs)
    );
  }
  
  getCustByCode(cust_code: string): Observable<Cust> {

    if (this.custCache.has(cust_code)) {
      const cached = this.custCache.get(cust_code)!;
      return of(cached);
    }

    return this.http.get<Cust>(`${baseUrl}/cust/${cust_code}`).pipe(
      tap((cust) => {
        this.custCache.set(cust_code, cust);
      })
    );
  }

  
  createCust(custLike: Partial<Cust>): Observable<Cust> {
    return this.http.post<Cust>(`${baseUrl}/cust`, custLike).pipe(
      tap((cust) => {
        this.custCache.set(cust.cust_code, cust);
        this.custsCache = null;
      })
    );
  }

  getOrdersByCustomer(cust_code: string): Observable<any[]> {
    if (!cust_code) return of([]);
    return this.http.get<any[]>(`${baseUrl}/cust/${cust_code}/orders`);
  }

  getOrdersByProject(proj_code: string): Observable<any[]> {
    if (!proj_code) return of([]);
    return this.http.get<any[]>(`${baseUrl}/cust/proj/${proj_code}/orders`);
  }
    
  updateCust(cust_code: string, custLike: Partial<Cust>): Observable<Cust> {
    return this.http.patch<Cust>(`${baseUrl}/cust/${cust_code}`, custLike).pipe(
      tap((cust) => {
        this.custCache.set(cust_code, cust);
        this.custsCache = null;        
      })
    );
  }
  
  deleteCust(cust_code: string): Observable<any> {
    return this.http.delete(`${baseUrl}/cust/${cust_code}`).pipe(
      tap(() => {
        this.custCache.delete(cust_code);
        this.custsCache = null;
      })
    );
  }
}
