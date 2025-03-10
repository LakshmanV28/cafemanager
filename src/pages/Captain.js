import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Button, Form, Offcanvas, Modal } from "react-bootstrap";

const Products = () => {
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [tableNo, setTableNo] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", category: "" });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("https://cashman-node.onrender.com/api/products");
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const updateQuantity = (product, amount, categoryName) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.name === product.name);
      if (existingItem) {
        return prevCart
          .map((item) =>
            item.name === product.name
              ? { ...item, quantity: Math.max(0, item.quantity + amount) }
              : item
          )
          .filter((item) => item.quantity > 0);
      } else if (amount > 0) {
        return [...prevCart, { ...product, category: categoryName, quantity: 1, comment: "" }];
      }
      return prevCart;
    });
  };

  const handleQuantityChange = (product, event, categoryName) => {
    const newQuantity = parseInt(event.target.value, 10) || 0;
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.name === product.name);
      if (existingItem) {
        return prevCart
          .map((item) =>
            item.name === product.name ? { ...item, quantity: newQuantity } : item
          )
          .filter((item) => item.quantity > 0);
      } else if (newQuantity > 0) {
        return [...prevCart, { ...product, category: categoryName, quantity: newQuantity, comment: "" }];
      }
      return prevCart;
    });
  };

  const handleCommentChange = (productName, event) => {
    const comment = event.target.value;
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.name === productName ? { ...item, comment } : item
      )
    );
  };

  const placeOrder = async () => {
    if (!tableNo) {
      alert("Please enter table number!");
      return;
    }

    const orderData = {
      tableNo,
      items: cart.map((item) => ({
        name: item.name,
        qty: item.quantity,
        comment: item.comment || "",
      })),
      orderTime: new Date(),
    };

    try {
      await axios.post("https://cashman-node.onrender.com/api/chef/add", orderData);
    // console.log(orderData);
    
      alert("Order Placed Successfully!");
      setCart([]); // Clear cart after placing order
      setShowCart(false);
    } catch (error) {
      console.error("Error placing order:", error);
    }
  };

  const getProductQuantity = (name) => {
    const item = cart.find((product) => product.name === name);
    return item ? item.quantity : 0;
  };

  const filteredCategories = categories
    .map((category) => ({
      ...category,
      products: category.products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.products.length > 0);

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Captain Booking</h2>

      {/* 🔍 Search Bar */}
      <Form className="mb-4">
        <Form.Control
          type="text"
          placeholder="Search for products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Form>

      {filteredCategories.length === 0 ? (
        <h4 className="text-center text-muted">No products found</h4>
      ) : (
        filteredCategories.map((categoryData, index) => (
          <div key={index} className="mb-5">
            <h3 className="text-center">{categoryData.category}</h3>
            <Row>
              {categoryData.products.map((product) => (
                <Col key={product._id} sm={12} md={6} lg={4} xl={3} className="mb-4">
                  <Card className="shadow-lg p-3 bg-white rounded">
                    <Card.Body>
                      <Card.Title>{product.name || "No Name"}</Card.Title>

                      {/* Quantity Control */}
                      <div className="d-flex align-items-center">
                        <Button
                          variant="danger"
                          id={`decrease-${product._id}`}
                          onClick={() => updateQuantity(product, -1, categoryData.category)}
                        >
                          -
                        </Button>
                        <Form.Control
                          type="number"
                          id={`quantity-${product._id}`}
                          className="text-center mx-2"
                          value={getProductQuantity(product.name)}
                          onChange={(e) => handleQuantityChange(product, e, categoryData.category)}
                        />
                        <Button
                          variant="success"
                          id={`increase-${product._id}`}
                          onClick={() => updateQuantity(product, 1, categoryData.category)}
                        >
                          +
                        </Button>
                      </div>

                      {/* Comment Feature */}
                      <Form.Control
                        className="mt-2"
                        type="text"
                        placeholder="Add a comment..."
                        value={cart.find((item) => item.name === product.name)?.comment || ""}
                        onChange={(e) => handleCommentChange(product.name, e)}
                      />
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        ))
      )}

      {/* 🛒 View Cart Button */}
      {cart.length > 0 && (
        <div className="text-center mt-4">
          <Button variant="primary" size="lg" onClick={() => setShowCart(true)}>
            View Cart ({cart.reduce((total, item) => total + item.quantity, 0)} items)
          </Button>
        </div>
      )}

      {/* 🛒 Offcanvas for Cart */}
      <Offcanvas show={showCart} onHide={() => setShowCart(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Your Order</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form.Group className="mb-3">
            <Form.Label>Table No:</Form.Label>
            <Form.Control
              type="text"
              value={tableNo}
              onChange={(e) => setTableNo(e.target.value)}
              placeholder="Enter Table No."
            />
          </Form.Group>

          {cart.map((item, index) => (
            <div key={index} className="mb-3">
              <strong>{item.name}</strong> - x {item.quantity}
              <p className="text-muted">Comment: {item.comment || "None"}</p>
            </div>
          ))}

          {/* Place Order Button */}
          <Button variant="success" size="lg" onClick={placeOrder}>
            Place Order
          </Button>
        </Offcanvas.Body>
      </Offcanvas>
    </Container>
  );
};

export default Products;
