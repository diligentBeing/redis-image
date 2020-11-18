import { Publisher, Subjects, TicketUpdateddEvent } from "@tixy/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdateddEvent> {
  readonly subject = Subjects.TicketUpdated;
}
