import Router from "next/router";
import { useEffect, useState } from "react";
import StripeCheckout from "react-stripe-checkout";
import useRequest from "../../hooks/useRequest";

const OrderShow = ({ order, currentUser }) => {
  const [timeRemain, setTimeRemain] = useState(0);
  const { doRequest, errors } = useRequest({
    url: "/api/payments",
    method: "post",
    body: {
      orderId: order.id,
    },
    onSuccess: () => Router.push("/orders"),
  });
  useEffect(() => {
    const findTimeLeft = () => {
      const timeLeft = new Date(order.expiresAt) - new Date();
      setTimeRemain(Math.round(timeLeft / 1000));
    };
    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [order]);

  if (timeRemain < 0) {
    return <div>Order Expired</div>;
  }

  return (
    <div>
      {" "}
      {timeRemain} seconds left to pay
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey="pk_test_51GyJtWHbBPLoJXrfaoOHtstVJ3qRpufdaQiEEo7ED7aeHTPM2VhGGvWhj6Sa9dRGhOQcDQjufLCEJbPcnXAloCAr00z3Bavzxh"
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
};

export default OrderShow;
