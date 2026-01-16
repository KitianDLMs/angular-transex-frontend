export interface User {
  id: string;
  email: string;
  fullName: string;
  roles: string[];

  cust_code?: string;
  cust_codes?: string[];

  isActive: boolean;

  cust?: {
    cust_code: string;
    name: string;
  } | null;

  projects: { 
    proj_id: number; 
    proj_code: string; 
    proj_name: string;
  }[] | null;

  projs?: any[];
}
