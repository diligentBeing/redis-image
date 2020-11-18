import { Message } from "node-nats-streaming";
import { Listener } from "../../../common/src/events/base-listener";
import { Subjects } from "./subjects";
import { TicketUpdateddEvent } from "./ticketsUpdatedEvnet";

export class TicketUpdatedListener extends Listener<TicketUpdateddEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = "payments-service";

  onMessage(data: TicketUpdateddEvent["data"], msg: Message) {
    console.log("Event data!", data);

    msg.ack();
  }
}
