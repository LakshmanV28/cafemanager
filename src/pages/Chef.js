import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card } from "react-bootstrap";

const Chef = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get("https://cashman-node.onrender.com/api/chef");
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Chef Orders</h2>
      {orders.length === 0 ? (
        <h4 className="text-center text-muted">No orders available</h4>
      ) : (
        <Row>
          {orders.map((order, index) => (
            <Col key={index} sm={12} md={6} lg={4} xl={3} className="mb-4">
              <Card className="shadow-lg p-3 bg-white rounded">
                <Card.Body>
                  <Card.Title>Table {order.tableNo}</Card.Title>
                  {order.items.map((item, i) => (
                    <Card.Text key={i}>
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
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Chef;
