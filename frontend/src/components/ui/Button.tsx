import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

const TEAL = "#28ebc0";
const DARK = "#0B1220";
const MUTED = "#6b8f80";
const EASE = "cubic-bezier(0.25,0.46,0.45,0.94)";

type VariantConfig = {
  background: string;
  color: string;
  border: string;
  hoverBackground: string;
  hoverColor?: string;
};

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }
>;

const variantStyles: Record<ButtonVariant, VariantConfig> = {
  primary: {
    background: TEAL,
    color: DARK,
    border: "none",
    hoverBackground: "#1fd4ad",
  },
  secondary: {
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.1)",
    hoverBackground: "rgba(255,255,255,0.1)",
  },
  ghost: {
    background: "transparent",
    color: MUTED,
    border: "none",
    hoverBackground: "rgba(255,255,255,0.05)",
    hoverColor: "#fff",
  },
  danger: {
    background: "rgba(255,80,80,0.1)",
    color: "#ff6b6b",
    border: "1px solid rgba(255,80,80,0.3)",
    hoverBackground: "rgba(255,80,80,0.2)",
    hoverColor: "#ff8a8a",
  },
};

export function Button({ children, variant = "primary", style, onMouseEnter, onMouseLeave, ...props }: ButtonProps) {
  const variantConfig = variantStyles[variant];
  const baseStyle = {
    padding: "0.6rem 1.2rem",
    borderRadius: 10,
    fontSize: "0.85rem",
    fontWeight: 600,
    fontFamily: "'Montserrat', sans-serif",
    cursor: "pointer",
    transition: `all 0.18s ${EASE}`,
    ...variantConfig,
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    if (variantConfig.hoverBackground) target.style.background = variantConfig.hoverBackground;
    if (variantConfig.hoverColor) target.style.color = variantConfig.hoverColor;
    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    target.style.background = variantConfig.background || "";
    target.style.color = variantConfig.color || "";
    onMouseLeave?.(e);
  };

  return (
    <button
      {...props}
      style={{ ...baseStyle, ...style }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </button>
  );
}