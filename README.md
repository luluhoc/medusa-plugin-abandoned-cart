# Medusa Abandoned Cart Plugin

## Still in beta proceed with caution

## v2.0.0 - Contains breaking changes. Please read the documentation carefully

You can now send emails with other providers and schedule the task to send emails.
Remember to run migrations after adding the plugin to the `medusa-config.js` file

This plugin adds abandoned cart functionality to Medusa. It allows you to send emails to customers who have abandoned their carts. The plugin uses SendGrid to send the emails. The plugin is written in Typescript.

I strongly recommend using this plugin in combination with the [Medusa Plugin SendGrid Typescript](https://github.com/luluhoc/medusa-plugin-sendgrid-typescript) to get type safety and autocompletion for the SendGrid API. You can also use the [Medusa Plugin SendGrid](https://medusajs.com)

## Image

![Abandoned Cart](https://github.com/luluhoc/medusa-plugin-abandoned-cart/blob/main/static/abandoned.jpg?raw=true)

[Medusa Website](https://medusajs.com) | [Medusa Repository](https://github.com/medusajs/medusa)

## Features

- Send emails to customers who have abandoned their carts manualy.
- Get a list of abandoned carts in Admin.
- Send emails with other provider (new)
- Send emails with scheduled task (new) cron job runs every 5 minutes.

---

## Prerequisites

- [Medusa backend](https://docs.medusajs.com/development/backend/install) 1.x (Not compatible yet with v2)

---

## How to Install

### 1\. Run the following command in the directory of the Medusa backend

  ```bash
  yarn add medusa-plugin-abandoned-cart
  ```

  ```bash
  npm install medusa-plugin-abandoned-cart
  ```

### 2\. Set the following environment variable in `.env`

  ```bash
  SENDGRID_API_KEY=<API_KEY>
  SENDGRID_FROM=<SEND_FROM_EMAIL>
  # IDs for different email templates
  SENDGRID_ABANDONED_CART_TEMPLATE=<ORDER_PLACED_TEMPLATE_ID> # example
  ```

### 3\. In `medusa-config.js` add the following at the end of the `plugins` array

  ```ts
const plugins = [
  // ...,
  {
    resolve: `medusa-plugin-abandoned-cart`,
    /** @type {import('medusa-plugin-abandoned-cart').PluginOptions} */
    options: {
      sendgridEnabled: true,
      from: process.env.SENDGRID_FROM,
      enableUI: true,
      subject: "You have something in your cart",
      templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE,
      days_to_track: 7,
      set_as_completed_if_overdue: true,
      max_overdue: "2h",
      localization: {
        fr: {
          subject: "Vous avez quelque chose dans votre panier",
          templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE_FR,
        },
        pl: {
          subject: "Masz coś w koszyku",
          templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE_PL,
        },
        en: {
          subject: "You have something in your cart",
          templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE,
        },
      },
      intervals: [
        {
          interval: "1h",
          subject: "You have something in your cart",
          templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE,
          localization: {
            fr: {
              subject: "Vous avez quelque chose dans votre panier",
              templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE_FR,
            },
            pl: {
              subject: "Masz coś w koszyku",
              templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE_PL,
            },
            en: {
              subject: "You have something in your cart",
              templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE,
            },
          },
        },
        {
          interval: "1d",
          subject: "You have something in your cart",
          templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE,
          localization: {
            fr: {
              subject: "Vous avez quelque chose dans votre panier",
              templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE_FR,
            },
            pl: {
              subject: "Masz coś w koszyku",
              templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE_PL,
            },
            en: {
              subject: "You have something in your cart",
              templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE,
            },
          },
        },
        {
          interval: "5d",
          subject: "You have something in your cart",
          templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE,
          localization: {
            fr: {
              subject: "Vous avez quelque chose dans votre panier",
              templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE_FR,
            },
            pl: {
              subject: "Masz coś w koszyku",
              templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE_PL,
            },
            en: {
              subject: "You have something in your cart",
              templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE,
            },
          },
        },
      ],
    },
  },
];
  ```

  ```ts
  export interface BasePluginOptions {
  /* enable sendgrid */
  sendgridEnabled: boolean
  /* email from which you will be sending */
  from: { name?: string; email: string } | string
  /* template id from sendgrid */
  templateId: string
  /* header line of the email optional */
  header?: string
  /* number of days to track */
  days_to_track?: number
  /* subject of the email optional */
  subject?: string
  localization?: {
    [key: string]: {
      subject?: string
      header?: string
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
      header?: string
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
      header?: string
      templateId: string
    };
  }
}
  ```

  Remember to run migrations after adding the plugin to the `medusa-config.js` file

### 4\. The Sendgrid Template receives the following

 ```ts
export type NewLineItem = Omit<LineItem, "beforeUpdate" | "afterUpdateOrLoad"> & {
  // human readable price with currency code
  price: string
}

// The cart object is transformed to this format before sending the email
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
 ```

### 5\. When an abandoned cart email is sent, the plugin emits the `cart.send-abandoned-email` event

You can listen to this event in your plugin to perform additional actions with your custom notification provider or perform extra actions when using Sendgrid.

- The Event is sent one time when the button is pressed in the Admin UI.

- The Event gets the following payload:

```ts
{
  id: string; // cart id
}

```

Check medusa docs <https://docs.medusajs.com/development/events/create-subscriber>

#### Example

```ts
import { 
  ProductService,
  type SubscriberConfig, 
  type SubscriberArgs, 
} from "@medusajs/medusa"
import { EntityManager } from "typeorm";
import { MedusaError } from 'medusa-core-utils';
import { TransformedCart } from "medusa-abandoned-cart-plugin";
import SendGridService from "medusa-plugin-sendgrid-typescript/dist/services/sendgrid";

export default async function abandonedEmailHandler({ 
  data, eventName, container, pluginOptions, 
}: SubscriberArgs<Record<string, any>>) {
  const manager: EntityManager = container.resolve("manager")
  const cartRepo = manager.getRepository(Cart)
  const abandonedCartService: AbandonedCartService = container.resolve("abandonedCartService")
  const sendGridService: SendGridService = container.resolve("sendGridService")

  const { id, interval } = data

  const notNullCartsPromise = await cartRepo.findOne({
    where: {
      id,
    },
    order: {
      created_at: "DESC",
    },
    select: ["id", "email", "created_at", "region", "context", "abandoned_count"],
    relations: ["items", "region", "shipping_address"],
  })

  if (!notNullCartsPromise) {
    throw new MedusaError("Not Found", "Cart not found")
  }
  // do something with the cart...

  // Transform the cart to the format needed for the email template this is mandatory depending on email template and provider
  const cart = abandonedCartService.transformCart(notNullCartsPromise) as TransformedCart

  const emailData = {
    to: cart.email,
    from: this.options_.from,
    templateId: "d-1234567890abcdef",
    dynamic_template_data: {
      ...cart,
    },
  }

  // Send email using sendgrid
  const sendGridPromise = this.sendGridService.sendEmail(emailData)

  // Update the cart to reflect that the email has been sent
  const repoPromise = cartRepo.update(cart.id, {
        abandoned_lastdate: new Date().toISOString(),
        abandoned_count: (notNullCartsPromise?.abandoned_count || 0) + 1,
        abandoned_last_interval: interval || undefined,
        abandoned_completed_at: interval && pluginOptions.intervals[pluginOptions.intervals.length - 1].interval === interval ? new Date().toISOString() : undefined,
      });

  await Promise.all([sendGridPromise, repoPromise])
  
}

export const config: SubscriberConfig = {
  event: "cart.send-abandoned-email",
  context: {
    subscriberId: "abandoned-email-handler",
  },
}

```
