import mongoose from "mongoose";

//An interface that describes the properties that is required to create a Payment
interface PaymentAttrs {
  stripeId: string;
  orderId: string;
}

//An interface that describes the properties that a Payment Document has
interface PaymentDoc extends mongoose.Document {
  stripeId: string;
  orderId: string;
}

interface PaymentModel extends mongoose.Model<PaymentDoc> {
  //build(attrs: PaymentAttrs): PaymentDoc;
}

const PaymentSchema = new mongoose.Schema(
  {
    strideId: {
      type: String,
      required: false,
    },
    orderId: {
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

const PaymentModel = mongoose.model<PaymentDoc, PaymentModel>(
  `Payment`,
  PaymentSchema
);

class Payment extends PaymentModel {
  constructor(attrs: PaymentAttrs) {
    super(attrs);
  }
}

export { Payment };
