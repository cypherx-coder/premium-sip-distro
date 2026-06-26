
import mongoose, { Schema, Document } from "mongoose";

export interface ICustomerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  phoneNumber?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerProfileSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICustomerProfile>("CustomerProfile", CustomerProfileSchema);
