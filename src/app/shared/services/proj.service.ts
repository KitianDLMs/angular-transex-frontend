import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Proj } from 'src/app/proj/interfaces/proj.interface';

@Injectable({ providedIn: 'root' })
export class ProjService {

  private baseUrl = environment.baseUrl;
  private projCache = new Map<string, Proj[]>();

  constructor(private http: HttpClient) {}

  getAll(): Observable<Proj[]> {
    return this.http.get<Proj[]>(`${this.baseUrl}/proj`);
  }

  getByCust(cust_code: string): Observable<Proj[]> {
    const key = cust_code.trim();

    if (this.projCache.has(key)) {
      return of(this.projCache.get(key)!);
    }

    return this.http.get<Proj[]>(`${this.baseUrl}/proj/by-cust/${key}`).pipe(
      tap(list => this.projCache.set(key, list)),
      catchError(err => {
        console.error('getByCust error', err);
        return of([]);
      })
    );
  }

  getOne(proj_code: string): Observable<Proj> {
    console.log(this.baseUrl);
    console.log(proj_code);
    
    return this.http.get<Proj>(                       
      `${this.baseUrl}/proj/${proj_code}`
    );
  }

  create(dto: Partial<Proj>): Observable<Proj> {
    return this.http.post<Proj>(`${this.baseUrl}/proj`, dto);
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