import { LineItem } from "@medusajs/medusa";

export interface BasePluginOptions {
  /* enable sendgrid */
  sendgridEnabled: boolean
  /* email from which you will be sending */
  from: string
  /* template id from sendgrid */
  templateId: string
  /* subject of the email optional */
  subject?: string
}

export interface IntervalOptions {
  interval: string | number
  subject?: string
  templateId?: string
  localization?: {
    [key: string]: {
      subject?: string
      templateId: string
    };
  }

}

export interface AutomatedAbandonedCart extends BasePluginOptions {
  intervals?: Array<IntervalOptions>,
}

export interface ManualAbandonedCart extends BasePluginOptions {
  localization: {
    [key: string]: {
      subject?: string
      templateId: string
    };
  }
}

export type PluginOptions = AutomatedAbandonedCart | ManualAbandonedCart


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
  abandoned_count?: number;
  abandoned_lastdate?: Date;
  abandoned_last_interval?: string;
  abandoned_completed_at?: Date;
}