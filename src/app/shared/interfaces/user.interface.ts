export interface User {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  cust_code?: string; 
  isActive: boolean;    
  cust: {
    cust_code: string;
    name: string;
  };

  projects: { 
    proj_id: number; 
    proj_code: string; 
    proj_name: string;
  }[];
}
