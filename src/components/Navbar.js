import { Navbar, Nav, Container } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

export default function NavigationBar() {
  const token = localStorage.getItem("token");
  const email = localStorage.getItem("email") || ""; // Ensure it's a string
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    navigate("/", { replace: true });
    window.location.reload();
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Cafetarian by <h6><b>by DeuxForge</b></h6>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {token && email && (
              <>
                {/* Admin Navigation (if email contains 'admin') */}
                {email.toLowerCase().includes("admin") && (
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
                    <Nav.Link as={Link} to="/reciepe">
                      Recipe
                    </Nav.Link>
                    <Nav.Link as={Link} to="/billcounter">
                      Bill Counter
                    </Nav.Link>
                    <Nav.Link as={Link} to="/inventory">
                      Inventory
                    </Nav.Link>
                  </>
                )}

                {/* Captain Navigation (if email contains 'captain') */}
                {email.toLowerCase().includes("captain") && (
                  <>
                    <Nav.Link as={Link} to="/captain">
                      Captain
                    </Nav.Link>
                    <Nav.Link as={Link} to="/editorders">
                      Edit Orders
                    </Nav.Link>
                  </>
                )}

                {/* Chef Navigation (if email contains 'chef') */}
                {email.toLowerCase().includes("chef") && (
                  <>
                    <Nav.Link as={Link} to="/chef">
                      Chef
                    </Nav.Link>
                  </>
                )}

                {/* Logout button */}
                <Nav.Link onClick={handleLogout} style={{ cursor: "pointer" }}>
                  Logout
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
