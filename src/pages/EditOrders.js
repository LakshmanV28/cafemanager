import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Form,
  Modal,
  Card,
  Container,
  Row,
  Col,
} from "react-bootstrap";

const EditOrder = () => {
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItemData, setDeleteItemData] = useState({
    orderId: "",
    itemId: "",
  });
  const [newItem, setNewItem] = useState({
    name: "",
    qty: 1,
    comment: "",
    orderId: "",
  });
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.flatMap((product) =>
          product.products.filter((p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
        )
      );
    }
  }, [searchTerm, products]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        "https://cashman-node.onrender.com/api/editorders"
      );
      setOrders(response.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        "https://cashman-node.onrender.com/api/products"
      );
      setProducts(response.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.orderId) {
      alert("Please select an order");
      return;
    }
    try {
      const response = await axios.post(
        `https://cashman-node.onrender.com/api/editorders/add-item/${newItem.orderId}`,
        newItem
      );
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === newItem.orderId ? response.data.order : order
        )
      );
      setShowModal(false);
      setNewItem({ name: "", qty: 1, comment: "", orderId: "" });
      setSearchTerm("");
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const handleProductSelect = (name) => {
    setNewItem({ ...newItem, name });
    setSearchTerm(name);
  };

  const handleUpdateItem = async (orderId, itemId, qty, comment) => {
    try {
      const response = await axios.put(
        `https://cashman-node.onrender.com/api/editorders/update-item/${orderId}/${itemId}`,
        { qty, comment }
      );
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? response.data.order : order
        )
      );
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
        `https://cashman-node.onrender.com/api/editorders/delete-item/${orderId}/${itemId}`
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

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Edit Orders</h2>
      {orders && orders.length > 0 ? (
        <Row>
          {orders
            .filter((order) => order.items && order.items.length > 0)
            .map((order) => (
              <Col
                key={order._id}
                sm={12}
                md={6}
                lg={4}
                xl={3}
                className="mb-4"
              >
                <Card className="shadow-lg p-3 bg-white rounded">
                  <Card.Body>
                    <Card.Title>Table {order.tableNo}</Card.Title>
                    {order.items.map((item) => (
                      <Card.Text key={item._id}>
                        <strong>{item.name}</strong> <br />
                        <strong>Quantity:</strong>
                        <Form.Control
                          type="number"
                          value={item.qty}
                          onChange={(e) =>
                            handleUpdateItem(
                              order._id,
                              item._id,
                              e.target.value,
                              item.comment
                            )
                          }
                        />
                        <strong>Comment:</strong>
                        <Form.Control
                          type="text"
                          value={item.comment}
                          onChange={(e) =>
                            handleUpdateItem(
                              order._id,
                              item._id,
                              item.qty,
                              e.target.value
                            )
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
                    ))}
                  </Card.Body>
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
                onChange={(e) =>
                  setNewItem({ ...newItem, orderId: e.target.value })
                }
              >
                <option value="">Select an order</option>
                {orders.map((order) => (
                  <option key={order._id} value={order._id}>
                    Table {order.tableNo}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            {/* Searchable Product Selection */}
            <Form.Group>
              <Form.Label>Search Product</Form.Label>
              <Form.Control
                type="text"
                placeholder="Type to search product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <div
                  style={{
                    border: "1px solid #ccc",
                    maxHeight: "150px",
                    overflowY: "auto",
                    marginTop: "5px",
                    position: "absolute",
                    width: "100%",
                    backgroundColor: "#fff",
                    zIndex: "1000",
                  }}
                >
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product, index) => (
                      <div
                        key={index}
                        style={{
                          padding: "5px",
                          cursor: "pointer",
                          borderBottom: "1px solid #ddd",
                        }}
                        onClick={() => handleProductSelect(product.name)}
                      >
                        {product.name}
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: "5px" }}>No products found</div>
                  )}
                </div>
              )}
            </Form.Group>

            <Form.Group>
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                value={newItem.qty}
                onChange={(e) =>
                  setNewItem({ ...newItem, qty: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Comment</Form.Label>
              <Form.Control
                type="text"
                value={newItem.comment}
                onChange={(e) =>
                  setNewItem({ ...newItem, comment: e.target.value })
                }
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
        <Modal.Body>Are you sure you want to delete this item?</Modal.Body>
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
