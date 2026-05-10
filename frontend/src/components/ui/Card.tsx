import type { PropsWithChildren } from "react";

const DARK2 = "#101c2e";

export function Card({ children, className, style }: PropsWithChildren<{ className?: string; style?: React.CSSProperties }>) {
  return (
    <section
      style={{
        background: DARK2,
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.06)",
        padding: "1.25rem",
        ...style,
      }}
    >
      {children}
    </section>
  );
}