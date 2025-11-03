import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <p>Dashboard Navbar from layout</p>
      {children}
    </div>
  );
};
export default layout;
