export type Role = "admin" | "manager" | "foreman";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
}

export interface RoleAssignment {
  user_id: string;
  role: Role;
}

export interface Client {
  id: string;
  name: string;
  tax_id: string | null;
  created_at: string;
  client_type?: string | null;
  contact_person?: string | null;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
}

export interface ClientAddress {
  id: string;
  client_id: string;
  type: string | null;
  street: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
}

/** Payload for creating a client. DB may use company_name instead of name. */
export interface ClientCreatePayload {
  name: string;
  tax_id?: string | null;
  client_type?: "company" | "individual" | null;
  contact_person?: string | null;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
}

/** Payload for creating a client address. */
export interface ClientAddressCreatePayload {
  type?: string | null;
  street?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country?: string | null;
}

export interface OrderListItem {
  id: string;
  order_number: string;
  client_name: string;
  status: string;
  created_at: string;
  due_date: string | null;
  total_items?: number | null;
}

export interface ProductionQueueItem {
  id: string;
  order_id: string;
  order_number: string;
  task_type: string;
  status: string;
  planned_start: string | null;
  planned_end: string | null;
}

export interface LabelToPrint {
  id: string;
  production_task_id: string;
  order_number: string;
  label_number: string;
  status: string;
}

export interface WarehouseDocumentListItem {
  id: string;
  document_number: string;
  document_type: string;
  client_name: string | null;
  issue_date: string;
  status: string;
}

export interface OrderAttachment {
  id: string;
  order_id: string;
  file_name: string;
  file_type: string | null;
  created_at: string;
}

/** Payload for creating an order header. */
export interface OrderCreatePayload {
  client_id: string;
  order_number?: string | null;
  order_date?: string | null;
  due_date?: string | null;
  status?: string;
  notes?: string | null;
}

/** Payload for creating an order item. */
export interface OrderItemCreatePayload {
  description: string;
  quantity: number;
  product_type?: string | null;
  width?: number | null;
  height?: number | null;
  length?: number | null;
  color?: string | null;
  material?: string | null;
  notes_tech?: string | null;
}

/** Data for WZ document template. */
export interface WzTemplateData {
  document_number: string;
  client_name: string;
  address: string;
  issue_date: string;
  items: { name: string; quantity: number; unit?: string }[];
  notes?: string | null;
}

/** Data for production label/sticker template. */
export interface LabelTemplateData {
  order_number: string;
  client_name: string;
  product_type: string;
  dimensions: string;
  color: string;
  quantity: number;
  status?: string | null;
}

