import { Column, Entity } from "typeorm";
import {
  // alias the core entity to not cause a naming conflict
  Cart as MedusaCart,
} from "@medusajs/medusa";

@Entity()
export class Cart extends MedusaCart {
  @Column({ type: "timestamptz", nullable: true })
  abandoned_completed_at?: Date;

  @Column({ type: "int", nullable: true })
  abandoned_count?: number;

  @Column({ type: "bigint", nullable: true })
  abandoned_last_interval?: number;

  @Column({ type: "timestamptz", nullable: true })
  abandoned_lastdate?: Date;
}
