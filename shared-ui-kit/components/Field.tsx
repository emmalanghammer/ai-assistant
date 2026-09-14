import { type InputHTMLAttributes, type ReactNode, type Ref } from "react"
import clsx from "clsx"

interface FieldWrapProps {
  label: string
  htmlFor: string
  required?: boolean
  helperText?: string
  error?: string
  labelIcon?: ReactNode
  children: ReactNode
}

function FieldWrap({ label, htmlFor, required, helperText, error, labelIcon, children }: FieldWrapProps) {
  return (
    <div className="flex flex-col gap-xxs">
      <label htmlFor={htmlFor} className="inline-flex items-center gap-xxs text-sm font-normal text-label-gray">
        {label}
        {required && " *"}
        {labelIcon}
      </label>
      {children}
      {error ? (
        <span className="text-xs text-error">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-text-secondary">{helperText}</span>
      ) : null}
    </div>
  )
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  helperText?: string
  error?: string
  labelIcon?: ReactNode
  ref?: Ref<HTMLInputElement>
}

export function TextField({ label, helperText, error, required, labelIcon, className, id, ...props }: TextFieldProps) {
  const inputId = id ?? `field-${label.replace(/\s+/g, "-").toLowerCase()}`
  return (
    <FieldWrap label={label} htmlFor={inputId} required={required} helperText={helperText} error={error} labelIcon={labelIcon}>
      <input
        id={inputId}
        required={required}
        className={clsx(
          "h-9 rounded-sm border bg-input-fill px-sm text-sm text-text-primary outline-none transition-colors",
          "border-border-primary placeholder:italic placeholder:text-[#b3b3b3]",
          "focus:border-brand-blue",
          "disabled:cursor-not-allowed disabled:border-border-disabled disabled:bg-[#f8f8f8] disabled:text-[#b3b3b3]",
          error && "border-error",
          className,
        )}
        {...props}
      />
    </FieldWrap>
  )
}

type TextBoxProps = Omit<InputHTMLAttributes<HTMLTextAreaElement>, "size"> & {
  label: string
  helperText?: string
  error?: string
}

/** Multi-line counterpart to TextField — same Input Field skin per the RMX component recipe. */
export function TextBox({ label, helperText, error, required, className, id, ...props }: TextBoxProps) {
  const inputId = id ?? `field-${label.replace(/\s+/g, "-").toLowerCase()}`
  return (
    <FieldWrap label={label} htmlFor={inputId} required={required} helperText={helperText} error={error}>
      <textarea
        id={inputId}
        required={required}
        rows={3}
        className={clsx(
          "h-20 resize-none rounded-sm border bg-input-fill px-sm py-xs text-sm text-text-primary outline-none transition-colors",
          "border-border-primary placeholder:italic placeholder:text-[#b3b3b3]",
          "focus:border-brand-blue",
          error && "border-error",
          className,
        )}
        {...props}
      />
    </FieldWrap>
  )
}
