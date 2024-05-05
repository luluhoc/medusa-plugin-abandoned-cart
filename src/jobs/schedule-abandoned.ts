import { 
  type ScheduledJobConfig, 
  type ScheduledJobArgs,
  ProductStatus,
  Logger,
}  from "@medusajs/medusa"
import AbandonedCartService from "../services/abandoned-cart"
import { TransformedCart } from "../types"

export default async function handler({ 
  container, 
  data, 
  pluginOptions,
}: ScheduledJobArgs) {
  const abandonedCartService: AbandonedCartService = container.resolve(
    "abandonedCartService"
  )

  const op = abandonedCartService.options_

  const logger: Logger = container.resolve("logger")

  const abandonedCarts = await abandonedCartService.retrieveAbandonedCarts(10) as {
    abandoned_carts: TransformedCart[]
    total_carts: number
  };
  if ((Array.isArray(abandonedCarts.abandoned_carts) && abandonedCarts.abandoned_carts.length === 0) || !abandonedCarts.abandoned_carts) {
    return
  }

  for (let i = 0; i < abandonedCarts.abandoned_carts.length; i++) {
    const a = abandonedCarts.abandoned_carts[i];
    logger.info(`Processing abandoned cart ${a.id}`)
  }
}

export const config: ScheduledJobConfig = {
  name: "puffin-schedule-abandoned",
  schedule: "* * * * *",
  data: {},
}