import React from "react";

interface SpinnerOverlayProps {
  text?: string; // loading text
  className?: string; // additional classes
}

const Spinner: React.FC<SpinnerOverlayProps> = ({
  text = "Loading...",
  className = "",
}) => {
  return (
    <div
      className={`absolute top-0 left-0 w-full h-full bg-black/50 flex flex-col justify-center items-center z-50 ${className}`}
    >
      <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
      <span className="text-white text-lg font-medium">{text}</span>
    </div>
  );
};

export default Spinner;
