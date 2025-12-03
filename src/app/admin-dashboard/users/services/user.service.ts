import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '@shared/interfaces/user.interface';

const baseUrl = environment.baseUrl;

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${baseUrl}/auth/users`);
  }

  getUserById(id: string) {
    return this.http.get<User>(`${baseUrl}/auth/users/${id}`);
  }

  updateUser(id: string, updateUserDto: any) {
    return this.http.put(`${baseUrl}/auth/users/${id}`, updateUserDto);
  }

   createUser(data: any): Observable<any> {
    return this.http.post(`${baseUrl}/auth/register`, data);
  }
}
