import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Card, Row, Col } from "react-bootstrap";

const Closing = () => {
    const [inventory, setInventory] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [orders, setOrders] = useState([]);
    const [remainingInventory, setRemainingInventory] = useState([]);

    useEffect(() => {
        fetchInventory();
        fetchRecipes();
        fetchOrders();
    }, []);

    useEffect(() => {
        if (orders.length > 0 && inventory.length > 0 && recipes.length > 0) {
            calculateRemainingInventory();
        }
    }, [orders, inventory, recipes]);

    const fetchInventory = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/inventory");
            
            setInventory(res.data);
        } catch (error) {
            console.error("Error fetching inventory:", error);
        }
    };

    const fetchRecipes = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/reciepes");                        
            setRecipes(res.data);
        } catch (error) {
            console.error("Error fetching recipes:", error);
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/orders");
    
            let allOrders = [];
    
            // Flatten the orders data
            Object.values(res.data).forEach(orderArray => {
                allOrders = allOrders.concat(orderArray);
            });
    
            setOrders(allOrders);
        } catch (error) {
            console.error("Error fetching orders:", error);
            setOrders([]);
        }
    };
    
    

    

    const calculateRemainingInventory = () => {
        if (!orders || orders.length === 0 || !inventory || inventory.length === 0 || !recipes || recipes.length === 0) {
            console.warn("Insufficient data to calculate inventory.");
            return;
        }
    
        let inventoryMap = new Map();
    
        // Initialize inventoryMap with current stock
        inventory.forEach(item => {
            inventoryMap.set(item.name, { ...item });
        });
    
        // Iterate over each order and reduce the inventory
        orders.forEach(order => {
            order.items.forEach(orderItem => {
                // Find the recipe for the ordered item
                const recipe = recipes.find(r => r.productName === orderItem.name);
                if (!recipe) return;
    
                recipe.ingredients.forEach(ingredient => {
                    if (inventoryMap.has(ingredient.name)) {
                        let currentStock = inventoryMap.get(ingredient.name);
                        let totalUsedQuantity = ingredient.quantityToBeUsed * orderItem.quantity;
                        
                        // Reduce stock, ensuring it doesn't go negative
                        let updatedQuantity = Math.max(0, currentStock.quantity - totalUsedQuantity);
                        
                        inventoryMap.set(ingredient.name, { ...currentStock, quantity: updatedQuantity });
                    }
                });
            });
        });
    
        // Convert Map to Array for UI display
        setRemainingInventory(Array.from(inventoryMap.values()));
    };
    

    return (
        <Container className="mt-4">
            <h2 className="text-center mb-4">Remaining Inventory</h2>
            <Row>                
                {remainingInventory.map((item) => (
                    <Col key={item._id} sm={12} md={6} lg={4} xl={3} className="mb-4">
                        <Card className="shadow-lg p-3 bg-white rounded">
                            <Card.Body>
                                <Card.Title>{item.name}</Card.Title>
                                <Card.Text>
                                    <strong>Quantity:</strong> {item.quantity} {item.unit}<br />
                                    {/* <strong>Price per Unit:</strong> ₹{item.price ? item.price.toFixed(2) : "N/A"}<br />
                                    <strong>Total Cost:</strong> ₹{item.price ? (item.quantity * item.price).toFixed(2) : "N/A"} */}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default Closing;
