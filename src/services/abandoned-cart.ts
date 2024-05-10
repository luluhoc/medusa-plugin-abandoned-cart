import {
  Cart,
  EventBusService,
  Logger,
  TransactionBaseService,
} from "@medusajs/medusa";
import { Lifetime } from "awilix";
import CartRepository from "@medusajs/medusa/dist/repositories/cart";
import { MedusaError, humanizeAmount, zeroDecimalCurrencies } from "medusa-core-utils";
import type SendGridService from "medusa-plugin-sendgrid-typescript/dist/services/sendgrid";

import {
  AutomatedAbandonedCart,
  IntervalOptions,
  PluginOptions,
  TransformedCart,
} from "../types";
import parse from 'parse-duration'

export default class AbandonedCartService extends TransactionBaseService {
  static LIFE_TIME = Lifetime.SCOPED;
  protected cartRepository: typeof CartRepository;
  protected sendGridService: SendGridService | undefined;
  protected eventBusService: EventBusService | undefined;
  logger: Logger;
  options_: PluginOptions;

  constructor(container, options: PluginOptions) {
    super(container);
    this.cartRepository = container.cartRepository;
    try {
      this.sendGridService = container?.sendgridService;
    } catch (e) {
      this.sendGridService = undefined;
    }

    try {
      this.eventBusService = container?.eventBusService;
    } catch (e) {
      this.eventBusService = undefined;
    }
    let op = options as AutomatedAbandonedCart
    let sorted: IntervalOptions[] = [];
    this.checkTypeOfOptions(options) && (sorted = op.intervals.sort((
      a,
      b,
    ) => {
      if (typeof a.interval === 'string' && typeof b.interval === 'string') {
      return parse(a.interval) - parse(b.interval);
      } else if (typeof a.interval === 'number' && typeof b.interval === 'number') {
        return a.interval - b.interval;
      }
    }))

    if (this.checkTypeOfOptions(options) && op.intervals && sorted.length > 0) {
      op = {
        ...op,
        intervals: sorted.map((i) => {
          return {
            ...i,
            interval: typeof i.interval === 'string' ? parse(i.interval) : i.interval
          }
        })
      }
    }
   
    this.logger = container.logger;
    this.options_ =  this.checkTypeOfOptions(options) ? op : options;
  }

  getCartLocale(cart: TransformedCart): string {
    return (cart?.cart_context?.locale as string) || "en";
  }

  async sendAbandonedCartEmail(id: string, interval?: number) {
    if (!this.options_.sendgridEnabled || !this.sendGridService) {
      this.logger.info("SendGrid is not enabled, emitting event")
      await this.eventBusService.emit("cart.send-abandoned-email", {
        id,
        interval,
      });
      return {
        success: true,
        message: "Event emitted, but SendGrid is not enabled.",
      };
    }

    try {
      const cartRepo = this.activeManager_.withRepository(this.cartRepository);
      const notNullCartsPromise = await cartRepo.findOne({
        where: {
          id,
        },
        order: {
          created_at: "DESC",
        },
        select: [
          "id",
          "email",
          "created_at",
          "region",
          "context",
          "abandoned_count",
        ],
        relations: ["items", "region", "shipping_address"],
      });

      let templateId = this.options_?.templateId;
      let subject = this.options_?.subject;
      let header = this.options_?.header;

      if (!notNullCartsPromise) {
        throw new MedusaError("Not Found", "Cart not found");
      }

      const cart = this.transformCart(notNullCartsPromise) as TransformedCart;
      
      const locale = this.getCartLocale(cart);

      if (
        (!this.checkTypeOfOptions(this.options_) && interval) &&
        this.options_.localization
      ) {
        const localeOptions = this.options_.localization[locale];

        if (localeOptions) {
          templateId = localeOptions.templateId;
          subject = localeOptions.subject ?? subject;
          header = localeOptions.header ?? header;
        }
      } else if (this.checkTypeOfOptions(this.options_) && interval !== undefined) {
        const intervalOptions = this.options_.intervals.find(
          (i) => i.interval === interval,
        );

        if (intervalOptions) {
          templateId = intervalOptions.templateId;
          subject = intervalOptions.subject ?? subject;
          header = intervalOptions.header ?? header;

          if (intervalOptions.localization) {
            const localeOptions = intervalOptions.localization[locale];

            if (localeOptions) {
              templateId = localeOptions.templateId;
              subject = localeOptions.subject ?? subject;
              header = localeOptions.header ?? header;
            }
          }
        }
      }

      if (!this.options_.from) {
        throw new MedusaError("Invalid", "From is required");
      }

      if (!templateId) {
        throw new MedusaError("Invalid", "TemplateId is required");
      }

      const emailData = {
        to: cart.email,
        from: this.options_.from,
        templateId: templateId,
        dynamic_template_data: {
          ...cart,
          subject: subject ?? "You left something in your cart",
          header: header ?? "Still thinking about it?",
        },
      };

      const emailPromise = this.sendGridService.sendEmail(emailData);
      // const emailPromise = Promise.resolve({});

      const cartPromise = cartRepo.update(cart.id, {
        abandoned_lastdate: new Date().toISOString(),
        abandoned_count: (notNullCartsPromise?.abandoned_count || 0) + 1,
        abandoned_last_interval: interval || undefined,
        abandoned_completed_at: this.checkTypeOfOptions(this.options_) && this.options_.intervals[this.options_.intervals.length - 1].interval === interval ? new Date().toISOString() : undefined,
      });

      const eventPromise = this.eventBusService.emit("cart.send-abandoned-email", {
        id,
        interval,
      });
      this.logger.info(`Sending email for cart ${id}`);
      await Promise.all([emailPromise, cartPromise, eventPromise]);
      
      return {
        success: true,
        message: "Email sent",
      };
    } catch (error) {
      this.logger.error("Error sending abandoned cart email", {
        error,
      });
      return {
        success: false,
        message: "Error sending email",
      };
    }
  }

