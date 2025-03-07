import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Button, Form, Offcanvas } from "react-bootstrap";

const Products = () => {
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [modeOfPayment, setModeOfPayment] = useState("Cash");
  const [showCart, setShowCart] = useState(false); // Offcanvas state

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
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
        return [...prevCart, { ...product, category: categoryName, quantity: 1 }];
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
        return [...prevCart, { ...product, category: categoryName, quantity: newQuantity }];
      }
      return prevCart;
    });
  };


  const handleCheckout = async () => {
    console.log(cart)
    const purchaseData = {
      items: cart.map(item => ({
        name: item.name,
        category: item.category, // Ensure category is included
        price: item.price,
        quantity: item.quantity
      })),
      total: parseFloat(cartTotal.toFixed(2)),
      modeOfPayment: modeOfPayment,
      purchaseDate: new Date()
    };

    try {
      await axios.post("http://localhost:5000/api/cart/add", purchaseData);
      alert("Purchase Successful");
      setCart([]); // Clear cart after checkout
      setShowCart(false);
    } catch (error) {
      console.error("Error during checkout:", error);
    }
  };


  const getProductQuantity = (name) => {
    const item = cart.find((product) => product.name === name);
    return item ? item.quantity : 0;
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

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
      <h2 className="text-center mb-4">Products</h2>

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
              {categoryData.products.map((product) => {
                return (
                  <Col key={product._id} sm={12} md={6} lg={4} xl={3} className="mb-4">
                    <Card className="shadow-lg p-3 bg-white rounded">
                      <Card.Body>
                        <Card.Title>{product.name || "No Name"}</Card.Title>
                        <Card.Text>
                          <strong>Price:</strong> ₹{product.price ? product.price.toFixed(2) : "N/A"}
                        </Card.Text>

                        {/* Quantity Control with Category Included */}
                        <div className="d-flex align-items-center">
                          <Button
                            variant="danger"
                            id={`decrease-${product._id}`}
                            onClick={() => updateQuantity(product, -1, categoryData.category)} // Pass category
                          >
                            -
                          </Button>
                          <Form.Control
                            type="number"
                            id={`quantity-${product._id}`}
                            className="text-center mx-2"
                            value={getProductQuantity(product.name)}
                            onChange={(e) => handleQuantityChange(product, e, categoryData.category)} // Pass category
                          />
                          <Button
                            variant="success"
                            id={`increase-${product._id}`}
                            onClick={() => updateQuantity(product, 1, categoryData.category)} // Pass category
                          >
                            +
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}

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
          <Offcanvas.Title>Your Cart</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {cart.map((item, index) => (
            <div key={index} className="mb-3">
              <strong>{item.name}</strong> - ₹{item.price.toFixed(2)} x {item.quantity}
            </div>
          ))}
          <h4>Total: ₹{cartTotal.toFixed(2)}</h4>

          {/* Payment Mode Selection */}
          <Form.Group controlId="modeOfPayment" className="mb-3">
            <Form.Label>Mode of Payment:</Form.Label>
            <div>
              <Form.Check
                type="radio"
                label="Cash"
                name="paymentMode"
                value="Cash"
                checked={modeOfPayment === "Cash"}
                onChange={(e) => setModeOfPayment(e.target.value)}
              />
              <Form.Check
                type="radio"
                label="Credit Card"
                name="paymentMode"
                value="Credit Card"
                checked={modeOfPayment === "Credit Card"}
                onChange={(e) => setModeOfPayment(e.target.value)}
              />
              <Form.Check
                type="radio"
                label="UPI"
                name="paymentMode"
                value="UPI"
                checked={modeOfPayment === "UPI"}
                onChange={(e) => setModeOfPayment(e.target.value)}
              />
            </div>
          </Form.Group>

          {/* Checkout Button */}
          <Button variant="success" size="lg" onClick={handleCheckout}>
            Checkout
          </Button>
        </Offcanvas.Body>
      </Offcanvas>
    </Container>
  );
};

export default Products;
