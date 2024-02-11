import { Cart, Logger, TransactionBaseService } from "@medusajs/medusa"
import { Lifetime } from "awilix"
import CartRepository from "@medusajs/medusa/dist/repositories/cart"
import { MedusaError } from "medusa-core-utils"
import type SendGridService from "medusa-plugin-sendgrid-typescript/dist/services/sendgrid"
import { PluginOptions, TransformedCart } from "../types"

export default class AbandonedCartService extends TransactionBaseService {
  static LIFE_TIME = Lifetime.SCOPED
  protected cartRepository: typeof CartRepository
  protected sendGridService: SendGridService
  logger: Logger
  options_: PluginOptions

  constructor(container, options: PluginOptions) {
    super(container)
    this.cartRepository = container.cartRepository
    try {
      this.sendGridService = container?.sendgridService
    } catch (e) {
      this.sendGridService = null
    }

    this.logger = container.logger
    this.options_ = options
  }

  getCartLocale(cart: TransformedCart): string {
    return cart?.cart_context?.locale as string || "en"
  }

  async sendAbandonedCartEmail(id: string) {
    if (!this.sendGridService) {
      throw new Error("SendGrid service is not available")
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
        select: ["id", "email", "created_at", "region", "context", "abandoned_cart_notification_count"],
        relations: ["items", "region", "shipping_address"],
      })

      let templateId = this.options_.templateId || "d-aa8ddff84d314c99b5dc4c539e896e7d"
      let subject = this.options_.subject
      
      if (!notNullCartsPromise) {
        throw new MedusaError("Not Found", "Cart not found")
      }

      const cart = this.transformCart(notNullCartsPromise)  as TransformedCart

      if (this.options_.localization) {
        const locale = this.getCartLocale(cart)
        const localeOptions = this.options_.localization[locale]

        if (localeOptions) {
          templateId = localeOptions.templateId
          subject = localeOptions.subject ?? subject
        }
      }

      if (!this.options_.from) {
        throw new MedusaError("Invalid", "From is required")
      }

      if (!templateId) {
        throw new MedusaError("Invalid", "TemplateId is required")
      }
      

      const emailData = {
        to: "sklepretrobroker@gmail.com",
        from: this.options_.from,
        subject: subject ?? "You left something in your cart",
        templateId: templateId,
        dynamic_template_data: {
          ...cart,
        },
      }
      
      await this.sendGridService.sendEmail(emailData)
      await cartRepo.update(cart.id, {
        abandoned_cart_notification_sent: true,
        abandoned_cart_notification_date: new Date().toISOString(),
        abandoned_cart_notification_count: (notNullCartsPromise?.abandoned_cart_notification_count || 0) + 1,
      })

      return {
        success: true,
        message: "Email sent",
      }
    } catch (error) {
      console.log(error)
    }
  }

  queryBuilder = (type: "getCount" | "getMany", take: number, skip: number): Promise<Cart[]> | Promise<Number> => {
    const cartRepo = this.activeManager_.withRepository(this.cartRepository);
    return cartRepo.createQueryBuilder("cart")
    .leftJoinAndSelect("cart.items", "items")
    .leftJoinAndSelect("cart.region", "region")
    .leftJoinAndSelect("cart.shipping_address", "shipping_address")
    .where("cart.email IS NOT NULL")
    .andWhere("cart.email NOT LIKE :emailPattern", { emailPattern: '%storebotmail%' })
    .andWhere("cart.deleted_at IS NULL")
    .andWhere("cart.completed_at IS NULL")
    .andWhere("items.id IS NOT NULL") // Ensure there are items related to the cart
    .orderBy("cart.created_at", "DESC")
    .select(["cart.id", "cart.email", "cart.created_at", "cart.region", "cart.context", "items", "region", "shipping_address", "cart.abandoned_cart_notification_date", "cart.abandoned_cart_notification_count", "cart.abandoned_cart_notification_sent"])
    .take(take)
    .skip(skip)
    [type]()
  }

  async retrieveAbandonedCarts(take: string | number = 200, skip: string | number = 0) {

    const takeNumber = +take
    
    const skipNumber = +skip

    if (isNaN(takeNumber) || isNaN(skipNumber)) {
      throw new Error("Invalid take or skip")
    }

    const totalCartsPromise = this.queryBuilder("getCount", takeNumber, skipNumber) as Promise<Number>

    const notNullCartsPromises = this.queryBuilder("getMany", takeNumber, skipNumber) as Promise<Cart[]>
  
    const [totalCarts, carts] = await Promise.all([totalCartsPromise, notNullCartsPromises])
    const transformedCarts = this.transformCart(carts)
    return {
      abandoned_carts: transformedCarts,
      total_carts: totalCarts,
    }
  }

  transformCart = (cart: Cart[] | Cart): TransformedCart[] | TransformedCart => {
    if (Array.isArray(cart)) {
      return cart.map(c => this.transformCart(c)) as TransformedCart[]
    }
    return {
      id: cart.id,
      email: cart.email,
      items: cart.items,
      cart_context: cart.context,
      first_name: cart.shipping_address?.first_name,
      last_name: cart.shipping_address?.last_name,
      totalPrice: cart.items.reduce((acc, item) => acc + item.unit_price * item.quantity, 0),
      created_at: cart.created_at,
      currency: cart.region.currency_code,
      region: cart.region.id,
      country_code: cart.shipping_address?.country_code,
      region_name: cart.region.name,
      abandoned_cart_notification_count: cart.abandoned_cart_notification_count,
      abandoned_cart_notification_date: cart.abandoned_cart_notification_date,
      abandoned_cart_notification_sent: cart.abandoned_cart_notification_sent,
    }
  }
}
