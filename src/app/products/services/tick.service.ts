import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment.development";

@Injectable({
 providedIn:'root'
})
export class TickService {

private baseUrl = `${environment.baseUrl}/tick`;

constructor(
 private http:HttpClient
){}
  searchTicks(filters:any) {
  let params = new HttpParams()
  .set('custCode', filters.custCode)
  .set('page', filters.page ?? 1)
  .set('limit', filters.limit ?? 10);
    if(filters.projCode)
    params=params.set(
      'projCode',
      filters.projCode
    );


  if(filters.docNumber)
    params=params.set(
      'docNumber',
      filters.docNumber
    );


  if(filters.dateFrom)
    params=params.set(
      'dateFrom',
      filters.dateFrom
    );


    if(filters.dateTo)
      params=params.set(
      'dateTo',
      filters.dateTo
    );


    return this.http.get<any>(
      `${this.baseUrl}/search`,
      {
        params,
        headers: {
          'Cache-Control': 'no-cache'
        }
      }
    );
  }

  getAllTickCodes(filters:any){
    return this.http.post<string[]>(
      `${this.baseUrl}/all-codes`,
      filters
    );
  }

  downloadZipByCodes( codes:string[] ){
    return this.http.post(
      `${this.baseUrl}/download-zip`,
      {
        tktCodes:codes
      },
      {
        observe:'response',
        responseType:'blob'
      }
    );
  }

 downloadAllFiltered(filters:any){

  return this.http.post(
    `${this.baseUrl}/download-all`,
    filters,
    {
      observe:'response',
      responseType:'blob'
    }
  );

}


  downloadTicketPDF(
  tktCode:string
  ){

  return this.http.get(
    `${this.baseUrl}/download/${tktCode}`,
    {
    responseType:'blob'
    }
  );

  }

  getAllForExcel(filters:any){

  let params = new HttpParams();

  Object.keys(filters)
  .forEach(key=>{
      params=params.set(
        key,
        filters[key]
      );
  });


  return this.http.get<any[]>(
    `${this.baseUrl}/export/excel`,
    {
      params
    }
  );

  }

  downloadTickPDF(tkt_code: string) {
    console.log('downloadTickPDF ', tkt_code); 
    // http://localhost:3000/api/drive/download/691118   
    return this.http.get(`${this.baseUrl}/download/${tkt_code}`, {
      responseType: 'blob'
    });
  }
}