  checkTypeOfOptions = (
    options: PluginOptions,
  ): options is AutomatedAbandonedCart => {
    return (options as AutomatedAbandonedCart).intervals !== undefined;
  };

  humanPrice_(amount: number | null | undefined, currency: string) {
    if (!amount) {
      return "0.00"
    }

    const normalized = humanizeAmount(amount, currency)
    return normalized.toFixed(
      zeroDecimalCurrencies.includes(currency.toLowerCase()) ? 0 : 2
    )
  }

  queryBuilder = (
    type: "getCount" | "getMany",
    take: number,
    skip: number,
    dateLimit?: number,
    fromAdmin?: boolean,
  ): Promise<Cart[]> | Promise<Number> => {
    const cartRepo = this.activeManager_.withRepository(this.cartRepository);
    return cartRepo
      .createQueryBuilder("cart")
      .leftJoinAndSelect("cart.items", "items")
      .leftJoinAndSelect("cart.region", "region")
      .leftJoinAndSelect("cart.shipping_address", "shipping_address")
      .where("cart.email IS NOT NULL")
      .andWhere("cart.email NOT LIKE :emailPattern", {
        emailPattern: "%storebotmail%",
      })
      .andWhere("cart.deleted_at IS NULL")
      .andWhere("cart.completed_at IS NULL")
      .andWhere(
        !fromAdmin ? `cart.created_at > now() - interval '1 day' * ${dateLimit || 7}` : "cart.created_at IS NOT NULL",
      )
      .andWhere(!fromAdmin ? "cart.abandoned_completed_at IS NULL": "cart.email IS NOT NULL")
      .andWhere("items.id IS NOT NULL") // Ensure there are items related to the cart
      .orderBy("cart.created_at", "DESC")
      .select([
        "cart.id",
        "cart.email",
        "cart.created_at",
        "cart.region",
        "cart.context",
        "items",
        "region",
        "shipping_address",
        "cart.abandoned_count",
        "cart.abandoned_lastdate",
        "cart.abandoned_last_interval",
      ])
      .take(take)
      .skip(skip)
      [type]();
  };

  async setCartsAsCompleted(cartsIds: string[]) {
    if (cartsIds.length === 0) {
      return;
    }
    const cartRepo = this.activeManager_.withRepository(this.cartRepository);

    this.logger.info(`Completing ${cartsIds.length} abandoned carts`);
    await cartRepo.update(cartsIds, {
      abandoned_completed_at: new Date().toISOString(),
    });

  }

  async retrieveAbandonedCarts(
    take: string | number = 200,
    skip: string | number = 0,
    dateLimit: number = 7,
    fromAdmin = false,
  ) {
    const takeNumber = +take;

    const skipNumber = +skip;

    if (
      isNaN(takeNumber) ||
      isNaN(skipNumber) ||
      takeNumber < 0 ||
      skipNumber < 0
    ) {
      throw new Error("Invalid take or skip");
    }

    const totalCartsPromise = this.queryBuilder(
      "getCount",
      takeNumber,
      skipNumber,
      +dateLimit,
      fromAdmin,
    ) as Promise<Number>;

    const notNullCartsPromises = this.queryBuilder(
      "getMany",
      takeNumber,
      skipNumber,
      +dateLimit,
      fromAdmin,
    ) as Promise<Cart[]>;

    const [totalCarts, carts] = await Promise.all([
      totalCartsPromise,
      notNullCartsPromises,
    ]);

    const transformedCarts = this.transformCart(carts);
    return {
      abandoned_carts: transformedCarts,
      total_carts: totalCarts,
    };
  }

  transformCart = (
    cart: Cart[] | Cart,
  ): TransformedCart[] | TransformedCart => {
    if (Array.isArray(cart)) {
      return cart.map((c) => this.transformCart(c)) as TransformedCart[];
    }
    return {
      id: cart.id,
      email: cart.email,
      items: cart.items.map((item) => {
        return {
          ...item,
          price: `${this.humanPrice_(
            item.unit_price,
            cart.region.currency_code
          )} ${cart.region.currency_code}`,
        }
      }),
      cart_context: cart.context,
      first_name: cart.shipping_address?.first_name,
      last_name: cart.shipping_address?.last_name,
      totalPrice: cart.items.reduce(
        (acc, item) => acc + item.unit_price * item.quantity,
        0,
      ),
      
      created_at: cart.created_at,
      currency: cart.region.currency_code,
      region: cart.region.id,
      country_code: cart.shipping_address?.country_code,
      region_name: cart.region.name,
      abandoned_count: cart.abandoned_count,
      abandoned_lastdate: cart.abandoned_lastdate,
      abandoned_last_interval: cart.abandoned_last_interval,
    };
  };
}
