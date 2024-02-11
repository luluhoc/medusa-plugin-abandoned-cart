# Medusa Abandoned Cart Plugin

This plugin adds abandoned cart functionality to Medusa. It allows you to send emails to customers who have abandoned their carts. The plugin uses SendGrid to send the emails. The plugin is written in Typescript.

I strongly recommend using this plugin in combination with the [Medusa Plugin SendGrid Typescript](https://github.com/luluhoc/medusa-plugin-sendgrid-typescript) to get type safety and autocompletion for the SendGrid API. You can also use the [Medusa Plugin SendGrid](https://medusajs.com)

[Medusa Website](https://medusajs.com) | [Medusa Repository](https://github.com/medusajs/medusa)

## Features

- Send emails to customers who have abandoned their carts.
- Get a list of abandoned carts in Admin.

---

## Prerequisites

- [Medusa backend](https://docs.medusajs.com/development/backend/install)

---

## How to Install

1\. Run the following command in the directory of the Medusa backend:

  ```bash
  yarn add medusa-plugin-abandoned-cart
  ```

  ```bash
  npm install medusa-plugin-abandoned-cart
  ```

2\. Set the following environment variable in `.env`:

  ```bash
  SENDGRID_API_KEY=<API_KEY>
  SENDGRID_FROM=<SEND_FROM_EMAIL>
  # IDs for different email templates
  SENDGRID_ABANDONED_CART_TEMPLATE=<ORDER_PLACED_TEMPLATE_ID> # example
  ```

3\. In `medusa-config.js` add the following at the end of the `plugins` array:

  ```ts
  const plugins = [
    // ...,
    {
      resolve: `medusa-plugin-abandoned-cart`,
      /** @type {import('medusa-plugin-abandoned-cart').PluginOptions} */
      options: {
        from: process.env.SENDGRID_FROM,
        subject: "You have something in your cart", // optional
        templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE,
        enableUI: true,
        localization: {
          "de-DE": {
            subject: "Sie haben etwas in Ihrem Warenkorb gelassen",
            templateId: process.env.SENDGRID_ABANDONED_CART_DE_TEMPLATE,
          },
        },
      },
    },
  ]
  ```

 4\. The Sendgrid Template receives the following:

 ```ts
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
}
 ```
