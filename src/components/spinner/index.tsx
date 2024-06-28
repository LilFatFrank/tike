"use client";
import React from "react";

const Spinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-sign-in-bg"></div>
    </div>
  );
};

export default Spinner;
