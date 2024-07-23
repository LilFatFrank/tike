// components/Sidebar.tsx
import React from "react";

interface SidebarProps {
  isOpen: boolean;
  children: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, children }) => {
  return (
    <div>
      <div
        className={`fixed top-0 left-0 h-full transition-all duration-200 z-10 bg-gradient-to-r from-white via-white/90 to-white/50 ${
          isOpen ? "w-full" : "w-0 overflow-hidden"
        } overflow-y-auto`}
      >
        {children}
      </div>
    </div>
  );
};

export default Sidebar;
