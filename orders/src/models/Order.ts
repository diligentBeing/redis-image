import mongoose from "mongoose";
import { OrderStatus } from "@tixy/common";
import { TicketDoc } from "./Ticket";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

export { OrderStatus };

//An interface that describes the properties that is required to create an Order
interface OrderAttrs {
  ticket: TicketDoc;
  status: OrderStatus;
  userId: string;
  expiresAt: Date;
}

//An interface that describes the properties that a Order Document has
interface OrderDoc extends mongoose.Document {
  ticket: TicketDoc;
  status: OrderStatus;
  userId: string;
  version: number;
  expiresAt: Date;
}

//An interface that describes the properties
//that a OrderModel has
//OPTION 1
interface OrderModel extends mongoose.Model<OrderDoc> {
  //build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date,
      required: false,
    },
    userId: {
      type: String,
      required: true,
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Ticket",
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

orderSchema.set("versionKey", "version");
orderSchema.plugin(updateIfCurrentPlugin);

const OrderModel = mongoose.model<OrderDoc, OrderModel>(`Order`, orderSchema);

class Order extends OrderModel {
  constructor(attrs: OrderAttrs) {
    super(attrs);
  }
}
//----

export { Order };
