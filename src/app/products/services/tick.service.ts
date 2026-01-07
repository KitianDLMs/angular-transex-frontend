import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({ providedIn: 'root' })
export class TickService {

  private baseUrl = `${environment.baseUrl}/tick`;

 constructor(private http: HttpClient) {}

  getTicks() {
    return this.http.get<any>(`${this.baseUrl}`);
  }

  searchTicks(filters: {
    custCode: string;
    projCode?: string;
    docNumber?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) {
    let params = new HttpParams()
      .set('custCode', filters.custCode)
      .set('page', (filters.page ?? 1).toString())
      .set('limit', (filters.limit ?? 20).toString());

    if (filters.projCode) {
      params = params.set('projCode', filters.projCode);
    }

    if (filters.docNumber) {
      params = params.set('docNumber', filters.docNumber);
    }

    if (filters.dateFrom) {
      params = params.set('dateFrom', filters.dateFrom);
    }

    if (filters.dateTo) {
      params = params.set('dateTo', filters.dateTo);
    }

    return this.http.get<any>(`${this.baseUrl}/search`, { params });
  }

  downloadZip(filters: {
    custCode: string;
    projCode?: string;
    docNumber?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    return this.http.post(`${this.baseUrl}/download-all-zip`, filters, {
      observe: 'response',  // Necesario para leer headers
      responseType: 'blob', // Para recibir el ZIP
    });
  }

  checkTktCodes(filters: any) {
    return this.http.post(`${this.baseUrl}/check-tkt-codes`, filters);
  }

  downloadZipByCodes(tktCodes: string[]) {
    return this.http.post(`${this.baseUrl}/download-zip`, { tktCodes }, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  getAllTickCodes(filters: any) {
    return this.http.post<string[]>(`${this.baseUrl}/all-codes`, filters);
  }

  getAllTktCodes(filters: {
    custCode: string;
    projCode?: string;
    docNumber?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    return this.http.post<string[]>(`${this.baseUrl}/search-tkt-codes`, filters);
  }

  getOne(order_date: string, order_code: string, tkt_code: string) {
    return this.http.get<any>(`${this.baseUrl}/${order_date}/${order_code}/${tkt_code}`);
  }

  downloadTickPDF(tkt_code: string) {
    return this.http.get(`${this.baseUrl}/download/${tkt_code}`, {
      responseType: 'blob'
    });
  }

  getAllForExcel(filters: any) {
    return this.http.get<any[]>(
      `${this.baseUrl}/export/excel`,
      { params: filters }
    );
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
