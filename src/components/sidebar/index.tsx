// components/Sidebar.tsx
import cn from "@/utils/cn";
import React, { memo } from "react";

interface SidebarProps {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
  openFromRight?: boolean;
}

const Sidebar: React.FC<SidebarProps> = memo(
  ({ isOpen, children, className, openFromRight = false }) => {
    const sideClasses = openFromRight
      ? "right-0 md:right-[50%] md:translate-x-[50%]"
      : "left-0 md:left-[50%] md:translate-x-[-50%]";

    const gradientClasses = openFromRight
      ? "bg-gradient-to-r from-white/50 via-white/90 to-white"
      : "bg-gradient-to-r from-white via-white/90 to-white/50";

    const contentAlignment = openFromRight ? "items-end" : "items-start";

    return (
      <div>
        <div
          className={cn(
            `fixed top-0 ${sideClasses} md:top-[75px] h-full transition-all duration-200 z-10 ${gradientClasses} ${
              isOpen ? "w-full md:w-[550px] " : "w-0 overflow-hidden"
            } overflow-y-auto`,
            className
          )}
        >
          <div className={`flex flex-col ${contentAlignment}`}>
            {children}
          </div>
        </div>
      </div>
    );
  }
);

export default Sidebar;
