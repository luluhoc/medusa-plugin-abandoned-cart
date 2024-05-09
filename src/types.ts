import { LineItem } from "@medusajs/medusa";

export interface BasePluginOptions {
  /* enable sendgrid */
  sendgridEnabled: boolean
  /* email from which you will be sending */
  from: string
  /* template id from sendgrid */
  templateId: string
  /* number of days to track */
  days_to_track?: number
  /* subject of the email optional */
  subject?: string
  localization?: {
    [key: string]: {
      subject?: string
      templateId: string
    };
  }
}

export interface IntervalOptions {
  /* interval example string "1d", "1h", "30m" 
  check parse-duration package for more examples */
  interval: string | number
  /* subject of the email optional */
  subject?: string
  /* template id from sendgrid */
  templateId?: string
  localization?: {
    [key: string]: {
      subject?: string
      templateId: string
    };
  }

}

export interface AutomatedAbandonedCart extends BasePluginOptions {
  /* intervals */
  intervals: Array<IntervalOptions>,
  /* max overdue @default "2h"*/
  max_overdue: string
  /* set as completed if overdue */
  set_as_completed_if_overdue: boolean
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


export type NewLineItem = Omit<LineItem, "beforeUpdate" | "afterUpdateOrLoad"> & {
  price: string
}

export interface TransformedCart {
  id: string;
  email: string;
  items: NewLineItem[];
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
  abandoned_last_interval?: number;
  abandoned_completed_at?: Date;
}