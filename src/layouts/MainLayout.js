"use client";
import React from "react";
import { useSelector } from "react-redux";

const MainLayout = ({ children }) => {
  const state = useSelector((state) => state.userPreferences);
  console.log(state);
  return (
    <div className={`min-h-screen flex flex-col ${state.theme} `}>
      {children}
    </div>
  );
};

export default MainLayout;
