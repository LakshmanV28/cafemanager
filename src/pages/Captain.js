import React, { useEffect, useState } from "react";
import axios from "axios";

import { imagelist } from "../assets/image";

import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Image,
  Form,
  Offcanvas,
  Modal,
} from "react-bootstrap";
const Captain = () => {
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [tableNo, setTableNo] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        "https://cashman-node.onrender.com/api/products"
      );
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const toggleCommentBox = (productName) => {
    setShowCommentBox((prev) => ({
      ...prev,
      [productName]: !prev[productName],
    }));
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
        return [
          ...prevCart,
          { ...product, category: categoryName, quantity: 1, comment: "" },
        ];
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
            item.name === product.name
              ? { ...item, quantity: newQuantity }
              : item
          )
          .filter((item) => item.quantity > 0);
      } else if (newQuantity > 0) {
        return [
          ...prevCart,
          {
            ...product,
            category: categoryName,
            quantity: newQuantity,
            comment: "",
          },
        ];
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
      alert("Please select a table!");
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
      await axios.post(
        "https://cashman-node.onrender.com/api/chef/add",
        orderData
      );
      alert("Order Placed Successfully!");
      setCart([]);
      setShowCart(false);
      setTableNo("");
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

  const tableButtons = Array.from({ length: 8 }, (_, i) => i + 1);


  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">· Captain Booking ·</h2>

      {/* 🔍 Search Bar */}
      <Form className="mb-4">
        <Form.Control
          type="text"
          placeholder="Search for products..."
          style={{
            border: "none",
            background: "transparent",
            outline: "none",
            borderBottom: "5px solid black",
            borderRadius: "5px",
            padding: "8px",
            minHeight: "60px",
            width: "100%",
          }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Form>

      {filteredCategories.length === 0 ? (
        <h4 className="text-center text-muted">No products found</h4>
      ) : (
        filteredCategories.map((categoryData, index) => (
          <div key={index} className="d-flex flex-column gap-4 mb-5">
            <h3 className="text-center">{categoryData.category}</h3>
            <Row>
              {categoryData.products.map((product, index) => {
                // Get all images for the product's category
                const productImages = imagelist.filter(
                  (img) => img.cat === categoryData.category
                );

                // Assign a unique image per product, looping if necessary
                const productImage = productImages.length > 0
                  ? productImages[index % productImages.length].img
                  : "default_image_url"; // Replace with a real default image

                return (
                  <Col key={product._id}   sm={6} md={4} lg={3} className="mb-4">
                    <Card className="border border-dark rounded position-relative">
                      {/* Top Right Comment Button */}
                      <div className="d-flex justify-content-end p-2">
                        <Button
                          variant="dark"
                          title="Cooking Instructions..."
                          onClick={() => toggleCommentBox(product.name)}
                        >
                          📝
                        </Button>
                      </div>

                      {/* Display One Image per Product */}
                      <div className="d-flex justify-content-center p-2">
                        <Image
                          src={productImage}
                          fluid
                          height={120}
                          width={120}
                          style={{
                            borderRadius: "10px",
                          }}
                          alt={`Product Image`}
                        />
                      </div>

                      {/* Card Body */}
                      <Card.Body className="d-flex flex-column align-items-center text-center gap-2">
                        <Card.Title style={{ minHeight: "40px" }}>
                          {product.name || "No Name"}
                        </Card.Title>

                        <div className="d-flex gap-2 align-items-center">
                          {/* Quantity Input */}
                          <Button variant="success" onClick={() => updateQuantity(product, 1, categoryData.category)}>
                            +
                          </Button>
                          <Form.Control
                            type="number"
                            className="text-center mx-2"
                            value={getProductQuantity(product.name)}
                            onChange={(e) => handleQuantityChange(product, e, categoryData.category)}
                          />
                                                    <br/>

                          {/* Quantity Control Buttons */}
                       
                          <Button variant="danger" onClick={() => updateQuantity(product, -1, categoryData.category)}>
                            -
                          </Button>
                        </div>

                        {/* Conditionally shown Comment Input */}
                        {showCommentBox[product.name] && (
                          <div>
                            <label>Cooking Instructions:</label>
                          <Form.Control
                            className="mt-2 border border-dark"
                            style={{ minHeight: "60px" }}
                            type="text"
                            value={cart.find((item) => item.name === product.name)?.comment || ""}
                            onChange={(e) => handleCommentChange(product.name, e)}
                          />
                          </div>
                        )}
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
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: "1000",
          }}
        >
          <Button variant="primary" size="lg" onClick={() => setShowCart(true)}>
            View Cart ({cart.reduce((total, item) => total + item.quantity, 0)}{" "}
            items)
          </Button>
        </div>
      )}

      <Button
        variant="dark"
        onClick={scrollToTop}
        className={`position-fixed bottom-3 end-3 p-3 rounded-circle ${isVisible ? "d-block" : "d-none"
          }`}
        style={{
          right: "20px",
          bottom: "20px",
          zIndex: 1000,
          boxShadow: "0px 0px 10px rgba(0,0,0,0.2)",
        }}
      >
        ⬆
      </Button>

      {/* 🛒 Offcanvas for Cart */}
      <Offcanvas
        show={showCart}
        onHide={() => setShowCart(false)}
        placement="end"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Your Order</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="mb-3">
            <strong>Select Table:</strong>
            <div className="d-flex flex-wrap mt-2 gap-2">
              {tableButtons.map((num) => (
                <Button
                  key={num}
                  variant={tableNo === `Table ${num}` ? "dark" : "light"}
                  className="w-25"
                  onClick={() => setTableNo(`Table ${num}`)}
                >
                  Table {num}
                </Button>
              ))}
            </div>
          </div>

          {cart.map((item, index) => (
            <div key={index} className="mb-3">
              <strong>{item.name}</strong> - x {item.quantity}
              <p className="text-muted">Comment: {item.comment || "None"}</p>
            </div>
          ))}

          <Button variant="success" size="lg" onClick={placeOrder}>
            Place Order
          </Button>
        </Offcanvas.Body>
      </Offcanvas>
    </Container>
  );
};

export default Captain;
