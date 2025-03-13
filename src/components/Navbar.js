import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

const NavBar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
      <Navbar.Brand as={Link} to="/" style={{ display: "flex", flexDirection: "column", alignItems: "center", textDecoration: "none" }}>
  <h1 style={{ color: "#f8b400", fontSize: "1.2rem", margin: "0", fontWeight: "bold" }}>
    CaféSync
  </h1>
  <h6 style={{ color: "#ffffff", fontSize: "1rem", marginTop: "2px", fontWeight: "normal" }}>
    by DeuxForge
  </h6>
</Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {user && user.role === "admin" && (
              <>
                <Nav.Link as={Link} to="/dashboard">
                  Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/transactions">
                  Transactions
                </Nav.Link>
                <Nav.Link as={Link} to="/closing">
                  Closing
                </Nav.Link>
                <Nav.Link as={Link} to="/billcounter">
                  Bill Counter
                </Nav.Link>
                <Nav.Link as={Link} to="/inventory">
                  Inventory
                </Nav.Link>
              </>
            )}

            {user && user.role === "captain" && (
              <>
                <Nav.Link as={Link} to="/captain">
                  Captain
                </Nav.Link>
                <Nav.Link as={Link} to="/editorders">
                  Edit Orders
                </Nav.Link>
              </>
            )}

            {user && user.role === "chef" && (
              <>
                <Nav.Link as={Link} to="/chef">
                  Chef
                </Nav.Link>
                <Nav.Link as={Link} to="/reciepe">
                  Recipe
                </Nav.Link>
              </>
            )}
          </Nav>

          {user ? (
            <Button variant="outline-light" onClick={onLogout}>
              Logout
            </Button>
          ) : (
            <Button variant="outline-light" onClick={() => navigate("/")}>
              Login
            </Button>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
