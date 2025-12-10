import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Ordr } from 'src/app/ordr/interfaces/ordr.interface';
import { environment } from 'src/environments/environment.development';
import { Imst } from '@dashboard/imst/interfaces/imst.interface';

@Injectable({ providedIn: 'root' })
export class ImstService {
  baseUrl = environment.baseUrl;
  private ordrCache = new Map<string, Imst[]>();

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

  getOrdersByCustCode(cust_code: string): Observable<Ordr[]> {
    const params = new HttpParams().set('cust_code', cust_code.trim());

    return this.http.get<Ordr[]>(this.baseUrl, { params });
  }

   getOrders(cust_code?: string, proj_code?: string) {
    let params: any = {};

    if (cust_code) params.cust_code = cust_code.trim();
    if (proj_code) params.proj_code = proj_code.trim();

    return this.http.get(`${this.baseUrl}/ordr`, { params });
  }

  getLines(order_date: string, order_code: string) {
    return this.http.get(`${this.baseUrl}/ordl/byOrder/${order_date}/${order_code}`);
  }

  getFilteredOrders(cust_code: string, proj_code: string) {
    return this.http.get<Ordr[]>(`${this.baseUrl}/ordr/filter`, {
      params: {
        cust_code: cust_code.trim(),
        proj_code: proj_code.trim()
      }
    });
  }

  getOrdrByCustCode(cust_code: string): Observable<Ordr> {
    console.log(cust_code);    
    return this.http.get<Ordr>(
      `${this.baseUrl}/ordr/${cust_code}`
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


  // refreshOrdrs(cust_code: string) {
  //   this.ordrCache.delete(cust_code?.trim());
  //   return this.getOrdrsByCust(cust_code);
  // }
}
