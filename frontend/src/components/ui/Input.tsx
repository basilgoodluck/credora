import type { InputHTMLAttributes, PropsWithChildren, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label: string };
type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string };

export function Input({ label, id, ...props }: InputProps) {
  const fieldId = id || props.name || label;
  return (
    <label className="field" htmlFor={fieldId}>
      <span>{label}</span>
      <input id={fieldId} {...props} />
    </label>
  );
}

export function Textarea({ label, id, ...props }: TextareaProps) {
  const fieldId = id || props.name || label;
  return (
    <label className="field" htmlFor={fieldId}>
      <span>{label}</span>
      <textarea id={fieldId} {...props} />
    </label>
  );
}

export function Select({ label, children, id, ...props }: PropsWithChildren<SelectHTMLAttributes<HTMLSelectElement> & { label: string }>) {
  const fieldId = id || props.name || label;
  return (
    <label className="field" htmlFor={fieldId}>
      <span>{label}</span>
      <select id={fieldId} {...props}>
        {children}
      </select>
    </label>
  );
}
