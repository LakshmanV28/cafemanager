import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Button, Container, Row, Col, Form } from "react-bootstrap";

const BillCounter = () => {
    const [orders, setOrders] = useState([]);
    const [paymentModes, setPaymentModes] = useState({});

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get("https://cashman-node.onrender.com/api/billcounter/orders");
    
            // Filter out deleted items but keep the order if it has non-deleted items
            const filteredOrders = response.data
                .map(order => ({
                    ...order,
                    items: order.items.filter(item => item.status !== "deleted"), // Exclude deleted items
                }))
                .filter(order => order.items.length > 0); // Remove orders with no remaining items
    
            setOrders(filteredOrders);
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };
    

    const handleCheckout = async (order) => {
        try {
            const modeOfPayment = paymentModes[order._id] || "Cash";
            const purchaseDate = new Date();

            const cartData = {
                items: order.items.map(item => ({
                    name: item.name,
                    category: item.category || "Unknown",
                    price: item.price,
                    quantity: item.qty,
                })),
                total: order.items.reduce((sum, item) => sum + (item.price * item.qty), 0),
                modeOfPayment,
                purchaseDate,
            };

            // ✅ Post data to cart
            await axios.post("https://cashman-node.onrender.com/api/cart/add", cartData);

            // ✅ Remove the order from the database after checkout
            await axios.delete(`https://cashman-node.onrender.com/api/billcounter/orders/${order._id}`);

            alert(`Table ${order.tableNo} checked out successfully!`);

            // ✅ Refresh orders list
            fetchOrders();
        } catch (error) {
            console.error("Error during checkout:", error);
        }
    };


    const handlePaymentChange = (orderId, mode) => {
        setPaymentModes((prev) => ({
            ...prev,
            [orderId]: mode,
        }));
    };

    return (
        <Container className="mt-4">
            <h2 className="text-center mb-4">Bill Counter</h2>
            {orders.length > 0 ? (
                <Row>
                    {orders.map((order) => {
                        const totalPrice = order.items.reduce(
                            (sum, item) => sum + (item.price || 0) * (item.qty || 1),
                            0
                        );

                        return (
                            <Col key={order._id} sm={12} md={6} lg={4} xl={3} className="mb-4">
                                <Card className="shadow-lg p-3 bg-white rounded">
                                    <Card.Body>
                                        <Card.Title>Table {order.tableNo}</Card.Title>
                                        {order.items.map((item) => (
                                            <div key={item._id} className="mb-3">
                                                <Card.Text>
                                                    <strong>{item.name}</strong> <br />
                                                    <strong>Qty:</strong> {item.qty} <br />
                                                    <strong>Price:</strong> ₹{item.price?.toFixed(2) || "0.00"} <br />
                                                    <strong>Total:</strong> ₹{(item.price * item.qty).toFixed(2)}
                                                </Card.Text>
                                            </div>
                                        ))}

                                        <hr />
                                        <h5 className="text-right"><strong>Grand Total: ₹{totalPrice.toFixed(2)}</strong></h5>

                                        <Form.Group>
                                            <Form.Label>Mode of Payment</Form.Label>
                                            <Form.Control
                                                as="select"
                                                value={paymentModes[order._id] || "Cash"}
                                                onChange={(e) => handlePaymentChange(order._id, e.target.value)}
                                            >
                                                <option value="Cash">Cash</option>
                                                <option value="Credit Card">Credit Card</option>
                                                <option value="UPI">UPI</option>
                                            </Form.Control>
                                        </Form.Group>

                                        <Button
                                            variant="primary"
                                            className="mt-3"
                                            onClick={() => handleCheckout(order)}
                                        >
                                            Table: {order.tableNo} Paid
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            ) : (
                <h4 className="text-center text-muted">No orders to process</h4>
            )}
        </Container>
    );
};

export default BillCounter;
