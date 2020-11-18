import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  OrderStatus,
  BadRequestError,
} from "@tixy/common";
import { Order } from "../models/Order";
import { Ticket } from "./../models/Ticket";
//import { TicketCreatedPublisher } from "../events/publishers/ticketCreatedPublisher";
import { natsWrapper } from "../natsWrapper";
import { OrderCancelledPublisher } from "../events/publishers/orderCancelledPublisher";
import { OrderCreatedPublisher } from "../events/publishers/orderCreatedPublisher";

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 1 * 60;

router.post(
  "/api/orders",
  requireAuth,
  [body("ticketId").not().isEmpty().withMessage("TicketId is required")],
  validateRequest,
  async (req: Request, res: Response) => {
    // Find the ticket the user is trying to order in the database
    const { ticketId } = req.body;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    const isReserved = await ticket.isReserved();

    // Make sure that the ticket is not already reserved
    // Run query to look at all orders. Find an order whtere the ticket is the ticket
    //we just found and the orders status is not cancelled.
    //If we find an order from that means the ticket is reserved

    if (isReserved) {
      throw new BadRequestError("Ticket is already reserved");
    }

    // Calculate an expiration day for order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // Build the order and save it to the database
    const order = new Order({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket,
    });

    await order.save();

    // Publish and event saying that an order was created
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      status: order.status,
      userId: order.userId,
      version: order.version,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    });

    res.status(201).send(order);
  }
);

export { router as createOrderRouter };
