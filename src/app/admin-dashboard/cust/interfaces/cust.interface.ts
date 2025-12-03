export interface Cust {
  cust_code: string;
  name: string;
  sort_name?: string;

  // Direcciones
  addr_line_1?: string;
  addr_line_2?: string;
  addr_city?: string;
  addr_state?: string;
  addr_cntry?: string;
  addr_postcd?: string;

  // Contacto
  contct_name?: string;
  phone_num_1?: string;
  phone_num_2?: string;
  phone_num_3?: string;
  phone_num_4?: string;

  // Facturación
  invc_name?: string;
  invc_addr_line_1?: string;
  invc_addr_line_2?: string;
  invc_city?: string;
  invc_state?: string;
  invc_cntry?: string;
  invc_postcd?: string;

  // Estados y flags
  inactive_code?: string;
  inactive_date?: Date;
  u_version?: string;

  // Fechas
  setup_date?: Date;
  modified_date?: Date;
  update_date?: Date;

  // Otros campos importantes según tu lógica
  tax_code?: string;
  tax_id_code?: string;
  guid?: string;

  // Si quieres incluir arrays o campos largos tipo varchar(max)
  user_defined?: string;
  tax_exempt_id?: string;
}
