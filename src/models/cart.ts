import { Column, Entity } from "typeorm"
import {
  // alias the core entity to not cause a naming conflict
  Cart as MedusaCart,
} from "@medusajs/medusa"

@Entity()
export class Cart extends MedusaCart {
  @Column({type: "varchar"})
  abandoned_cart_notification_date?: string | null
  @Column({type: "boolean"})
  abandoned_cart_notification_sent?: boolean | null
  @Column({type: "int", default: 0})
  abandoned_cart_notification_count?: number | null
}