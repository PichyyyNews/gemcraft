import React from "react";
import logo1 from "../assets/logo (1).svg";
import logo2 from "../assets/logo (2).svg";

interface GemcraftLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  theme?: "dark" | "light";
  className?: string;
}

/**
 * GemcraftLogo
 * - Dark theme (main default): logo (1).svg
 * - Light theme: logo (2).svg
 */
export const GemcraftLogo: React.FC<GemcraftLogoProps> = ({
  theme = "dark",
  className = "gemcraft-logo",
  alt = "Gemcraft Logo",
  ...props
}) => {
  const src = theme === "dark" ? logo1 : logo2;
  return <img src={src} className={className} alt={alt} {...props} />;
};

export default GemcraftLogo;
