import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Container, Table, Card, Form, Row, Col } from "react-bootstrap";
import { format, parseISO, isWithinInterval } from "date-fns";
import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement);

const Dashboard = () => {
  const [ordersByDate, setOrdersByDate] = useState({});
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [specificDate, setSpecificDate] = useState(null);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get("https://cashman-node.onrender.com/api/orders");
      const groupedData = groupByDate(response.data);
      setOrdersByDate(groupedData);
      setTotalRevenue(Object.values(groupedData).reduce((acc, data) => acc + data.totalRevenue, 0));
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const groupByDate = (orders) => {
    if (!orders) return {};

    return Object.entries(orders).reduce((acc, [date, orderList]) => {
      const formattedDate = format(parseISO(date), "yyyy-MM-dd");
      let totalRevenue = 0, totalOrders = orderList.length;
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
        totalOrders,
        topSellingProducts: Object.values(productSales).sort((a, b) => b.totalQuantitySold - a.totalQuantitySold),
      };
      return acc;
    }, {});
  };

  const getFilteredData = () => {
    let filteredOrders = {};
    if (specificDate) {
      const formattedDate = format(specificDate, "yyyy-MM-dd");
      filteredOrders = ordersByDate[formattedDate] || { totalRevenue: 0, topSellingProducts: [] };
    } else if (startDate && endDate) {
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
      filteredOrders = { totalRevenue, topSellingProducts: Object.values(productSales).sort((a, b) => b.totalQuantitySold - a.totalQuantitySold) };
    }
    return filteredOrders;
  };

  const generateChartData = () => {
    const labels = Object.keys(ordersByDate);
    const revenueData = labels.map((date) => ordersByDate[date].totalRevenue);
    const ordersData = labels.map((date) => ordersByDate[date].totalOrders);

    return {
      revenueTrend: {
        labels,
        datasets: [
          {
            label: "Revenue",
            data: revenueData,
            borderColor: "blue",
            fill: false,
          },
        ],
      },
      avgOrders: {
        labels,
        datasets: [
          {
            label: "Orders per Day",
            data: ordersData,
            backgroundColor: "orange",
          },
        ],
      },
    };
  };

  const { revenueTrend, avgOrders } = generateChartData();
  const filteredData = getFilteredData();

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Dashboard</h2>
      <Card className="p-3 mb-4 text-center">
        <h4>Total Revenue Till Now: ₹{totalRevenue.toFixed(2)}</h4>
      </Card>
      <Row className="mb-3">
        <Col>
          <Form.Label>Select Specific Date:</Form.Label>
          <DatePicker selected={specificDate} onChange={setSpecificDate} dateFormat="yyyy-MM-dd" className="form-control" isClearable placeholderText="Choose a date" />
        </Col>
        <Col>
          <Form.Label>Select Start Date:</Form.Label>
          <DatePicker selected={startDate} onChange={setStartDate} dateFormat="yyyy-MM-dd" className="form-control" isClearable placeholderText="Choose a start date" />
        </Col>
        <Col>
          <Form.Label>Select End Date:</Form.Label>
          <DatePicker selected={endDate} onChange={setEndDate} dateFormat="yyyy-MM-dd" className="form-control" isClearable placeholderText="Choose an end date" />
        </Col>
      </Row>
      {filteredData.totalRevenue > 0 && (
        <Card className="p-3 mb-4 text-center">
          <h4>Total Revenue: ₹{filteredData.totalRevenue.toFixed(2)}</h4>
        </Card>
      )}
      <h4 className="text-center">Revenue Trend</h4>
      <Line data={revenueTrend} />
      <h4 className="text-center mt-4">Average Orders per Day</h4>
      <Bar data={avgOrders} />
    </Container>
  );
};

export default Dashboard;