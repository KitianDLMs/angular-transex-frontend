import { User } from "@shared/interfaces/user.interface";
import { Cust } from "../../cust/interfaces/cust.interface";
import { Ordl } from "./ordl.interface";

export interface Ordr {

  order_date: string;
  order_code: string;
  order_type?: string;
  prod_line_code?: string;
  stat?: string;

  cust_code?: string;
  customer?: Cust;

  ship_cust_code?: string;
  ref_cust_code?: string;

  cust_name?: string;
  cust_sort_name?: string;

  proj_code?: string;
  zone_code?: string;
  lot_block?: string;
  cust_job_num?: string;
  po?: string;

  taken_by_empl_code?: string;
  taken_on_phone_line_num?: number;

  order_by_name?: string;
  order_by_phone_num?: string;

  apply_min_load_chrg_flag?: boolean;
  apply_zone_chrg_flag?: boolean;
  apply_excess_unld_chrg_flag?: boolean;
  apply_season_chrg_flag?: boolean;
  apply_min_haul_pay_flag?: boolean;
  rm_print_mix_wgts_flag?: boolean;

  price_plant_code?: string;
  price_plant_loc_code?: string;
  comp_code?: string;
  hler_code?: string;

  min_load_chrg_table_id?: string;
  excess_unld_chrg_table_id?: string;
  season_chrg_table_id?: string;

  min_load_sep_invc_flag?: boolean;
  excess_unld_sep_invc_flag?: boolean;
  season_sep_invc_flag?: boolean;

  sales_anl_code?: string;
  slsmn_empl_code?: string;

  taxble_code?: number;
  tax_code?: string;
  non_tax_rsn_code?: string;

  susp_rsn_code?: string;
  susp_user_name?: string;

  susp_date_time?: Date;
  susp_cancel_date_time?: Date;

  susp_cancel_user_name?: string;

  remove_rsn_code?: string;
  memo_rsn_code?: string;
  pkt_num?: string;

  track_order_color?: number;
  intrnl_line_num?: number;
  curr_load_num?: number;

  cod_order_amt?: number;

  invc_code?: string;

  setup_date?: Date;
  quote_code?: string;

  delv_addr?: string;
  instr?: string;
  user_defined?: string;

  sur_codes?: string;
  sur_rate_amts?: string;
  apply_sur_rate_hler_flags?: string;

  sundry_chrg_table_ids?: string;
  apply_sundry_chrg_flags?: string;
  sundry_chrg_sep_invc_flags?: string;
  sundry_chrg_comb_meth_code?: string;
  sundry_chrg_override_rates?: string;

  order_msgs?: string;

  apply_pump_unld_chrg_flag?: string;
  pump_unld_chrg_table_id?: string;
  apply_pump_sundry_chrg_flags?: string;
  pump_sundry_chrg_table_ids?: string;
  pump_sundry_chrg_over_rates?: string;

  orderDetails?: Ordl[];
  // tickets?: Tick[];

  user?: User;

}
