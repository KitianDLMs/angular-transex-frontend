import { User } from '@auth/interfaces/user.interface';

export interface ObrasResponse {
  count: number;
  pages: number;
  obras: Obra[];
}

export interface Obra {
  id: string;
  name: string;
  location: string;
  budget: number;
  startDate: string;
  endDate: string;
  description?: string;
  images?: string[];
  estado?: string;     
  responsable?: string;
  progreso?: number;   
  user?: User;
}
