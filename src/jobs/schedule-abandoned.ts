import { 
  type ScheduledJobConfig, 
  type ScheduledJobArgs,
  ProductStatus,
  Logger,
}  from "@medusajs/medusa"
import AbandonedCartService from "../services/abandoned-cart"
import { TransformedCart } from "../types"
import parse from "parse-duration"

export default async function handler({ 
  container, 
  data, 
  pluginOptions,
}: ScheduledJobArgs) {
  const ids_to_complete = []
  const abandonedCartService: AbandonedCartService = container.resolve(
    "abandonedCartService"
  )
  const logger: Logger = container.resolve("logger")

  const cacheService = container.resolve("cacheService");

  const op = abandonedCartService.options_

  if (!abandonedCartService.checkTypeOfOptions(op)) {
    return
  }

  if (!op.intervals || op.intervals.length === 0) {
    // logger.warn("No intervals or max_overdue defined for abandoned cart emails")
    return
  }

  if (op.max_overdue && !parse(op.max_overdue)) {
    logger.warn("Invalid max_overdue format")
    return
  }

  const cachedCarts: string | undefined = await cacheService.get("abandoned_carts");
  let abandonedCarts: {
    abandoned_carts: TransformedCart[];
    total_carts: number;
} = cachedCarts ? JSON.parse(cachedCarts) : {};
  // Get Abanoned Carts
  if (!cachedCarts || !abandonedCarts.total_carts) {
    abandonedCarts = await abandonedCartService.retrieveAbandonedCarts(1000, 0, op.days_to_track || 5) as {
      abandoned_carts: TransformedCart[]
      total_carts: number
    };
    await cacheService.set("abandoned_carts", JSON.stringify(abandonedCarts), 200);
  }

  if (abandonedCarts.total_carts > 1000) {
    logger.warn("More than 1000 abandoned carts found, please increase the limit")
  }

  if (!abandonedCarts) {
    return
  }
  
  if ((Array.isArray(abandonedCarts.abandoned_carts) &&
   abandonedCarts.abandoned_carts.length === 0) ||
    !abandonedCarts.abandoned_carts) {
    return
  }
  const promises = []

  for (let i = 0; i < abandonedCarts.abandoned_carts.length; i++) {
    const cart = abandonedCarts.abandoned_carts[i];
    let int: number | string | null = null;

    const ind = op.intervals.findIndex((i) => i.interval === parseInt(cart.abandoned_last_interval as unknown as string | null))
    if (ind === -1) {
      int = op.intervals[0].interval
    } else if (ind !== -1 && ind < op.intervals.length - 1) {
      int = op.intervals[ind + 1]?.interval
    } else {
      int = null
    }

    if (!int) {
      continue
    }

    if (typeof int === "string") {
      int = parse(int)
    }
    // logger.info(`Interval for cart ${cart.id} is ${int}`)

    const now = new Date()
    const cartCreatedAt = new Date(cart.created_at)
    const cartInterval = new Date(cartCreatedAt.getTime() + int)
    // cart from now difference
    const diff = cartInterval.getTime() - now.getTime()

    if (diff > 0) {
      // logger.info(`Cart ${cart.id} is not ready to be processed`)
      continue
    }
    
    if (diff < -parse(op.max_overdue || "2h")) {
      ids_to_complete.push(cart.id)
      continue
    }
   
    if (cart.abandoned_lastdate && (new Date(new Date(cart.abandoned_lastdate).getTime() + parse("3m")) > now)) {
      // logger.info(`This Cart ${cart.id} has been processed recently`)
      continue
    }

    if (cart.abandoned_lastdate &&
       cart.abandoned_last_interval &&
      (new Date() < new Date(new Date(cart.abandoned_lastdate).getTime() + int))) {
      if (process.env.BETA_TESTING_PLUGIN === "TESTING") {
        logger.info(`This Cart ${cart.id} has been processed recently and will be processes at next interval`)
      }
      continue
    }

    await abandonedCartService.sendAbandonedCartEmail(cart.id, int) 
  }

  if (op.set_as_completed_if_overdue) {
    // logger.info(`Completing ${ids_to_complete.length} abandoned carts`)
    await abandonedCartService.setCartsAsCompleted(ids_to_complete)
  }
}

export const config: ScheduledJobConfig = {
  name: "schedule-abandoned",
  schedule: "*/5 * * * *",
  data: {},
}