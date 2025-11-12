import React from "react";

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = "md",
  className = "",
}) => {
  return (
    <div
      className={`
        ${sizeStyles[size]}
        rounded-full bg-[#F0EEED] dark:bg-[#3D3B3A]
        flex items-center justify-center
        font-medium text-[#706C6B] dark:text-[#C1A7A3]
        overflow-hidden
        ${className}
      `}
    >
      {src ? (
        <img src={src} alt={alt || name} className="w-full h-full object-cover" />
      ) : (
        <span>{name ? getInitials(name) : "?"}</span>
      )}
    </div>
  );
};

