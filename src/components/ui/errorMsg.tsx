import React from "react";

const errorMsg = (text: string, highlight?: string) => {
  return (
    <span className="text-red-500 text-xs">
      {text} {highlight && <strong>{highlight}</strong>}
    </span>
  );
};

export default errorMsg;
