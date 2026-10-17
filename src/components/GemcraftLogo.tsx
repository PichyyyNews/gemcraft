import React from "react";
import logoWhite from "../assets/logo-white.svg";
import logoBlack from "../assets/logo-black.svg";

interface GemcraftLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  theme?: "dark" | "light";
  className?: string;
}

/**
 * GemcraftLogo
 * - Default (dark mode / main): logo-white.svg
 * - Light theme: logo-black.svg
 */
export const GemcraftLogo: React.FC<GemcraftLogoProps> = ({
  theme = "dark",
  className = "gemcraft-logo",
  alt = "Gemcraft Logo",
  ...props
}) => {
  const src = theme === "dark" ? logoWhite : logoBlack;
  return <img src={src} className={className} alt={alt} {...props} />;
};

export default GemcraftLogo;
