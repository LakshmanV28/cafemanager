import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Card } from "react-bootstrap";

const Orders = () => {
  const [ordersByDate, setOrdersByDate] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get("https://cashman-node.onrender.com/api/orders");
      setOrdersByDate(groupByDate(response.data));
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const groupByDate = (orders) => {
    if (!orders || typeof orders !== "object") return {};

    return Object.entries(orders).reduce((acc, [date, orderList]) => {
      acc[date] = orderList.map((order) => {
        const itemsWithTotal = order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: (item.price * item.quantity).toFixed(2),
        }));

        return {
          _id: order._id,
          modeOfPayment: order.modeOfPayment,
          total: order.total.toFixed(2),
          items: itemsWithTotal,
        };
      });

      return acc;
    }, {});
  };

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Orders</h2>
      {Object.entries(ordersByDate).map(([date, orders]) => (
        <Card className="mb-4 p-3" key={date}>
          <h4 className="text-center mb-3">Orders on {date}</h4>
          {orders.map((order) => (
            <Card key={order._id} className="mb-3 p-3">
              <h5>Order ID: {order._id}</h5>
              <p><strong>Mode of Payment:</strong> {order.modeOfPayment}</p>
              <p><strong>Total:</strong> ₹{order.total}</p>
              <Card className="p-2">
                <h6>Items:</h6>
                {order.items.map((item, index) => (
                  <p key={index}>
                    {item.name} - {item.quantity} x ₹{item.price} = ₹{item.total}
                  </p>
                ))}
              </Card>
            </Card>
          ))}
        </Card>
      ))}
    </Container>
  );
};

export default Orders;
