import { Ordr } from "../../ordr/interfaces/ordr.interface";

export interface Ordl {

  order_date: Date;
  order_code: string;
  order_intrnl_line_num: number;

  sort_line_num?: number;

  prod_code?: string;
  prod_descr?: string;
  short_prod_descr?: string;
  prod_cat?: string;

  price?: number;
  cstmry_price?: number;
  metric_price?: number;

  price_uom?: string;
  cstmry_price_uom?: string;
  metric_price_uom?: string;

  price_derived_from_code?: string;
  price_ext_code?: string;

  price_qty?: number;

  delv_price_flag?: boolean;

  dflt_load_qty?: number;
  cstmry_dflt_load_qty?: number;
  metric_dflt_load_qty?: number;

  dflt_load_qty_uom?: string;

  order_qty_ext_code?: string;

  order_dosage_qty?: number;
  cstmry_order_dosage_qty?: number;
  metric_order_dosage_qty?: number;

  order_dosage_qty_uom?: string;
  cstmry_order_dosage_qty_uom?: string;
  metric_order_dosage_qty_uom?: string;

  price_qty_ext_code?: string;
  tkt_qty_ext_code?: string;

  cred_price_adj_flag?: boolean;
  cred_cost_adj_flag?: boolean;

  order_qty?: number;
  cstmry_order_qty?: number;
  metric_order_qty?: number;

  order_qty_uom?: string;
  cstmry_order_qty_uom?: string;
  metric_order_qty_uom?: string;

  orig_order_qty?: number;
  cstmry_orig_order_qty?: number;
  metric_orig_order_qty?: number;

  delv_qty?: number;
  cstmry_delv_qty?: number;
  metric_delv_qty?: number;

  delv_qty_uom?: string;
  cstmry_delv_qty_uom?: string;
  metric_delv_qty_uom?: string;

  delv_to_date_qty?: number;
  cstmry_delv_to_date_qty?: number;
  metric_delv_to_date_qty?: number;

  rm_slump?: string;
  rm_slump_uom?: string;

  rm_mix_flag?: boolean;

  comment_text?: string;
  usage_code?: string;

  taxble_code?: number;
  non_tax_rsn_code?: string;

  invc_flag?: boolean;
  sep_invc_flag?: boolean;

  remove_rsn_code?: string;

  proj_line_num?: number;
  cust_line_num?: number;
  curr_load_num?: number;

  quote_code?: string;

  am_min_temp?: number;

  moved_order_date?: Date;
  moved_to_order_code?: string;
  moved_from_order_code?: string;

  invy_adjust_code?: string;
  sales_anl_adjust_code?: string;

  mix_design_user_name?: string;
  mix_design_update_date?: Date;

  qc_approvl_flag?: boolean;
  qc_approvl_date?: Date;

  batch_code?: string;
  chrg_cart_code?: string;

  cart_rate_amt?: number;

  quote_rev_num?: string;
  type_price?: string;

  matl_price?: number;

  mix_sent_to_lab_status?: string;
  lab_transfer_date?: Date;

  auth_user_name?: string;

  linked_prod_seq_num?: number;
  linked_prod_time_gap?: number;

  cart_cat?: string;

  additional_samples?: number;

  apply_to_contract?: boolean;

  contracted_samples?: number;

  exclude_from_sample_sched_rpt?: boolean;

  total_samples_to_take?: number;

  pct_hydrate?: number;

  pumped_indicator_code?: string;

  writeoff_qty?: number;
  writeoff_first_load_flag?: boolean;

  record_origin_code?: string;
  other_form_chng_code?: string;

  update_date?: Date;
  u_version?: string;

  cart_plant_codes?: string;
  cart_truck_types?: string;
  cart_rates?: string;

  sur_codes?: string;
  sur_rate_amts?: string;
  apply_sur_rate_hler_flags?: string;

  sundry_chrg_table_ids?: string;
  sundry_chrg_sep_invc_flags?: string;
  apply_sundry_chrg_flags?: string;

  lot_num_list?: string;

  // Relación con Ordr
  order?: Ordr;
}
