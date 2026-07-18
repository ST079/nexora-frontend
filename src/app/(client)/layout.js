import React from "react";

const ClientLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-paper dark:bg-[#0e0f12] transition-colors duration-300">
      {children}
    </div>
  );
};

export default ClientLayout;