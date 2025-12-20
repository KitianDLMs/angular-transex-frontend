import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";


@Injectable({ providedIn: 'root' })
export class TickService {

  private baseUrl = `${environment.baseUrl}/tick`;

 constructor(private http: HttpClient) {}


  getTicks() {
    return this.http.get<any>(`${this.baseUrl}`);
  }

  getOne(order_date: string, order_code: string, tkt_code: string) {
    return this.http.get<any>(`${this.baseUrl}/${order_date}/${order_code}/${tkt_code}`);
  }

  downloadTickPDF(tkt_code: string) {
    return this.http.get(`${this.baseUrl}/download/${tkt_code}`, {
      responseType: 'blob'
    });
  }

  getTicksByCustomer(
    custCode: string,
    page = 1,
    limit = 20
  ) {
    return this.http.get<any>(
      `${this.baseUrl}/by-customer/${custCode}?page=${page}&limit=${limit}`
    );
  }


  getProjectsByOrder(order_code: any) {
    return this.http.get<any>(`${this.baseUrl}/${order_code}`);
  }

  downloadFile(fileName: string) {
    console.log(fileName);  
    return this.http.get(`${this.baseUrl}/file/${fileName}`, {
      responseType: 'blob'
    });
  }

  downloadGuide(guideId: string) {
    return this.http.get(
      `${this.baseUrl}/${guideId}`,
      { responseType: 'blob' }
    );
  }


  createTick(dto: any, file?: File) {
    const form = new FormData();

    Object.keys(dto).forEach(key => form.append(key, dto[key]));

    if (file) form.append('file', file);

    return this.http.post<any>(`${this.baseUrl}`, form);
  }

  downloadDocument(docPath: string) {
    return this.http.get(`${environment.baseUrl}/${docPath}`, {
      responseType: 'blob'
    });
  }
}
