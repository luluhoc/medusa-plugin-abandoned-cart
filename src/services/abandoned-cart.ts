import { Cart, Logger, TransactionBaseService } from "@medusajs/medusa"
import CartRepository from "@medusajs/medusa/dist/repositories/cart"
import { MedusaError } from "medusa-core-utils"
import SendGridService from "medusa-plugin-sendgrid-typescript/dist/services/sendgrid"
import { PluginOptions } from "../types"

export default class AbandonedCartService extends TransactionBaseService {
  protected cartRepository: typeof CartRepository
  protected sendGridService: SendGridService
  logger: Logger
  options_: PluginOptions

  constructor(container, options: PluginOptions) {
    super(container)
    this.cartRepository = container.cartRepository
    this.sendGridService = container.sendgridService
    this.logger = container.logger
    this.options_ = options
  }

  getCartLocale(cart: Cart): string {
    return cart?.context?.locale as string || "en"
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
        select: ["id", "email", "created_at", "region", "context"],
        relations: ["items", "region", "shipping_address"],
      })

      let templateId = this.options_.templateId
      let subject = this.options_.subject
      
      if (!notNullCartsPromise) {
        throw new MedusaError("Not Found", "Cart not found")
      }

      const cart = this.transformCart(notNullCartsPromise)

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
        from: "RetroBroker <no-reply@retrobroker.com>",
        subject: subject ?? "You left something in your cart",
        templateId: templateId,
        dynamic_template_data: {
          ...cart,
        },
      }

      await this.sendGridService.sendEmail(emailData)
    } catch (error) {
      
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
    .select(["cart.id", "cart.email", "cart.created_at", "cart.region", "cart.context", "items", "region", "shipping_address"])
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

    if (!this.sendGridService) {
      throw new Error("SendGrid service is not available")
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

  transformCart = (cart: Cart[] | Cart) => {
    if (Array.isArray(cart)) {
      return cart.map(c => this.transformCart(c))
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
    }
  }
}
