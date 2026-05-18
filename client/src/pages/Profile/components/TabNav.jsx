import React, { useState } from "react";

const TabNav = ({ tabs, activeTab, onTabChange }) => {
  return (
    <nav className="flex space-x-8 border-b border-yellow-300 pb-3">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`pb-2 font-medium text-base transition ${
            activeTab === tab
              ? "text-yellow-700 border-b-2 border-yellow-600"
              : "text-gray-500 hover:text-yellow-600"
          }`}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
};

export default TabNav;
