import { Publisher, Subjects, TicketCreatedEvent } from "@tixy/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
