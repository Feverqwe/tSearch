import {useId, type ReactNode} from 'react';

interface FieldProps {
  label: ReactNode;
  help?: ReactNode;
  description?: string;
  error?: string;
  children: (props: {id: string; 'aria-describedby'?: string; 'aria-invalid'?: true}) => ReactNode;
}

export default function Field({label, help, description, error, children}: FieldProps) {
  const id = useId();
  const descriptionId = description ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="ts-field">
      <div className="ts-field-heading">
        <label htmlFor={id}>{label}</label>
        {help}
      </div>
      {children({
        id,
        'aria-describedby': [descriptionId, errorId].filter(Boolean).join(' ') || undefined,
        'aria-invalid': error ? true : undefined,
      })}
      {description && <small id={descriptionId}>{description}</small>}
      {error && (
        <small id={errorId} className="ts-field-error">
          {error}
        </small>
      )}
    </div>
  );
}
