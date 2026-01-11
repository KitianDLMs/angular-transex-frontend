import { User } from "@shared/interfaces/user.interface";

export interface UsersPaginatedResponse {
  page: number;
  limit: number;
  totalItems: number;   // <--- nombre REAL del backend
  totalPages: number;
  data: User[];
}
