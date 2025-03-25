import { useState, ReactNode } from "react";

type TooltipProps = {
  children: ReactNode;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
};

export default function Tooltip({
  children,
  content,
  position = "top",
}: TooltipProps) {
  const [show, setShow] = useState(false);

  const positionStyles: Record<string, string> = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          className={`absolute z-50 px-2 py-1 text-sm text-white bg-black rounded-md whitespace-nowrap ${positionStyles[position]}`}
        >
          {content}
        </div>
      )}
    </div>
  );
}
