import { User } from "@shared/interfaces/user.interface";

export interface AuthResponse {
  user: User;
  token: string;
}
