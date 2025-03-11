import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Form, Button, Card, Alert } from "react-bootstrap";

export default function Login({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("https://cashman-node.onrender.com/api/auth/login", { email, password });
      const { token } = res.data;

      if (!token) {
        setError("Invalid response from server!");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("email", email); // ✅ Store email in localStorage
      setToken(token);

      // Redirect based on email
      if (email.toLowerCase() === "admin@cafe.com") {
        navigate("/dashboard");
      } else if (email.toLowerCase() === "captain@cafe.com") {
        navigate("/captain");
      } else if (email.toLowerCase() === "chef@cafe.com") {
        navigate("/chef");
      } else {
        setError("Unauthorized email!");
      }
    } catch (err) {
      setError("Invalid credentials!");
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
      <Card style={{ width: "400px", padding: "20px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
        <Card.Body>
          <h2 className="text-center">Login</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button type="submit" variant="primary" className="w-100">
              Login
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
