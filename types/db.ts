// File: /types/db.ts
// Types based directly on your Postgres tables + your "expanded" API responses.
// Notes:
// - uuid columns are TEXT in DB (you use 9-char public UUIDs).
// - numeric(14,2) comes back as number OR string depending on your Supabase config.
//   To be safe, use Money = number | string | null.
// - jsonb fields are unknown unless you want to fully type them.

export type UUID = string;
export type ISODateTime = string; // timestamp with time zone (ISO string)
export type ISODate = string; // date (YYYY-MM-DD)
export type Money = number | string | null;

/** ---------------- Enums (DB domain types) ----------------
 * Replace these string unions with your actual enum values if you want them strict.
 * If you already export these from somewhere, import them instead.
 */
export type QuoteStatus = string; // public.quote_status
export type JobStatus = string; // public.job_status
export type JobOccurrenceStatus = string; // public.job_occurrence_status
export type ContactMethod = string; // public.contact_method
export type RecurrenceFrequency = string | null; // public.recurrence_frequency
export type CustomerType = string | null; // public.customer_type
export type CustomerCreatedVia = string; // public.customer_created_via

/** ---------------- Common JSON shapes ---------------- */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [k: string]: JsonValue }
  | JsonValue[];

export type ServicesJson = JsonValue; // jobs.services, quotes.services (jsonb array)
export type ImagesJson = JsonValue; // quotes.images, jobs.job_images (jsonb array)

/** =====================================================================
 *  DB Row Types (1:1 with tables)
 *  ===================================================================== */

export type QuoteRow = {
  id: number;
  uuid: UUID;

  customer_uuid: UUID | null;

  services: ServicesJson; // jsonb
  images: ImagesJson; // jsonb

  total_amount: Money;
  subtotal_amount: Money;
  gst_amount: Money;

  status: QuoteStatus;
  previous_status: QuoteStatus | null;

  created_at: ISODateTime | null;
  updated_at: ISODateTime | null;
  deleted_at: ISODateTime | null;

  expiry_start: ISODateTime;
  expiry_end: ISODateTime;

  is_deleted: boolean;
  is_expired: boolean;
  is_active: boolean;

  contact_first_name: string | null;
  contact_last_name: string | null;
  contact_email: string | null;
  contact_mobile: string | null;
  contact_landline: string | null;

  message: string | null;
  preferred_contact_method: ContactMethod | null;

  is_quote_sent_to_client: boolean | null;
  quote_sent_at: ISODateTime | null;
  responded_at: ISODateTime | null;

  address: string | null;

  sent_by_user_uuid: UUID | null;
  sent_message_to_client: string | null;

  finalized_at: ISODateTime | null;
  quote_pdf_url: string | null;
  quote_pdf_version: number;
  quote_version_reason: string | null;

  employer_message: string | null;
  stale_at: ISODateTime | null;
};

export type JobRow = {
  id: number;
  uuid: UUID;

  customer_uuid: UUID; // NOT NULL in DB
  quote_uuid: UUID; // NOT NULL in DB (but FK says on delete set null; DB column is not null; keep as UUID here)

  services: ServicesJson; // jsonb
  job_images: ImagesJson; // jsonb

  total_amount: Money;
  subtotal_amount: Money;
  gst_amount: Money;

  scheduled_at: ISODateTime | null;
  status: JobStatus | null; // default 'pending' but nullable in schema
  previous_status: JobStatus | null;

  created_at: ISODateTime | null;
  updated_at: ISODateTime | null;
  deleted_at: ISODateTime | null;

  completed_date: ISODateTime | null;
  is_completed: boolean;

  is_deleted: boolean;

  is_recurring: boolean;
  recurrence_interval: number | null;
  recurrence_end_date: ISODate | null;
  recurrence_frequency: RecurrenceFrequency;

  job_address: string | null;
};

export type JobRecurrenceRow = {
  id: number;
  job_uuid: UUID;

  scheduled_at: ISODateTime;
  status: JobOccurrenceStatus;

  is_completed: boolean;
  completed_date: ISODateTime | null;

  deleted_at: ISODateTime | null;
  is_deleted: boolean;

  previous_status: JobOccurrenceStatus | null;
  updated_at: ISODateTime | null;
};

export type CustomerRow = {
  id: number;
  uuid: UUID;

  first_name: string;
  last_name: string | null;

  landline_phone: string | null;
  mobile_phone: string | null;

  email: string | null;
  address: string | null;

  customer_type: CustomerType;

  created_at: ISODateTime | null;
  updated_at: ISODateTime | null;
  deleted_at: ISODateTime | null;

  is_deleted: boolean;

  created_by_uuid: UUID | null;
  created_via: CustomerCreatedVia;
};

/** =====================================================================
 *  Expanded API Types (what your pages want)
 *
 *  You said:
 *  - customer should return quotes, jobs, and job recurrences (nested under jobs)
 *  - quote should return quote, jobs, and job recurrences (nested under jobs)
 *  - job should return job recurrences
 *  ===================================================================== */

/** Job with its recurrences (and optionally nested quote/customer if you want later) */
export type JobWithRecurrences = JobRow & {
  job_recurrences?: JobRecurrenceRow[];
};

/** Quote including its linked job (you enforce unique_job_per_quote) */
export type QuoteWithJob = QuoteRow & {
  // In your DB you enforce one job per quote, but returning an array is fine for future-proofing
  jobs?: JobWithRecurrences[];
};

/** Customer including their quotes + jobs (and each job includes recurrences) */
export type CustomerWithEverything = CustomerRow & {
  quotes?: QuoteWithJob[];
  jobs?: JobWithRecurrences[];
};

/** =====================================================================
 *  API response wrappers (optional but nice)
 *  ===================================================================== */

export type QuoteApiResponse = { quote: QuoteWithJob };
export type JobApiResponse = { job: JobWithRecurrences };
export type CustomerApiResponse = { customer: CustomerWithEverything };

/** Quick find can return any one of these */
export type QuickFindResult =
  | { type: "quote"; result: QuoteWithJob }
  | { type: "job"; result: JobWithRecurrences }
  | { type: "customer"; result: CustomerWithEverything };