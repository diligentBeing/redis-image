import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { TicketCreatedListener } from "../events/listeners/ticketCreatedListener";
import { Order, OrderStatus } from "./Order";

//An interface that describes the properties that is required to create a Ticket
interface TicketAttrs {
  _id: string;
  title: string;
  price: number;
}

//An interface that describes the properties that a Ticket Document has
export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<boolean>;
}

//An interface that describes the properties
//that a UserModel has
//OPTION 1
interface TicketModel extends mongoose.Model<TicketDoc> {
  //build(attrs: TicketAttrs): TicketDoc;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    version: {
      type: Number,
      required: false,
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

ticketSchema.set("versionKey", "version");
ticketSchema.plugin(updateIfCurrentPlugin);

/*ticketSchema.pre("save", function (done) {
  //@ts-ignore
  this.$where = {
    version: this.get("version") - 1,
  };
  done();
});*/

ticketSchema.statics.findByEvent = (event: { id: string; version: number }) => {
  return Ticket.findOne({ _id: event.id, version: event.version - 1 });
};
ticketSchema.methods.isReserved = async function () {
  //this === the ticket document that we just called 'isReserved' on
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });

  return !!existingOrder;
};

const TicketModel = mongoose.model<TicketDoc, TicketModel>(
  `Ticket`,
  ticketSchema
);

class Ticket extends TicketModel {
  constructor(attrs: TicketAttrs) {
    super(attrs);
  }
}
//----

export { Ticket };
