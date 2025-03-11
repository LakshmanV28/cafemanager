import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Card,
  Form,
  Row,
  Col,
  Button
} from "react-bootstrap";
import {
  format,
  parseISO,
  isAfter,
  isBefore,
  isEqual
} from "date-fns";
import {
  DayPicker
} from "react-day-picker";
import "react-day-picker/dist/style.css";

const Transactions = () => {
  const [ordersByDate, setOrdersByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get("https://cashman-node.onrender.com/api/orders");
      setOrdersByDate(groupByDate(response.data));
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const groupByDate = (orders) => {
    if (!orders || typeof orders !== "object") return {};

    return Object.entries(orders).reduce((acc, [date, orderList]) => {
      const formattedDate = format(parseISO(date), "yyyy-MM-dd");
      acc[formattedDate] = orderList.map((order) => {
        const itemsWithTotal = order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: (item.price * item.quantity).toFixed(2),
        }));

        return {
          _id: order._id,
          modeOfPayment: order.modeOfPayment,
          total: order.total.toFixed(2),
          purchaseTime: format(parseISO(order.purchaseDate), "HH:mm:ss"),
          items: itemsWithTotal,
        };
      });

      return acc;
    }, {});
  };

  const isWithinRange = (dateStr) => {
    const date = parseISO(dateStr);
    const afterStart = !startDate || isAfter(date, startDate) || isEqual(date, startDate);
    const beforeEnd = !endDate || isBefore(date, endDate) || isEqual(date, endDate);
    return afterStart && beforeEnd;
  };

  const filteredOrders = (() => {
    if (selectedDate) {
      const formatted = format(selectedDate, "yyyy-MM-dd");
      return { [formatted]: ordersByDate[formatted] || [] };
    }

    return Object.entries(ordersByDate).reduce((acc, [date, orders]) => {
      if (isWithinRange(date)) {
        acc[date] = orders;
      }
      return acc;
    }, {});
  })();

  const calculateTotalSales = () => {
    return Object.values(filteredOrders)
      .flat()
      .reduce((sum, order) => sum + parseFloat(order.total), 0)
      .toFixed(2);
  };

  const clearAllFilters = () => {
    setSelectedDate(null);
    setStartDate(null);
    setEndDate(null);
  };

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Orders</h2>

      {/* Date Filters */}
      <Row className="mb-3 text-center align-items-start">
        <Col>
          <Form.Label>Specific Date:</Form.Label>
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              setSelectedDate(date);
              setStartDate(null);
              setEndDate(null);
            }}
          />
        </Col>

        <Col>
          <Form.Label>Start Date:</Form.Label>
          <DayPicker
            mode="single"
            selected={startDate}
            onSelect={(date) => {
              setStartDate(date);
              setSelectedDate(null);
            }}
          />
        </Col>

        <Col>
          <Form.Label>End Date:</Form.Label>
          <DayPicker
            mode="single"
            selected={endDate}
            onSelect={(date) => {
              setEndDate(date);
              setSelectedDate(null);
            }}
          />
        </Col>

        <Col xs="auto">
          <Button variant="secondary" className="mt-4" onClick={clearAllFilters}>
            Clear Filters
          </Button>
        </Col>
      </Row>

      {/* Total Sales Display */}
      {Object.entries(filteredOrders).length > 0 && (
        <h5 className="text-center text-success mb-4">
          Total Sales: ₹{calculateTotalSales()}
        </h5>
      )}

      {/* Orders List */}
      {Object.entries(filteredOrders).length === 0 ? (
        <p className="text-center">No orders found for the selected date or range.</p>
      ) : (
        Object.entries(filteredOrders).map(([date, orders]) => (
          <Card className="mb-4 p-3" key={date}>
            <h4 className="text-center mb-3">Orders on {date}</h4>
            {orders.map((order) => (
              <Card key={order._id} className="mb-3 p-3">
                <h5>Order ID: {order._id}</h5>
                <p><strong>Mode of Payment:</strong> {order.modeOfPayment}</p>
                <p><strong>Total:</strong> ₹{order.total}</p>
                <p><strong>Purchase Time:</strong> {order.purchaseTime}</p>
                <Card className="p-2">
                  <h6>Items:</h6>
                  {order.items.map((item, index) => (
                    <p key={index}>
                      {item.name} - {item.quantity} x ₹{item.price} = ₹{item.total}
                    </p>
                  ))}
                </Card>
              </Card>
            ))}
          </Card>
        ))
      )}
    </Container>
  );
};

export default Transactions;
