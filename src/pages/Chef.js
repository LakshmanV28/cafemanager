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

      setOrders(newOrders);
      prevOrdersRef.current = newOrders;
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const getChangedItems = (prevOrders, newOrders) => {
    const addedItems = [];
    const removedItems = [];
    const removedItemDetails = [];

    const prevItemsMap = new Map();
    prevOrders.forEach(order => {
      order.items.forEach(item => {
        prevItemsMap.set(item._id, { ...item, tableNo: order.tableNo, orderTime: order.orderTime });
      });
    });

    const newItemIds = new Set();
    newOrders.forEach(order => {
      order.items.forEach(item => {
        newItemIds.add(item._id);
        if (!prevItemsMap.has(item._id)) {
          addedItems.push(item._id);
        }
      });
    });

    prevItemsMap.forEach((item, id) => {
      if (!newItemIds.has(id)) {
        removedItems.push(id);
        removedItemDetails.push(item); // include full details for rendering
      }
    });

    return { addedItems, removedItems, removedItemDetails };
  };

  const highlightItems = (itemIds) => {
    setHighlightedItems((prev) => {
      const updated = new Set(prev);
      itemIds.forEach(id => updated.add(id));
      return updated;
    });

    setTimeout(() => {
      setHighlightedItems((prev) => {
        const updated = new Set(prev);
        itemIds.forEach(id => updated.delete(id));
        return updated;
      });
    }, 3000);
  };

  const markDeletedItems = (items) => {
    setDeletedItemsMap((prev) => {
      const updated = new Map(prev);
      items.forEach(item => updated.set(item._id, item));
      return updated;
    });
  };

  // Combine current orders and deleted items for rendering
  const combinedOrders = [...orders];

  if (deletedItemsMap.size > 0) {
    // Group deleted items by tableNo
    const tableMap = new Map();

    for (let item of deletedItemsMap.values()) {
      if (!tableMap.has(item.tableNo)) {
        tableMap.set(item.tableNo, {
          tableNo: item.tableNo,
          orderTime: item.orderTime,
          items: [],
        });
      }
      tableMap.get(item.tableNo).items.push(item);
    }

    for (let deleted of tableMap.values()) {
      combinedOrders.push(deleted);
    }
  }

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Chef Orders</h2>
      {combinedOrders.filter(order => order.items.length > 0).length === 0 ? (
        <h4 className="text-center text-muted">No orders available</h4>
      ) : (
        <Row>
          {combinedOrders
            .filter(order => order.items.length > 0)
            .map((order, index) => (
              <Col key={index} sm={12} md={6} lg={4} xl={3} className="mb-4">
                <Card className="shadow-lg p-3 bg-white rounded h-100">
                  <Card.Body>
                    <Card.Title>Table {order.tableNo}</Card.Title>
                    {order.items.map((item, i) => {
                      const isNew = highlightedItems.has(item._id);
                      const isDeleted = deletedItemsMap.has(item._id);
                      const color = isDeleted ? "red" : isNew ? "green" : "black";

                      return (
                        <Card.Text key={item._id} style={{ color }}>
                          <strong>Name:</strong> {item.name} <br />
                          <strong>Quantity:</strong> {item.qty} <br />
                          <strong>Comment:</strong> {item.comment || "No comment"}
                        </Card.Text>
                      );
                    })}
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
