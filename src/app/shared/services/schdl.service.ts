import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Ordr } from 'src/app/ordr/interfaces/ordr.interface';
import { environment } from 'src/environments/environment.development';

@Injectable({ providedIn: 'root' })
export class SchdlService {
  baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getSchlByPedido(
    order_code: string,
    order_date: string
  ): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/schl`,
      {
        params: {
          order_code: order_code.trim(),
          order_date: order_date.trim(),
        },
      }
    );
  }
}
