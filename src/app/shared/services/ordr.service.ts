import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Ordr } from 'src/app/ordr/interfaces/ordr.interface';
import { environment } from 'src/environments/environment.development';

@Injectable({ providedIn: 'root' })
export class OrdrService {
  baseUrl = environment.baseUrl;
  private ordrCache = new Map<string, Ordr[]>();

  constructor(private http: HttpClient) {}

  createOrdr(dto: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/ordr`, dto);
  }

  getPedidosPorProyecto(
    projCode: string,
    custCode: string
  ) {
    return this.http.get<any[]>(
      `${this.baseUrl}/ordr/external/by-project`,
      {
        params: {
          proj_code: projCode.trim(),
          cust_code: custCode.trim(),
        },
      }
    );
  }

  getPedidosPorCliente(custCode: string) {
    if (!custCode) {
      throw new Error('custCode es requerido');
    }

    return this.http.get<any[]>(
      `${this.baseUrl}/ordr/external/by-customer`,
      {
        params: {
          cust_code: custCode.trim(),
        },
      }
    );
  }

  getAllOrdrs(): Observable<Ordr[]> {
    return this.http.get<Ordr[]>(`${this.baseUrl}/ordr`).pipe(
      catchError(err => {
        return of([]);
      })
    );
  }

  getOrdersByCustomerPaginated(
    custCode: string,
    projCode: string,
    page: number,
    limit: number,
  ) {
    const params: any = {
      custCode,
      page,
      limit,
    };

    if (projCode) {
      params.projCode = projCode;
    }

    return this.http.get<any>(
      `${this.baseUrl}/ordl/by-customer`,
      { params }
    );
  }

  getProjectsByCustomer(custCode: string) {
    return this.http.get<any[]>(
      `${this.baseUrl}/ordr/projects-by-customer`,
      {
        params: { custCode }
      }
    );
  }


  getOrdersByCustomer(custCode: string) {
    return this.http.get<any[]>(`${environment.baseUrl}/ordrl/customer/${custCode}`);
  }

  getOrdersByCustCode(cust_code: string): Observable<Ordr[]> {
    const params = new HttpParams().set('cust_code', cust_code.trim());

    return this.http.get<Ordr[]>(this.baseUrl, { params });
  }

  getOrders(cust_code?: string, proj_code: string = '') {

    const params: any = {
      cust_code: cust_code?.trim() || '',
      proj_code: proj_code?.trim() || ''
    };

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
