import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { Imst } from '@dashboard/imst/interfaces/imst.interface';

@Injectable({ providedIn: 'root' })
export class ProdService {

  private baseUrl = `${environment.baseUrl}/imst`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Imst[]> {
    return this.http.get<Imst[]>(this.baseUrl);
  }

  getLinesByItem(item_code: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.baseUrl}/prjp/item/${item_code}`);
  }

  getOne(item_code: string): Observable<Imst> {
    return this.http.get<Imst>(`${this.baseUrl}/item/${item_code}`);
  }

  getByProject(proj_code: string): Observable<Imst[]> {
    return this.http.get<Imst[]>(`${this.baseUrl}/project/${proj_code}`);
  }

  getByCustomer(cust_code: string): Observable<Imst[]> {
    return this.http.get<Imst[]>(`${this.baseUrl}/customer/${cust_code}`);
  }

  create(dto: Partial<Imst>): Observable<Imst> {
    return this.http.post<Imst>(this.baseUrl, dto);
  }

  update(item_code: string, dto: Partial<Imst>): Observable<Imst> {
    return this.http.patch<Imst>(`${this.baseUrl}/${item_code}`, dto);
  }

  delete(item_code: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/item/${item_code}`);
  }
}
