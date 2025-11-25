// src/components/profile/TabNav.jsx
import React, { useState } from "react";

const TabNav = ({ tabs, activeTab, onTabChange }) => {
  return (
    <nav className="flex space-x-8 border-b border-gray-300 pb-3">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`pb-2 font-medium text-base transition ${
            activeTab === tab
              ? "border-b-2 border-black text-black"
              : "text-gray-500 hover:text-black"
          }`}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
};

export default TabNav;