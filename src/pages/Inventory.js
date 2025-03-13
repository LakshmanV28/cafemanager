import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Card, Button, Form, Modal, Row, Col } from "react-bootstrap";

const Inventory = () => {
    const [inventory, setInventory] = useState([]);
    const [filteredInventory, setFilteredInventory] = useState([]); // For search
    const [searchQuery, setSearchQuery] = useState(""); // Search input
    const [showModal, setShowModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState(null); // For updating ingredient
    const [ingredientToDelete, setIngredientToDelete] = useState(null); // For delete confirmation
    const [newIngredient, setNewIngredient] = useState({ name: "", quantity: 0, unit: "", price: 0 });

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const res = await axios.get("https://cashman-node.onrender.com/api/inventory");
            setInventory(res.data);
            setFilteredInventory(res.data); // Initialize filtered data
        } catch (error) {
            console.error("Error fetching inventory:", error);
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        const filtered = inventory.filter((item) =>
            item.name.toLowerCase().includes(query)
        );
        setFilteredInventory(filtered);
    };

    const handleAddIngredient = async () => {
        try {
            await axios.post("https://cashman-node.onrender.com/api/inventory/add", newIngredient);
            fetchInventory();
            setShowModal(false);
        } catch (error) {
            console.error("Error adding ingredient:", error);
        }
    };

    const handleDelete = async () => {
        if (!ingredientToDelete) return;
        try {
            await axios.delete(`https://cashman-node.onrender.com/api/inventory/delete/${ingredientToDelete}`);
            fetchInventory();
            setShowDeleteModal(false);
        } catch (error) {
            console.error("Error deleting ingredient:", error);
        }
    };

    const handleUpdate = async () => {
        if (!selectedIngredient) return;
        try {
            await axios.put(`https://cashman-node.onrender.com/api/inventory/update/${selectedIngredient._id}`, selectedIngredient);
            fetchInventory();
            setShowUpdateModal(false);
        } catch (error) {
            console.error("Error updating ingredient:", error);
        }
    };

    const openUpdateModal = (ingredient) => {
        setSelectedIngredient({ ...ingredient }); // Copy ingredient details
        setShowUpdateModal(true);
    };

    const openDeleteModal = (id) => {
        setIngredientToDelete(id);
        setShowDeleteModal(true);
    };

    const totalExpense = filteredInventory.reduce((sum, item) => sum + (item.quantity * (item.price || 0)), 0);

    return (
        <Container className="mt-4">
            <h2 className="text-center mb-4">Inventory Management</h2>

            {/* Search Bar */}
            <Form.Control
                type="text"
                placeholder="Search ingredients..."
                value={searchQuery}
                onChange={handleSearch}
                className="mb-3"
            />

            {/* Add Ingredient Button */}
            <div className="text-center mb-4">
                <Button variant="primary" onClick={() => setShowModal(true)}>Add Ingredient</Button>
            </div>

            <Row>
                {filteredInventory.map((item) => (
                    <Col key={item._id} sm={12} md={6} lg={4} xl={3} className="mb-4">
                        <Card className="shadow-lg p-3 bg-white rounded">
                            <Card.Body>
                                <Card.Title>{item.name}</Card.Title>
                                <Card.Text>
                                    <strong>Quantity:</strong> {item.quantity} {item.unit}<br />
                                    <strong>Price per Unit:</strong> ₹{item.price ? item.price.toFixed(2) : "N/A"}<br />
                                    <strong>Total Cost:</strong> ₹{item.price ? (item.quantity * item.price).toFixed(2) : "N/A"}
                                </Card.Text>
                                <Button variant="warning" className="me-2" onClick={() => openUpdateModal(item)}>
                                    Update
                                </Button>
                                <Button variant="danger" onClick={() => openDeleteModal(item._id)}>
                                    Delete
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Total Expense */}
            <h4 className="text-center mt-4">Total Inventory Stock Amount: ₹{totalExpense.toFixed(2)}</h4>

            {/* Modal for Adding Ingredient */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Ingredient</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Quantity</Form.Label>
                            <Form.Control
                                type="number"
                                onChange={(e) => setNewIngredient({ ...newIngredient, quantity: parseFloat(e.target.value) || 0 })}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Unit</Form.Label>
                            <Form.Control
                                type="text"
                                onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Price per Unit</Form.Label>
                            <Form.Control
                                type="number"
                                onChange={(e) => setNewIngredient({ ...newIngredient, price: parseFloat(e.target.value) || 0 })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleAddIngredient}>Add Ingredient</Button>
                </Modal.Footer>
            </Modal>

            {/* Modal for Updating Ingredient */}
            <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Update Ingredient</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={selectedIngredient?.name || ""}
                                onChange={(e) => setSelectedIngredient({ ...selectedIngredient, name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Quantity</Form.Label>
                            <Form.Control
                                type="number"
                                value={selectedIngredient?.quantity || ""}
                                onChange={(e) => setSelectedIngredient({ ...selectedIngredient, quantity: parseFloat(e.target.value) || 0 })}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Unit</Form.Label>
                            <Form.Control
                                type="text"
                                value={selectedIngredient?.unit || ""}
                                onChange={(e) => setSelectedIngredient({ ...selectedIngredient, unit: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Price per Unit</Form.Label>
                            <Form.Control
                                type="number"
                                value={selectedIngredient?.price || ""}
                                onChange={(e) => setSelectedIngredient({ ...selectedIngredient, price: parseFloat(e.target.value) || 0 })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>Cancel</Button>
                    <Button variant="success" onClick={handleUpdate}>Update</Button>
                </Modal.Footer>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete this ingredient?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDelete}>Delete</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Inventory;
