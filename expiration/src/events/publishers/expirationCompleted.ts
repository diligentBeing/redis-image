import { ExpirationCompletedEvent, Publisher, Subjects } from "@tixy/common";

export class ExpirationCompletedPublisher extends Publisher<
  ExpirationCompletedEvent
> {
  subject: Subjects.ExpirationCompleted = Subjects.ExpirationCompleted;
}
