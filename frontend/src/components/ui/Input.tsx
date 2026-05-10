import type { InputHTMLAttributes, PropsWithChildren, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const MUTED = "#6b8f80";
const TEAL = "#28ebc0";
const EASE = "cubic-bezier(0.25,0.46,0.45,0.94)";

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label: string };
type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string };

export function Input({ label, id, style, ...props }: InputProps) {
  const fieldId = id || props.name || label;
  return (
    <label
      htmlFor={fieldId}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        color: "#fff",
        fontSize: "0.85rem",
        fontWeight: 500,
        width: "100%",
      }}
    >
      <span>{label}</span>
      <input
        id={fieldId}
        {...props}
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 8,
          padding: "0.6rem 0.75rem",
          color: "#fff",
          fontSize: "0.85rem",
          fontFamily: "inherit",
          outline: "none",
          transition: `border-color 0.18s ${EASE}, background 0.18s ${EASE}`,
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = TEAL;
          e.currentTarget.style.background = "rgba(40,235,192,0.05)";
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
          e.currentTarget.style.background = "rgba(255,255,255,0.05)";
          props.onBlur?.(e);
        }}
      />
    </label>
  );
}

export function Textarea({ label, id, style, ...props }: TextareaProps) {
  const fieldId = id || props.name || label;
  return (
    <label
      htmlFor={fieldId}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        color: "#fff",
        fontSize: "0.85rem",
        fontWeight: 500,
        width: "100%",
      }}
    >
      <span>{label}</span>
      <textarea
        id={fieldId}
        {...props}
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 8,
          padding: "0.6rem 0.75rem",
          color: "#fff",
          fontSize: "0.85rem",
          fontFamily: "inherit",
          outline: "none",
          resize: "none",
          transition: `border-color 0.18s ${EASE}, background 0.18s ${EASE}`,
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = TEAL;
          e.currentTarget.style.background = "rgba(40,235,192,0.05)";
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
          e.currentTarget.style.background = "rgba(255,255,255,0.05)";
          props.onBlur?.(e);
        }}
      />
    </label>
  );
}

export function Select({
  label,
  children,
  id,
  style,
  ...props
}: PropsWithChildren<SelectHTMLAttributes<HTMLSelectElement> & { label: string }>) {
  const fieldId = id || props.name || label;
  return (
    <label
      htmlFor={fieldId}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        color: "#fff",
        fontSize: "0.85rem",
        fontWeight: 500,
        width: "100%",
      }}
    >
      <span>{label}</span>
      <select
        id={fieldId}
        {...props}
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 8,
          padding: "0.6rem 0.75rem",
          color: "#fff",
          fontSize: "0.85rem",
          fontFamily: "inherit",
          outline: "none",
          cursor: "pointer",
          transition: `border-color 0.18s ${EASE}, background 0.18s ${EASE}`,
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = TEAL;
          e.currentTarget.style.background = "rgba(40,235,192,0.05)";
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
          e.currentTarget.style.background = "rgba(255,255,255,0.05)";
          props.onBlur?.(e);
        }}
      >
        {children}
      </select>
    </label>
  );
}