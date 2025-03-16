import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Form, Modal, Card, Container, Row, Col } from "react-bootstrap";

const EditOrders = () => {
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItemData, setDeleteItemData] = useState({ orderId: "", itemId: "" });
  const [newItem, setNewItem] = useState({ name: "", qty: 1, comment: "", orderId: "" });
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateItemData, setUpdateItemData] = useState({ orderId: "", itemId: "", qty: 1, comment: "" });

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
      const response = await axios.get("https://cashman-node.onrender.com/api/editorders");
      const filteredOrders = (response.data || [])
        .map((order) => ({
          ...order,
          items: order.items.filter((item) => item.status !== "deleted"), // Exclude deleted items
        }))
        .filter((order) => order.items.length > 0); // Remove orders with no remaining items
      setOrders(filteredOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get("https://cashman-node.onrender.com/api/products");
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



  const confirmDelete = (orderId, itemId) => {
    setDeleteItemData({ orderId, itemId });
    setShowDeleteModal(true);
  };

  const handleDeleteItem = async () => {
    try {
      const { orderId, itemId } = deleteItemData;
      const response = await axios.post(
        `https://cashman-node.onrender.com/api/editorders/delete-item/${orderId}/${itemId}`
      );
      setOrders(
        (prevOrders) =>
          prevOrders
            .map((order) =>
              order._id === orderId
                ? {
                    ...order,
                    items: order.items.filter(
                      (item) => item._id !== itemId && item.status !== "deleted"
                    ), // Remove deleted items
                  }
                : order
            )
            .filter((order) => order.items.length > 0) // Remove empty orders
      );
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };


  const openUpdateModal = (orderId, item) => {
    setUpdateItemData({ orderId, itemId: item._id, qty: item.qty, comment: item.comment });
    setShowUpdateModal(true);
  };

  const handleUpdateItem = async () => {
    const { orderId, itemId, qty, comment } = updateItemData;
    try {
      const response = await axios.post(
        `https://cashman-node.onrender.com/api/editorders/update-item/${orderId}/${itemId}`,
        { qty, comment }
      );
      alert("Item Updated");
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? response.data.order : order
        )
      );
      setShowUpdateModal(false);
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  return (
    <Container className="m-3 d-flex flex-column gap-3">
      <h2 className="text-center mb-4"> Edit Orders</h2>
      {orders && orders.length > 0 ? (
        <Row>
          {orders
            .filter((order) => order.items && order.items.length > 0)
            .map((order) => (
              <Col key={order._id} sm={12} md={6} lg={4} xl={3} className="mb-4">
                <Card>
                  <Card.Body
                    style={{
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Card.Title> {order.tableNo}</Card.Title>
                    {order.items.map((item) => (
                      <Card.Text key={item._id}>
                        <strong>{item.name}</strong> <br />
                        <strong>Quantity:</strong>
                        <Form.Control
                          type="number"
                          value={item.qty}
readonly
                          onChange={(e) =>
                            setOrders((prevOrders) =>
                              prevOrders.map((prevOrder) =>
                                prevOrder._id === order._id
                                  ? {
                                      ...prevOrder,
                                      items: prevOrder.items.map((prevItem) =>
                                        prevItem._id === item._id
                                          ? { ...prevItem, qty: Number(e.target.value) }
                                          : prevItem
                                      ),
                                    }
                                  : prevOrder
                              )
                            )
                          }
                        />
                        <strong>Comment:</strong>
                        <Form.Control
                          type="text"
                          value={item.comment}
readonly
                          onChange={(e) =>
                            setOrders((prevOrders) =>
                              prevOrders.map((prevOrder) =>
                                prevOrder._id === order._id
                                  ? {
                                      ...prevOrder,
                                      items: prevOrder.items.map((prevItem) =>
                                        prevItem._id === item._id
                                          ? { ...prevItem, comment: e.target.value }
                                          : prevItem
                                      ),
                                    }
                                  : prevOrder
                              )
                            )
                          }
                        />
                          <Button
                        variant="primary"
                        size="sm"
                        className="mt-2 me-2"
                        onClick={() => openUpdateModal(order._id, item)}
                      >
                        Update Item
                      </Button>
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

      <Button variant="success" className="col-sm-2" onClick={() => setShowModal(true)}>
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
                    {order.tableNo}
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
                  setNewItem({ ...newItem, qty: Number(e.target.value) }) // Ensure it's a number
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

   {/* Modal for Updating Items */}
   <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                value={updateItemData.qty}
                onChange={(e) =>
                  setUpdateItemData({ ...updateItemData, qty: Number(e.target.value) })
                }
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Comment</Form.Label>
              <Form.Control
                type="text"
                value={updateItemData.comment}
                onChange={(e) =>
                  setUpdateItemData({ ...updateItemData, comment: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdateItem}>
            Update Item
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

export default EditOrders;
