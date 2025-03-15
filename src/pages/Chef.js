import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card } from "react-bootstrap";
import addSoundFile from "../assets/Notification-chime-sound-effect.mp3";
import deleteSoundFile from "../assets/mixkit-wrong-long-buzzer-954.wav";

const Chef = () => {
  const [orders, setOrders] = useState([]);
  const [previousOrders, setPreviousOrders] = useState([]); // Track previous orders

  const playSound = (type) => {
    const audio = new Audio(type === "add" ? addSoundFile : deleteSoundFile);
    audio.play().catch((err) => console.error("Audio play error:", err));
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (previousOrders.length > 0) {
      detectChanges();
    }
    setPreviousOrders([...orders]); // Store current orders for next comparison
  }, [orders]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        "https://cashman-node.onrender.com/api/chef"
      );
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const detectChanges = () => {
    // Detect completely new orders
    orders.forEach((newOrder) => {
      const oldOrder = previousOrders.find((o) => o._id === newOrder._id);
      if (!oldOrder) {
        playSound("add"); // Play sound for a new order
      }
    });

    // Detect item changes within existing orders
    orders.forEach((newOrder) => {
      const oldOrder = previousOrders.find((o) => o._id === newOrder._id);

      if (oldOrder) {
        // Check for newly added items
        newOrder.items.forEach((newItem) => {
          const oldItem = oldOrder.items.find(
            (item) => item._id === newItem._id
          );
          if (!oldItem && newItem.status === "added") {
            playSound("add"); // Play sound for newly added item
          }
        });

        // Check for deleted items
        oldOrder.items.forEach((oldItem) => {
          const newItem = newOrder.items.find(
            (item) => item._id === oldItem._id
          );
          if (
            !newItem ||
            (oldItem.status !== "deleted" && newItem?.status === "deleted")
          ) {
            playSound("delete"); // Play sound for deleted item
          }
        });
      }
    });
  };

  return (
    <Container className="mt-4 d-flex flex-column gap-3">
      <h2 className="text-center mb-4">· Chef Orders ·</h2>

      {orders.length === 0 ? (
        <h4 className="text-center text-muted">No orders available</h4>
      ) : (
        <Row>
          {orders.map((order) => {
            // Check if the only item in the order is deleted
            const hasOnlyDeletedItem = order.items.length === 1 && order.items[0].status === "deleted";
            if (hasOnlyDeletedItem) {
              // Don't render this card if the only item is marked as deleted
              return null;
            }

            return (
              <Col key={order._id} sm={12} md={6} lg={4} xl={3} className="mb-4">
                <Card className="shadow-lg p-3 bg-white rounded">
                  <Card.Body>
                    <Card.Title>{order.tableNo}</Card.Title>
                    {order.items.map((item) => (
                      <Card.Text
                        key={item._id}
                        style={{
                          color:
                            item.status === "added"
                              ? "green"
                              : item.status === "deleted"
                              ? "red"
                              : "black",
                        }}
                      >
                        <strong>Name:</strong> {item.name} <br />
                        <strong>Quantity:</strong> {item.qty} <br />
                        <strong>Comment:</strong> {item.comment || "No comment"}
                      </Card.Text>
                    ))}
                    <Card.Footer>
                      <small className="text-muted">
                        Order Time: {new Date(order.orderTime).toLocaleString()}
                      </small>
                    </Card.Footer>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
};

export default Chef;
