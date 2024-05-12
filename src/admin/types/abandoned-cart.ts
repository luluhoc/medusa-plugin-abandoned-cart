export interface AbandonedCartResponse {
  carts: AbandonedCart[];
  count: number;
}

export interface AbandonedCart {
  id: string;
  email: string;
  items: Item[];
  created_at: Date;
  first_name: string;
  last_name: string;
  currency: string;
  country_code: string;
  region: string;
  region_name: string;
  totalPrice: number;
  abandoned_count: number;
  abandoned_lastdate: Date;
  abandoned_last_interval: string;
}

export interface Item {
  id: string;
  created_at: Date;
  updated_at: Date;
  cart_id: string;
  order_id: null;
  swap_id: null;
  claim_order_id: null;
  original_item_id: null;
  order_edit_id: null;
  title: string;
  description: string;
  thumbnail: string;
  is_return: boolean;
  is_giftcard: boolean;
  should_merge: boolean;
  allow_discounts: boolean;
  has_shipping: boolean;
  unit_price: number;
  variant_id: string;
  quantity: number;
  fulfilled_quantity: null;
  returned_quantity: null;
  shipped_quantity: null;
  metadata: Record<string, unknown>;
}
