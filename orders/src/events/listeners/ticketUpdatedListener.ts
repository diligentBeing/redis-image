import {
  Listener,
  NotFoundError,
  Subjects,
  TicketUpdateddEvent,
} from "@tixy/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/Ticket";
import { queueGroupName } from "./queueGroupName";

export class TicketUpdatedListener extends Listener<TicketUpdateddEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdateddEvent["data"], msg: Message) {
    try {
      const { id, title, price, version } = data;
      const ticket = await Ticket.findByEvent(data);
      //console.log(`Version in data is : ${ticket}`);

      if (!ticket) {
        throw new NotFoundError();
      }

      ticket.set({ title, price });

      await ticket.save();
      //console.log("🚗🚗🚗🚗🚗🚗 Delivered!!!!");

      msg.ack();
    } catch (err) {
      return;
    }
  }
}
