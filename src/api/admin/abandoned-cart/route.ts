import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import AbandonedCartService from "../../../services/abandoned-cart";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const abandonedCartService: AbandonedCartService = req.scope.resolve(
      "abandonedCartService"
    );

    const { take, skip } = req.query as { take: string; skip: string };

    const carts = await abandonedCartService.retrieveAbandonedCarts(take, skip);

    res.status(200).json({ carts: carts.abandoned_carts, count: carts.total_carts });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function POST(
  req: MedusaRequest<{
    id?: string;  
  }>,
  res: MedusaResponse
): Promise<void> {
  try {
    const abandonedCartService: AbandonedCartService = req.scope.resolve(
      "abandonedCartService"
    );

    if (!req.body.id) {
      throw new Error("No id provided");
    }

    const r = await abandonedCartService.sendAbandonedCartEmail(req.body.id);

    res.status(200).json(r);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}