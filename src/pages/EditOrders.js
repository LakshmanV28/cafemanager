import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Form, Modal, Card, Container, Row, Col } from "react-bootstrap";

const EditOrder = () => {
    const [orders, setOrders] = useState([]); // Store all orders
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteItemData, setDeleteItemData] = useState({ orderId: "", itemId: "" });
    const [newItem, setNewItem] = useState({ name: "", qty: 1, comment: "", orderId: "" });
    const [modeOfPayment, setModeOfPayment] = useState("Cash");

    useEffect(() => {
        fetchOrders(); // Fetch all orders when component mounts
    }, []);

    // ✅ Fetch orders correctly
    const fetchOrders = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/editorders");
            setOrders(response.data || []); // Ensure orders is always an array
        } catch (error) {
            console.error("Error fetching orders:", error);
            setOrders([]); // Avoid undefined errors
        }
    };

    // ✅ Add item to a specific order
    const handleAddItem = async () => {
        if (!newItem.orderId) {
            alert("Please select an order");
            return;
        }
        try {
            const response = await axios.post(
                `http://localhost:5000/api/editorders/add-item/${newItem.orderId}`,
                newItem
            );
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order._id === newItem.orderId ? response.data.order : order
                )
            ); // Update only the modified order
            setShowModal(false);
        } catch (error) {
            console.error("Error adding item:", error);
        }
    };

    // ✅ Update a specific item inside an order
    const handleUpdateItem = async (orderId, itemId, qty, comment) => {
        try {
            const response = await axios.put(
                `http://localhost:5000/api/editorders/update-item/${orderId}/${itemId}`,
                { qty, comment }
            );
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order._id === orderId ? response.data.order : order
                )
            ); // Update only the modified order
        } catch (error) {
            console.error("Error updating item:", error);
        }
    };

    const confirmDelete = (orderId, itemId) => {
        setDeleteItemData({ orderId, itemId });
        setShowDeleteModal(true);
    };

    const handleDeleteItem = async () => {
        try {
            const { orderId, itemId } = deleteItemData;
            const response = await axios.delete(
                `http://localhost:5000/api/editorders/delete-item/${orderId}/${itemId}`
            );
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order._id === orderId ? response.data.order : order
                )
            );
            setShowDeleteModal(false);
        } catch (error) {
            console.error("Error deleting item:", error);
        }
    };



    const handleCheckout = async (order) => {
        try {
            await axios.post(`https://cashman-node.onrender.com/api/cart/add`, {
                items: order.items.map((item) => ({
                    name: item.name,
                    category: item.category || "Uncategorized",
                    price: item.price || 0,
                    quantity: item.qty,
                })),
                total: order.items.reduce((sum, item) => sum + (item.price || 0) * item.qty, 0),
                modeOfPayment,
            });

            alert(`Order for Table ${order.tableNo} checked out successfully!`);
            fetchOrders(); // ✅ Ensure the list updates properly
        } catch (error) {
            console.error("Error during checkout:", error);
        }
    };


    return (
        <Container className="mt-4">
            <h2 className="text-center mb-4">Edit Orders</h2>
            {/* {console.log(orders)} */}
            {orders && orders.length > 0 ? (
                <Row>
                    {orders.map((order) => (
                        <Col key={order._id} sm={12} md={6} lg={4} xl={3} className="mb-4">
                            <Card className="shadow-lg p-3 bg-white rounded">
                                <Card.Body>
                                    <Card.Title>Table {order.tableNo}</Card.Title>

                                    {/* ✅ Map through items inside each order */}
                                    {order.items && order.items.length > 0 ? (
                                        order.items.map((item) => (
                                            <Card.Text key={item._id}>
                                                <strong>{item.name}</strong> <br />
                                                <strong>Quantity:</strong>
                                                <Form.Control
                                                    type="number"
                                                    value={item.qty}
                                                    onChange={(e) =>
                                                        handleUpdateItem(order._id, item._id, e.target.value, item.comment)
                                                    }
                                                />
                                                <strong>Comment:</strong>
                                                <Form.Control
                                                    type="text"
                                                    value={item.comment}
                                                    onChange={(e) =>
                                                        handleUpdateItem(order._id, item._id, item.qty, e.target.value)
                                                    }
                                                />
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    className="mt-2"
                                                    onClick={() => confirmDelete(order._id, item._id)}
                                                >
                                                    Delete
                                                </Button>
                                            </Card.Text>
                                        ))
                                    ) : (
                                        <p className="text-muted">No items in this order</p>
                                    )}
                                </Card.Body>
                                {/* <Card.Footer className="d-flex justify-content-between">

                                    <Button variant="primary" onClick={() => handleCheckout(order)}>
                                        Paid
                                    </Button>
                                </Card.Footer> */}
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <h4 className="text-center text-muted">No orders available</h4>
            )}
            <Button variant="success" onClick={() => setShowModal(true)}>
                Add Item
            </Button>


            {/* Modal for Adding Items */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Item</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Select Order</Form.Label>
                            <Form.Control
                                as="select"
                                value={newItem.orderId}
                                onChange={(e) => setNewItem({ ...newItem, orderId: e.target.value })}
                            >
                                <option value="">Select an order</option>
                                {orders.map((order) => (
                                    <option key={order._id} value={order._id}>
                                        Table {order.tableNo}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Item Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={newItem.name}
                                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Quantity</Form.Label>
                            <Form.Control
                                type="number"
                                value={newItem.qty}
                                onChange={(e) => setNewItem({ ...newItem, qty: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Comment</Form.Label>
                            <Form.Control
                                type="text"
                                value={newItem.comment}
                                onChange={(e) => setNewItem({ ...newItem, comment: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleAddItem}>
                        Add Item
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Confirm Delete Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete this item?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeleteItem}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>

        </Container>
    );
};

export default EditOrder;
