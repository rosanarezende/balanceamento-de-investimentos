import React from 'react';

const DashboardLayout = ({ children }) => {
  return (
    <div>
      <header>
        <h1>Dashboard</h1>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default DashboardLayout;
