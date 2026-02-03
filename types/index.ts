export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

// utils/utils.js

export type Service = {
  value: string;
  label: string;
  unit_price: number;
  quantity: number;
};

export type Image = {
  label: string;
  url: string;
};

export type Quote = {
  uuid: string;
  contact_first_name: string;
  contact_last_name: string;
  contact_mobile: string;
  contact_landline: string;
  contact_email: string;
  preferred_contact_method: string;
  message: string;
  services: Service[];
  images: Image[];
  subtotal_amount: number;
  gst_amount: number;
  total_amount: number;
  status: string;
  expiry_end: Date;

  // NEW
  is_quote_sent_to_client: boolean;
  quote_sent_at: string | null;
};

export type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string,
  customerUuid?: null,
  recaptchaToken: string;
};

export type LoginPayload = {
  email: string;
  password: string;
  recaptchaToken: string;
};
