import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const ComboIndicator = ({ comboCount }) => {
  if (comboCount < 2) return null;
  return (
    <motion.div
      initial={{ scale: 0, y: -20 }}
      animate={{ scale: 1, y: 0 }}
      className="fixed top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-gradient-to-r from-orange-600 to-red-600 px-3 py-1.5 rounded-full shadow-2xl"
    >
      <span className="text-sm">🔥</span>
      <span className="text-white font-bold text-xs">{comboCount}× Combo!</span>
    </motion.div>
  );
};

export default ComboIndicator;
