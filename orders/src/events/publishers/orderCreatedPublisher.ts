import { Publisher, OrderCreatedEvent, Subjects } from "@tixy/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
