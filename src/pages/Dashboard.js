import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Table, Card, Row, Col, Button } from "react-bootstrap";
import { format, parseISO, isWithinInterval } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

const Dashboard = () => {
  const [ordersByDate, setOrdersByDate] = useState({});
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [specificDate, setSpecificDate] = useState(null);

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

      let totalRevenue = 0;
      let productSales = {};

      orderList.forEach((order) => {
        totalRevenue += order.total;
        order.items.forEach((item) => {
          if (!productSales[item.name]) {
            productSales[item.name] = {
              name: item.name,
              category: item.category || "Uncategorized",
              totalQuantitySold: 0,
              totalSales: 0,
            };
          }
          productSales[item.name].totalQuantitySold += item.quantity;
          productSales[item.name].totalSales += item.price * item.quantity;
        });
      });

      acc[formattedDate] = {
        totalRevenue,
        topSellingProducts: Object.values(productSales).sort(
          (a, b) => b.totalQuantitySold - a.totalQuantitySold
        ),
      };

      return acc;
    }, {});
  };

  const filterOrdersByDateRange = () => {
    if (!startDate || !endDate) return { totalRevenue: 0, topSellingProducts: [] };

    let totalRevenue = 0;
    let productSales = {};

    Object.entries(ordersByDate).forEach(([date, data]) => {
      const orderDate = parseISO(date);
      if (isWithinInterval(orderDate, { start: startDate, end: endDate })) {
        totalRevenue += data.totalRevenue;

        data.topSellingProducts.forEach((product) => {
          if (!productSales[product.name]) {
            productSales[product.name] = { ...product };
          } else {
            productSales[product.name].totalQuantitySold += product.totalQuantitySold;
            productSales[product.name].totalSales += product.totalSales;
          }
        });
      }
    });

    return {
      totalRevenue,
      topSellingProducts: Object.values(productSales).sort(
        (a, b) => b.totalQuantitySold - a.totalQuantitySold
      ),
    };
  };

  const filterOrdersBySpecificDate = () => {
    if (!specificDate) return { totalRevenue: 0, topSellingProducts: [] };
    const formatted = format(specificDate, "yyyy-MM-dd");
    return ordersByDate[formatted] || { totalRevenue: 0, topSellingProducts: [] };
  };

  const filteredByDate = filterOrdersBySpecificDate();
  const filteredByRange = filterOrdersByDateRange();

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSpecificDate(null);
  };

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Dashboard</h2>

      <Row className="mb-4 text-center">
        <Col md={4}>
          <h5>Select Specific Date</h5>
          <DayPicker
            mode="single"
            selected={specificDate}
            onSelect={(date) => {
              setSpecificDate(date);
              setStartDate(null);
              setEndDate(null);
            }}
          />
        </Col>

        <Col md={4}>
          <h5>Select Start Date</h5>
          <DayPicker
            mode="single"
            selected={startDate}
            onSelect={(date) => {
              setStartDate(date);
              setSpecificDate(null);
            }}
          />
        </Col>

        <Col md={4}>
          <h5>Select End Date</h5>
          <DayPicker
            mode="single"
            selected={endDate}
            onSelect={(date) => {
              setEndDate(date);
              setSpecificDate(null);
            }}
          />
        </Col>
      </Row>

      <div className="text-center mb-3">
        <Button variant="secondary" onClick={clearFilters}>
          Clear Filters
        </Button>
      </div>

      {specificDate && (
        <Card className="p-3 mb-4 text-center">
          <h4>
            Revenue on {format(specificDate, "yyyy-MM-dd")}: ₹
            {filteredByDate.totalRevenue.toFixed(2)}
          </h4>
        </Card>
      )}

      {startDate && endDate && (
        <Card className="p-3 mb-4 text-center">
          <h4>
            Revenue from {format(startDate, "yyyy-MM-dd")} to{" "}
            {format(endDate, "yyyy-MM-dd")}: ₹
            {filteredByRange.totalRevenue.toFixed(2)}
          </h4>
        </Card>
      )}

      {(specificDate || (startDate && endDate)) && (
        <>
          <h3 className="mb-3 text-center">
            Top 5 Selling Products{" "}
            {specificDate
              ? `on ${format(specificDate, "yyyy-MM-dd")}`
              : `from ${format(startDate, "yyyy-MM-dd")} to ${format(endDate, "yyyy-MM-dd")}`}
          </h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Sales (₹)</th>
              </tr>
            </thead>
            <tbody>
              {(specificDate
                ? filteredByDate.topSellingProducts
                : filteredByRange.topSellingProducts
              )
                .slice(0, 5)
                .map((product, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{product.totalQuantitySold}</td>
                    <td>₹{product.totalSales.toFixed(2)}</td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </>
      )}
    </Container>
  );
};

export default Dashboard;
