// components/Sidebar.tsx
import React, { memo } from "react";

interface SidebarProps {
  isOpen: boolean;
  children: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = memo(({ isOpen, children }) => {
  return (
    <div>
      <div
        className={`fixed top-0 left-0 md:top-[75px] md:left-[50%] md:translate-x-[-50%] h-full transition-all duration-200 z-10 bg-gradient-to-r from-white via-white/90 to-white/50 ${
          isOpen ? "w-full md:w-[550px] " : "w-0 overflow-hidden"
        } overflow-y-auto`}
      >
        {children}
      </div>
    </div>
  );
});

export default Sidebar;
