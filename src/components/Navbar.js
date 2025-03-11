import { Navbar, Nav, Container } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

export default function NavigationBar() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">Cafe Manager</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {/* Show navigation links based on role */}
            {token && role === "Bill Counter" && (
              <>
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/transactions">Transactions</Nav.Link>
                <Nav.Link as={Link} to="/closing">Closing</Nav.Link>
                <Nav.Link as={Link} to="/reciepe">Recipe</Nav.Link>
                <Nav.Link as={Link} to="/billcounter">Bill Counter</Nav.Link>
                <Nav.Link as={Link} to="/inventory">Inventory</Nav.Link>
              </>
            )}

            {token && role === "Captain" && (
              <>
                <Nav.Link as={Link} to="/captain">Captain</Nav.Link>
                <Nav.Link as={Link} to="/editorders">Edit Orders</Nav.Link>
              </>
            )}

            {token && role === "Chef" && (
              <>
                <Nav.Link as={Link} to="/chef">Chef</Nav.Link>
              </>
            )}

            {/* Logout button (only if user is logged in) */}
            {token && (
              <Nav.Link onClick={handleLogout} style={{ cursor: "pointer" }}>Logout</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
