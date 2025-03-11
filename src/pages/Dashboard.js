import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Container, Table, Card, Form } from "react-bootstrap";
import { format, parseISO, isWithinInterval, isSameDay } from "date-fns";

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
      const response = await axios.get("https://cafemanager-2ji8.onrender.com/api/orders");
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
        topSellingProducts: Object.values(productSales).sort((a, b) => b.totalQuantitySold - a.totalQuantitySold),
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
      topSellingProducts: Object.values(productSales).sort((a, b) => b.totalQuantitySold - a.totalQuantitySold),
    };
  };

  const filterOrdersBySpecificDate = () => {
    if (!specificDate) return { totalRevenue: 0, topSellingProducts: [] };

    const formattedDate = format(specificDate, "yyyy-MM-dd");
    return ordersByDate[formattedDate] || { totalRevenue: 0, topSellingProducts: [] };
  };

  const filteredDataByRange = filterOrdersByDateRange();
  const filteredDataByDate = filterOrdersBySpecificDate();

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Dashboard</h2>

      {/* Specific Date Picker */}
      <Form.Group className="mb-3 text-center">
        <Form.Label>Select Specific Date:</Form.Label>
        <DatePicker
          selected={specificDate}
          onChange={(date) => setSpecificDate(date)}
          dateFormat="yyyy-MM-dd"
          className="form-control"
          isClearable
          placeholderText="Choose a date"
        />
      </Form.Group>

      {/* Start Date Picker */}
      <Form.Group className="mb-3 text-center">
        <Form.Label>Select Start Date:</Form.Label>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          dateFormat="yyyy-MM-dd"
          className="form-control"
          isClearable
          placeholderText="Choose a start date"
        />
      </Form.Group>

      {/* End Date Picker */}
      <Form.Group className="mb-3 text-center">
        <Form.Label>Select End Date:</Form.Label>
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          dateFormat="yyyy-MM-dd"
          className="form-control"
          isClearable
          placeholderText="Choose an end date"
        />
      </Form.Group>

      {/* Specific Date Revenue */}
      {specificDate && (
        <Card className="p-3 mb-4 text-center">
          <h4>
            Total Revenue on {format(specificDate, "yyyy-MM-dd")}: ₹
            {filteredDataByDate.totalRevenue.toFixed(2)}
          </h4>
        </Card>
      )}

      {/* Date Range Revenue */}
      {startDate && endDate && (
        <Card className="p-3 mb-4 text-center">
          <h4>
            Total Revenue from {format(startDate, "yyyy-MM-dd")} to{" "}
            {format(endDate, "yyyy-MM-dd")}: ₹{filteredDataByRange.totalRevenue.toFixed(2)}
          </h4>
        </Card>
      )}

      {/* Top 5 Selling Products - Specific Date */}
      {specificDate && (
        <>
          <h3 className="mb-3">Top 5 Selling Products on {format(specificDate, "yyyy-MM-dd")}</h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Quantity Sold</th>
                <th>Total Sales (₹)</th>
              </tr>
            </thead>
            <tbody>
              {filteredDataByDate.topSellingProducts.slice(0, 5).map((product, index) => (
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

      {/* Top 5 Selling Products - Date Range */}
      {startDate && endDate && (
        <>
          <h3 className="mb-3">
            Top 5 Selling Products from {format(startDate, "yyyy-MM-dd")} to{" "}
            {format(endDate, "yyyy-MM-dd")}
          </h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Quantity Sold</th>
                <th>Total Sales (₹)</th>
              </tr>
            </thead>
            <tbody>
              {filteredDataByRange.topSellingProducts.slice(0, 5).map((product, index) => (
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
