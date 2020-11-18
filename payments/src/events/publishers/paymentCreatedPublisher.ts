import { PaymentCreatedEvent, Publisher, Subjects } from "@tixy/common";

export class paymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
