import { Subjects, Publisher, OrderCancelledEvent } from "@tixy/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
