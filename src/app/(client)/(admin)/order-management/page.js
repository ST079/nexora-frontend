"use client";
import { getAllOrders } from "@/api/order";
import OrderDashboard from "./_components/OrderDashboard";
import { useEffect, useState } from "react";

const OrderManagementPage = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    getAllOrders()
      .then((data) => {
        setOrders(data);
      })
      .catch((error) => console.log(error));
  }, []);

  return (
    <>
      <OrderDashboard allOrders={orders} />;
    </>
  );
};

export default OrderManagementPage;
