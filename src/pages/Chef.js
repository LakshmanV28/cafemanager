import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card } from "react-bootstrap";
import addSoundFile from "../assets/Notification-chime-sound-effect.mp3";
import deleteSoundFile from "../assets/mixkit-wrong-long-buzzer-954.wav";

const Chef = () => {
  const [orders, setOrders] = useState([]);
  const [highlightedItems, setHighlightedItems] = useState(new Set());
  const [deletedItemsMap, setDeletedItemsMap] = useState(new Map());
  const prevOrdersRef = useRef([]);

  const playSound = (type) => {
    const audio = new Audio(type === "add" ? addSoundFile : deleteSoundFile);
    audio.play();
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get("https://cashman-node.onrender.com/api/chef");
      const newOrders = response.data;

      const { addedItems, removedItems, removedItemDetails } = getChangedItems(
        prevOrdersRef.current,
        newOrders
      );

      if (addedItems.length > 0) {
        playSound("add");
        highlightItems(addedItems);
      }

      if (removedItems.length > 0) {
        playSound("delete");
        markDeletedItems(removedItemDetails);
      }

      setOrders((prev) => [...prev, ...newOrders]);
      prevOrdersRef.current = [...prevOrdersRef.current, ...newOrders];
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const getChangedItems = (prevOrders, newOrders) => {
    const addedItems = [];
    const removedItems = [];
    const removedItemDetails = [];

    const prevItemsMap = new Map();
    prevOrders.forEach((order) => {
      order.items.forEach((item) => {
        prevItemsMap.set(item._id, { ...item, tableNo: order.tableNo, orderTime: order.orderTime });
      });
    });

    const newItemIds = new Set();
    newOrders.forEach((order) => {
      order.items.forEach((item) => {
        newItemIds.add(item._id);
        if (!prevItemsMap.has(item._id)) {
          addedItems.push(item._id);
        }
      });
    });

    prevItemsMap.forEach((item, id) => {
      if (!newItemIds.has(id)) {
        removedItems.push(id);
        removedItemDetails.push(item);
      }
    });

    return { addedItems, removedItems, removedItemDetails };
  };

  const highlightItems = (itemIds) => {
    setHighlightedItems((prev) => {
      const updated = new Set(prev);
      itemIds.forEach((id) => updated.add(id));
      return updated;
    });

    setTimeout(() => {
      setHighlightedItems((prev) => {
        const updated = new Set(prev);
        itemIds.forEach((id) => updated.delete(id));
        return updated;
      });
    }, 5000);
  };

  const markDeletedItems = (items) => {
    setDeletedItemsMap((prev) => {
      const updated = new Map(prev);
      items.forEach((item) => updated.set(item._id, item));
      return updated;
    });
  };

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Chef Orders</h2>
      {orders.length === 0 ? (
        <h4 className="text-center text-muted">No orders available</h4>
      ) : (
        <Row className="flex-column"> {/* Orders stacked one after another */}
          {orders.map((order, index) => (
            <Col key={index} className="mb-4">
              <Card
                className="shadow-lg p-3 rounded h-100"
                style={{
                  backgroundColor: deletedItemsMap.has(order.items[0]?._id)
                    ? "#ffcccc"
                    : highlightedItems.has(order.items[0]?._id)
                    ? "#ccffcc"
                    : "#ffffff",
                }}
              >
                <Card.Body>
                  <Card.Title>Table {order.tableNo}</Card.Title>
                  {order.items.map((item) => (
                    <Card.Text key={item._id}>
                      <strong>Name:</strong> {item.name} <br />
                      <strong>Quantity:</strong> {item.qty} <br />
                      <strong>Comment:</strong> {item.comment || "No comment"}
                    </Card.Text>
                  ))}
                </Card.Body>
                <Card.Footer>
                  <small className="text-muted">
                    Order Time: {new Date(order.orderTime).toLocaleString()}
                  </small>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Chef;
