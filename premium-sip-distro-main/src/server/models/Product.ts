
import mongoose, { Schema, Document } from "mongoose";

export interface IPurchaseType {
  type: "Single" | "Pack" | "Crate" | "Carton";
  units: number;
  sellingPrice: number;
}

export interface IProduct extends Document {
  name: string;
  brand?: string;
  category?: string;
  description?: string;
  image?: string;
  packageType?: string;
  quantity: number;
  sku?: string;
  purchaseTypes?: IPurchaseType[];
  costPrice?: number;
  lowStockThreshold?: number;
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseTypeSchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: ["Single", "Pack", "Crate", "Carton"],
      required: true,
    },
    units: {
      type: Number,
      required: true,
      min: 1,
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const ProductSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    packageType: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    sku: {
      type: String,
      trim: true,
    },
    purchaseTypes: [PurchaseTypeSchema],
    costPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for "stock" (alias for quantity for frontend compatibility)
ProductSchema.virtual("stock").get(function (this: IProduct) {
  return this.quantity;
});

// Ensure virtuals are included in JSON responses
ProductSchema.set("toJSON", { virtuals: true });
ProductSchema.set("toObject", { virtuals: true });

export default mongoose.model<IProduct>("Product", ProductSchema);
