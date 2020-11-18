import express, { Request, Response } from "express";
import { body } from "express-validator";
import { requireAuth, validateRequest } from "@tixy/common";
import { Ticket } from "./../models/Ticket";
import { TicketCreatedPublisher } from "../events/publishers/ticketCreatedPublisher";
import { natsWrapper } from "../natsWrapper";

const router = express.Router();

router.post(
  "/api/tickets",
  requireAuth,
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("price")
      .isFloat({ gt: 0 })
      .not()
      .isEmpty()
      .withMessage("Price is required"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const ticket = new Ticket({ title, price, userId: req.currentUser!.id });
    await ticket.save();

    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });
    res.status(200).send(ticket);
  }
);

export { router as createTicketRouter };
