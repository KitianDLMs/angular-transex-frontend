export interface Ordr {
  order_code: string;
  order_date: string;

  cust_code?: string | null;
  proj_code?: string | null;
  sort_name?: string | null;

  ship_cust_code?: string | null;
  ref_cust_code?: string | null;
  po?: string | null;
  cust_job_num?: string | null;
  setup_date?: string | null;
}
