"use client";
import React, { CSSProperties, ReactNode, useEffect } from "react";

type ModalProps = {
  children: ReactNode;
  isOpen: boolean;
  closeModal?: () => void;
  direction?: 'top' | 'bottom';
  style?: CSSProperties;
};

const Modal: React.FC<ModalProps> = ({ children, isOpen, closeModal, direction = 'bottom', style }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);
  
  const positionClass = direction === 'top' ? 'top-0' : 'bottom-0';
  const borderRadiusClass = direction === 'top' ? 'rounded-b-md' : 'rounded-t-md';

  return (
    <div
      className={`fixed inset-0 bg-black-50 z-[999] transition-opacity ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={closeModal}
    >
      <div
        className={`fixed ${positionClass} w-full py-4 px-1 bg-white ${borderRadiusClass} transform transition-transform ${
          isOpen ? "translate-y-0" : direction === 'top' ? '-translate-y-full' : 'translate-y-full'
        } border border-gray-text-1`}
        style={{ maxHeight: "80dvh", overflowY: "auto", ...style }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
