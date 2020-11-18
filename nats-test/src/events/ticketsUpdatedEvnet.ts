import { Subjects } from "./subjects";

export interface TicketUpdateddEvent {
  subject: Subjects.TicketUpdated;
  data: {
    id: string;
    title: string;
    price: number;
  };
}
