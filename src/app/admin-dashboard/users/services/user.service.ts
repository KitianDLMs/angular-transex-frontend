import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '@shared/interfaces/user.interface';
import { UsersPaginatedResponse } from '@auth/interfaces/users-paginated.interface';
import { environment } from 'src/environments/environment.development';

const baseUrl = environment.baseUrl;

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${baseUrl}/auth/users`);
  }

  getPaginatedUsers(page: number = 1, limit: number = 10): Observable<UsersPaginatedResponse> {
    return this.http.get<UsersPaginatedResponse>(
      `${baseUrl}/auth/paginated?page=${page}&limit=${limit}`
    );
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
