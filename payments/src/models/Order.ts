import { OrderStatus } from "@tixy/common";
import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

//An interface that describes the properties that is required to create a Order
interface OrderAttrs {
  _id: string;
  price: number;
  userId: string;
  version: number;
  status: OrderStatus;
}

//An interface that describes the properties that a Order Document has
interface OrderDoc extends mongoose.Document {
  price: number;
  userId: string;
  version: number;
  status: OrderStatus;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  //build(attrs: OrderAttrs): OrderDoc;
}

const OrderSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);
OrderSchema.set("versionKey", "version");
OrderSchema.plugin(updateIfCurrentPlugin);

const OrderModel = mongoose.model<OrderDoc, OrderModel>(`Order`, OrderSchema);

class Order extends OrderModel {
  constructor(attrs: OrderAttrs) {
    super(attrs);
  }
}
//----

export { Order };
