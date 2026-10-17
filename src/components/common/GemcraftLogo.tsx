import React from "react";

interface GemcraftLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  variant?: "white" | "color";
  className?: string;
}

/**
 * GemcraftLogo
 * - "white" (default): logo (1).svg / logo-white.svg for dark surfaces
 * - "color": logo (2).svg
 */
export const GemcraftLogo: React.FC<GemcraftLogoProps> = ({
  variant = "white",
  className = "w-6 h-6 object-contain",
  alt = "Gemcraft Logo",
  ...props
}) => {
  const src = variant === "color" ? "/logo (2).svg" : "/logo (1).svg";
  return <img src={src} className={className} alt={alt} {...props} />;
};

export default GemcraftLogo;
