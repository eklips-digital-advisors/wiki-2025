import { ReactNode } from "react";

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
  const positionStyles: Record<string, string> = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="tailwind-tooltip group relative inline-flex items-center"
    >
      {children}
      <div
        className={`max-w-60 opacity-0 invisible group-hover:visible group-hover:opacity-100 absolute z-50 px-2 py-1 text-sm text-white bg-black rounded-md ${positionStyles[position]}`}
      >
        {content}
      </div>
    </div>
  );
}
