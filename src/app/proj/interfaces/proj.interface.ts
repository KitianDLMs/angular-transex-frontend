export interface Proj {
  cust_code?: string;

  proj_code: string;

  proj_name: string;
  sort_name: string;

  ship_cust_code: string;
  ref_cust_code: string;

  po: string;
  cust_job_num: string;

  est_qty: number;
  est_qty_uom: string;

  est_trvl: number;

  contct_name: string;

  phone_num_1: string;
  phone_num_2: string;
  phone_num_3: string;
  phone_num_4: string;

  setup_date: string;
  expir_date: string;

  invc_name: string;
  invc_addr_line_1: string;
  invc_addr_line_2: string;
  invc_city: string;
  invc_state: string;
  invc_cntry: string;
  invc_postcd: string;

  stmnt_name: string;
  stmnt_addr_line_1: string;
  stmnt_addr_line_2: string;
  stmnt_city: string;
  stmnt_state: string;
  stmnt_cntry: string;
  stmnt_postcd: string;

  ship_name: string;
  ship_addr_line_1: string;
  ship_addr_line_2: string;
  ship_city: string;
  ship_state: string;
  ship_cntry: string;
  ship_postcd: string;

  ca_sales_anl_code: string;
  cb_sales_anl_code: string;
  cc_sales_anl_code: string;
  cd_sales_anl_code: string;

  ca_slsmn_empl_code: string;
  cb_slsmn_empl_code: string;
  cc_slsmn_empl_code: string;
  cd_slsmn_empl_code: string;

  tax_code: string;
  taxble_code: number;
  non_tax_rsn_code: string;

  ca_price_cat: string;
  cb_price_cat: string;
  cc_price_cat: string;
  cd_price_cat: string;

  ca_price_plant_code: string;
  cb_price_plant_code: string;
  cc_price_plant_code: string;
  cd_price_plant_code: string;

  ca_trade_disc_pct: number;
  cb_trade_disc_pct: number;
  cc_trade_disc_pct: number;
  cd_trade_disc_pct: number;

  ca_trade_disc_amt: number;
  cb_trade_disc_amt: number;
  cc_trade_disc_amt: number;
  cd_trade_disc_amt: number;

  ca_trade_disc_amt_uom: string;
  cb_trade_disc_amt_uom: string;
  cc_trade_disc_amt_uom: string;
  cd_trade_disc_amt_uom: string;

  ca_terms_code: string;
  cb_terms_code: string;
  cc_terms_code: string;
  cd_terms_code: string;

  ca_cart_code: string;
  cb_cart_code: string;
  cc_cart_code: string;
  cd_cart_code: string;

  ca_cart_rate: number;
  cb_cart_rate: number;
  cc_cart_rate: number;
  cd_cart_rate: number;

  ca_apply_min_haul_flag: boolean;
  cb_apply_min_haul_flag: boolean;
  cc_apply_min_haul_flag: boolean;
  cd_apply_min_haul_flag: boolean;

  ca_apply_zone_chrg_flag: boolean;
  cb_apply_zone_chrg_flag: boolean;
  cc_apply_zone_chrg_flag: boolean;
  cd_apply_zone_chrg_flag: boolean;

  ca_zone_code: string;
  cb_zone_code: string;
  cc_zone_code: string;
  cd_zone_code: string;

  ca_apply_min_load_chrg_flag: boolean;
  cb_apply_min_load_chrg_flag: boolean;
  cc_apply_min_load_chrg_flag: boolean;
  cd_apply_min_load_chrg_flag: boolean;

  ca_min_load_chrg_table_id: string;
  cb_min_load_chrg_table_id: string;
  cc_min_load_chrg_table_id: string;
  cd_min_load_chrg_table_id: string;

  ca_apply_excess_unld_chrg_flag: boolean;
  cb_apply_excess_unld_chrg_flag: boolean;
  cc_apply_excess_unld_chrg_flag: boolean;
  cd_apply_excess_unld_chrg_flag: boolean;

  ca_excess_unld_chrg_table_id: string;
  cb_excess_unld_chrg_table_id: string;
  cc_excess_unld_chrg_table_id: string;
  cd_excess_unld_chrg_table_id: string;

  ca_apply_season_chrg_flag: boolean;
  cb_apply_season_chrg_flag: boolean;
  cc_apply_season_chrg_flag: boolean;
  cd_apply_season_chrg_flag: boolean;

  ca_season_chrg_table_id: string;
  cb_season_chrg_table_id: string;
  cc_season_chrg_table_id: string;
  cd_season_chrg_table_id: string;

  ca_apply_sundry_chrg_flag: boolean;
  cb_apply_sundry_chrg_flag: boolean;
  cc_apply_sundry_chrg_flag: boolean;
  cd_apply_sundry_chrg_flag: boolean;

  ca_min_load_sep_invc_flag: boolean;
  cb_min_load_sep_invc_flag: boolean;
  cc_min_load_sep_invc_flag: boolean;
  cd_min_load_sep_invc_flag: boolean;

  ca_excess_unld_sep_invc_flag: boolean;
  cb_excess_unld_sep_invc_flag: boolean;
  cc_excess_unld_sep_invc_flag: boolean;
  cd_excess_unld_sep_invc_flag: boolean;

  ca_season_sep_invc_flag: boolean;
  cb_season_sep_invc_flag: boolean;
  cc_season_sep_invc_flag: boolean;
  cd_season_sep_invc_flag: boolean;

  ca_auto_sundry_sep_invc_flag: boolean;
  cb_auto_sundry_sep_invc_flag: boolean;
  cc_auto_sundry_sep_invc_flag: boolean;
  cd_auto_sundry_sep_invc_flag: boolean;

  ca_apply_cart_rate_hler_flag: boolean;
  cb_apply_cart_rate_hler_flag: boolean;
  cc_apply_cart_rate_hler_flag: boolean;
  cd_apply_cart_rate_hler_flag: boolean;

  ca_apply_sur_rate_hler_flag: boolean;
  cb_apply_sur_rate_hler_flag: boolean;
  cc_apply_sur_rate_hler_flag: boolean;
  cd_apply_sur_rate_hler_flag: boolean;

  ca_force_price_uom_flag: boolean;
  cb_force_price_uom_flag: boolean;
  cc_force_price_uom_flag: boolean;
  cd_force_price_uom_flag: boolean;

  ca_print_tkt_prices_flag: boolean;
  cb_print_tkt_prices_flag: boolean;
  cc_print_tkt_prices_flag: boolean;
  cd_print_tkt_prices_flag: boolean;

  ca_restrict_quoted_prod_flag: boolean;
  cb_restrict_quoted_prod_flag: boolean;
  cc_restrict_quoted_prod_flag: boolean;
  cd_restrict_quoted_prod_flag: boolean;

  ca_hler_code: string;
  cb_hler_code: string;
  cc_hler_code: string;
  cd_hler_code: string;

  allow_price_adjust_flag: boolean;

  map_page: string;
  proj_type: string;
  proj_stage: string;

  ca_print_mix_wgts_flag: boolean;
  cb_print_mix_wgts_flag: boolean;
  cc_print_mix_wgts_flag: boolean;
  cd_print_mix_wgts_flag: boolean;

  ca_sched_plant_code: string;
  cb_sched_plant_code: string;
  cc_sched_plant_code: string;
  cd_sched_plant_code: string;

  ca_truck_type: string;
  cb_truck_type: string;
  cc_truck_type: string;
  cd_truck_type: string;

  ca_delv_meth_code: string;
  cb_delv_meth_code: string;
  cc_delv_meth_code: string;
  cd_delv_meth_code: string;

  ca_track_order_color: number;
  cb_track_order_color: number;
  cc_track_order_color: number;
  cd_track_order_color: number;

  cred_code: string;
  cred_chng_date: string;

  po_req_flag: boolean;
  lot_block_flag: boolean;

  acct_cat_code: string;
  cred_limtn_code: string;

  prepay_pct: number;

  cred_card_name: string;
  cred_card_num: string;
  cred_card_expir_date: string;
  cred_card_resp_name: string;

  invc_grouping_code: string;
  invc_sub_grouping_code: string;
  invc_det_sum_code: string;
  invc_freq_code: string;

  invc_copies: number;
  invc_single_mult_day_code: string;

  invc_comb_haul_flag: boolean;
  invc_show_min_haul_flag: boolean;
  invc_sep_by_prod_line_flag: boolean;

  metric_cstmry_code: string;

  map_long: string;
  map_lat: string;
  map_radius: number;

  intrnl_line_num: number;

  quote_flag: boolean;
  quote_code: string;
  job_id: string;

  dataout_date: string;

  sampling_lab_code: string;
  sampling_interval: number;
  sampling_interval_uom: string;

  restrict_ordr_by_estqty_code: string;
  max_load_size: number;
  mobileticket_code: string;
  trav_restrict_code: string;

  guid: string;

  project_status: string;
  edx_synch_status_code: string;
  inactive_code: string;
  inactive_date: string;

  use_for_prod_line_code: string;
  update_date: string;
  u_version: string;

  delv_addr: string;
  instr: string;
  tax_exempt_id: string;
  user_defined: string;

  ca_order_sur_codes: string;
  cb_order_sur_codes: string;
  cc_order_sur_codes: string;
  cd_order_sur_codes: string;

  ca_order_sur_rates: string;
  cb_order_sur_rates: string;
  cc_order_sur_rates: string;
  cd_order_sur_rates: string;

  ca_sundry_chrg_table_ids: string;
  cb_sundry_chrg_table_ids: string;
  cc_sundry_chrg_table_ids: string;
  cd_sundry_chrg_table_ids: string;

  ca_sundry_chrg_sep_invc_flags: string;
  cb_sundry_chrg_sep_invc_flags: string;
  cc_sundry_chrg_sep_invc_flags: string;
  cd_sundry_chrg_sep_invc_flags: string;

  // Relaciones (si las quieres)
  customer?: any;
  projectDetails?: any[];
  user?: any;
}
