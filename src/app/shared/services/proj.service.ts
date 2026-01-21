import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment.development';
import { Proj } from 'src/app/proj/interfaces/proj.interface';

@Injectable({ providedIn: 'root' })
export class ProjService {

  private baseUrl = environment.baseUrl;
  private projCache = new Map<string, Proj[]>();

  constructor(private http: HttpClient) {}

  getByCustomer(cust_code: string) {    
    return this.http.get<Proj[]>(`${this.baseUrl}/proj/by-cust/${cust_code}`);
  }

  getProjectOptions() {
    return this.http.get<{ proj_code: string, proj_name: string }[]>(
      `${this.baseUrl}/proj/options`
    );
  }

  getAll(): Observable<Proj[]> {
    return this.http.get<Proj[]>(`${this.baseUrl}/proj`);
  }

  getByCode(code: string) {
    return this.http.get<Proj>(`${this.baseUrl}/proj/${code}`);
  }

  getProjectsByCustomer(proj_code: string): Observable<Proj[]> {
    return this.http.get<Proj[]>(`${this.baseUrl}/proj/by-cust/${proj_code}`);
  }

  getProjectsByOrder(order_code: any): Observable<Proj[]> {
    return this.http.get<Proj[]>(`${this.baseUrl}/proj`);
  }  

  getByCust(cust_code: string): Observable<any[]> {
    const key = cust_code.trim();        
    if (this.projCache.has(key)) {
      return of(this.projCache.get(key)!);
    }     
    return this.http.get<Proj[]>(`${this.baseUrl}/proj/by-cust/${key}`).pipe(
      tap(list => {
        this.projCache.set(key, list)
      }),
      catchError(err => {
        console.error('getByCust error', err);
        return of([]);
      })
    );
  }

  getOne(proj_code: string): Observable<Proj> {
    return this.http.get<Proj>(                       
      `${this.baseUrl}/proj/${proj_code}`
    );
  }

  create(dto: Partial<Proj>): Observable<Proj> {    
    return this.http.post<Proj>(`${this.baseUrl}/proj`, dto, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  update(proj_code: string, dto: Partial<Proj>): Observable<Proj> {
    return this.http.put<Proj>(
      `${this.baseUrl}/proj/${proj_code}`,
      dto
    );
  }

  delete(cust_code: string, proj_code: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/proj/${cust_code}/${proj_code}`
    );
  }

  refresh(cust_code: string) {
    this.projCache.delete(cust_code.trim());
    return this.getByCust(cust_code);
  }
}

export interface Project {
  projcode?: string;
  proj_code?: string;
  projname?: string;
  proj_name?: string;
}
