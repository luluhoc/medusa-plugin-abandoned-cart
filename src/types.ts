import { LineItem } from "@medusajs/medusa";

export interface PluginOptions {
  /* enable sendgrid */
  sendgridEnabled: boolean
  /* email from which you will be sending */
  from: string
  /* template id from sendgrid */
  templateId: string
  /* subject of the email optional */
  subject?: string

  /** locale as key example de-DE */
  localization: {
    [key: string]: {
      subject?: string
      templateId: string
    };
  }
}

export interface TransformedCart {
  id: string;
  email: string;
  items: LineItem[];
  cart_context: Record<string, unknown>;
  first_name: string;
  last_name: string;
  totalPrice: number;
  created_at: Date;
  currency: string;
  region: string;
  country_code: string;
  region_name: string;
  abandoned_cart_notification_date?: string | null
  abandoned_cart_notification_sent?: boolean | null
  abandoned_cart_notification_count?: number | null
}