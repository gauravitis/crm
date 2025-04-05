import React from 'react';

interface VisuallyHiddenProps {
  children: React.ReactNode;
}

// This component visually hides content while keeping it accessible to screen readers
export const VisuallyHidden = ({ children }: VisuallyHiddenProps) => {
  return (
    <span
      className="absolute w-px h-px p-0 -m-1 overflow-hidden whitespace-nowrap border-0"
      style={{
        clip: 'rect(0, 0, 0, 0)',
        clipPath: 'inset(50%)',
      }}
    >
      {children}
    </span>
  );
}; 