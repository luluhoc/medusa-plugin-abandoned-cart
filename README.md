# Medusa Abandoned Cart Plugin

## Still in beta proceed with caution

## 2.0.0 - Contains breaking changes. Please read the documentation carefully

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

- [Medusa backend](https://docs.medusajs.com/development/backend/install)

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
      intervals: [
      {
        interval: "1h",
        subject: "You have something in your cart",
        templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE,
        localization: {
          "fr": {
            subject: "Vous avez quelque chose dans votre panier",
            templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE_FR,
          },
          "pl": {
            subject: "Masz coś w koszyku",
            templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE_PL,
          },
          "en": {
            subject: "You have something in your cart",
            templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE,
          },
        }
      },
      {
        interval: "1d",
        subject: "You have something in your cart",
        templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE,
        localization: {
          "fr": {
            subject: "Vous avez quelque chose dans votre panier",
            templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE_FR,
          },
          "pl": {
            subject: "Masz coś w koszyku",
            templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE_PL,
          },
          "en": {
            subject: "You have something in your cart",
            templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE,
          },
        }
      },
      {
        interval: "5d",
        subject: "You have something in your cart",
        templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE,
        localization: {
          "fr": {
            subject: "Vous avez quelque chose dans votre panier",
            templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE_FR,
          },
          "pl": {
            subject: "Masz coś w koszyku",
            templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE_PL,
          },
          "en": {
            subject: "You have something in your cart",
            templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE,
          },
        }
      },
    ]
    },
  },
  ]
  ```

  ```ts
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
  ```

  Remember to run migrations after adding the plugin to the `medusa-config.js` file

### 4\. The Sendgrid Template receives the following

 ```ts
interface TransformedCart {
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
