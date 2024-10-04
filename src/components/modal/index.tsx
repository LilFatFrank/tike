"use client";
import React, { CSSProperties, memo, ReactNode, useCallback } from "react";

type ModalProps = {
  children: ReactNode;
  isOpen: boolean;
  closeModal?: (e?: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  direction?: "top" | "bottom";
  style?: CSSProperties;
};

const Modal: React.FC<ModalProps> = memo(
  ({ children, isOpen, closeModal, direction = "bottom", style }) => {
    /* useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]); */

    const handleBackdropClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        closeModal?.(e);
      },
      [closeModal]
    );

    const handleContentClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();
      },
      []
    );

    const positionClass = direction === "top" ? "top-0" : "bottom-0";
    const borderRadiusClass =
      direction === "top" ? "rounded-b-md" : "rounded-t-md";

    return (
      <div
        className={`fixed inset-0 bg-black-50 z-[999] transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleBackdropClick}
      >
        <div
          className={`fixed ${positionClass} w-full md:w-[550px] md:left-[50%] md:translate-x-[-50%] py-4 px-1 bg-white ${borderRadiusClass} transform transition-transform ${
            isOpen
              ? "translate-y-0"
              : direction === "top"
              ? "-translate-y-full"
              : "translate-y-full"
          } border border-gray-text-1 mx-auto z-[99]`}
          style={{
            maxHeight: "80dvh",
            overflowY: "auto",
            scrollbarWidth: "none",
            ...style,
          }}
          onClick={handleContentClick}
        >
          {children}
        </div>
      </div>
    );
  }
);

export default Modal;
