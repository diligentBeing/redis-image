import { body } from "express-validator";
import express, { Request, Response } from "express";
import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from "@tixy/common";
import { tokenToString } from "typescript";
import { Order } from "../models/Order";
import { stripe } from "../stripe";
import { Payment } from "../models/Payment";
import { paymentCreatedPublisher } from "../events/publishers/paymentCreatedPublisher";
import { natsWrapper } from "../natsWrapper";

const router = express.Router();

router.post(
  "/api/payments",
  requireAuth,
  [body("token").not().isEmpty(), body("orderId").not().isEmpty()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser?.id) {
      throw new NotAuthorizedError();
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError("Cannot pay for a cancelled order");
    }

    const charge = await stripe.charges.create({
      currency: "usd",
      amount: order.price * 100,
      source: token,
    });

    const payment = new Payment({ orderId: order.id, stripeId: charge.id });

    //Require Charge id after writing a test that can connect with stripe server
    await payment.save();

    new paymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });

    res.status(201).send({ success: true, id: payment.id });
  }
);

export { router as createChargeRouter };
