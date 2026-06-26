
import mongoose, { Schema, Document } from "mongoose";

export interface IInventoryLog extends Document {
  productId: mongoose.Types.ObjectId;
  type: "STOCK_ADDED" | "STOCK_REMOVED";
  quantityChanged: number;
  unitType: string;
  action: string;
  user: string;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryLogSchema: Schema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    type: {
      type: String,
      enum: ["STOCK_ADDED", "STOCK_REMOVED"],
      required: true,
    },
    quantityChanged: {
      type: Number,
      required: true,
      min: 1,
    },
    unitType: {
      type: String,
      default: "Units",
    },
    action: {
      type: String,
      required: true,
    },
    user: {
      type: String,
      default: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IInventoryLog>("InventoryLog", InventoryLogSchema);
