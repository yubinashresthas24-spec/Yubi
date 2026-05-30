import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function FormInput({
  label,
  error,
  helperText,
  className,
  ...props
}: FormInputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <input
        {...props}
        className={`w-full px-3.5 py-2.5 bg-slate-800 border rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm ${
          error ? 'border-red-600' : 'border-slate-700'
        } ${className || ''}`}
      />
      {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-slate-400">{helperText}</p>
      )}
    </div>
  );
}

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function FormTextarea({
  label,
  error,
  helperText,
  className,
  ...props
}: FormTextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <textarea
        {...props}
        className={`w-full px-3.5 py-2.5 bg-slate-800 border rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm resize-none ${
          error ? 'border-red-600' : 'border-slate-700'
        } ${className || ''}`}
      />
      {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-slate-400">{helperText}</p>
      )}
    </div>
  );
}

interface FormSelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
}

export function FormSelect({
  label,
  error,
  helperText,
  options,
  className,
  ...props
}: FormSelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <select
        {...(props as any)}
        className={`w-full px-3.5 py-2.5 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm appearance-none ${
          error ? 'border-red-600' : 'border-slate-700'
        } ${className || ''}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-slate-400">{helperText}</p>
      )}
    </div>
  );
}
