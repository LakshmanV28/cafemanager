import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Table, Card } from "react-bootstrap";

const Dashboard = () => {
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/dashboard");
      console.log(response.data)
      setTopSellingProducts(response.data.topSellingProducts || []);
      setTotalRevenue(response.data.totalEarnings || 0);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Dashboard</h2>
      
      <Card className="p-3 mb-4 text-center">
        <h4>Total Revenue: ₹{ (totalRevenue || 0).toFixed(2) }</h4>
      </Card>
      
      <h3 className="mb-3">Top Selling Products</h3>
      {/* {console.log(totalRevenue)} */}
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
          {topSellingProducts.map((product, index) => (
            <tr key={product._id}>
              <td>{index + 1}</td>
              <td>{product.name}</td>
              <td>{product.category}</td>
              <td>{product.totalQuantitySold}</td>
              <td>₹{ (product.totalSales || 0).toFixed(2) }</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Dashboard;
