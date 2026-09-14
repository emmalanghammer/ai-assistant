import { useEffect, useId, useRef, useState, type Ref } from "react"
import clsx from "clsx"
import chevronDownIcon from "../assets/keyboard-arrow-down.svg"
import chevronDownDisabledIcon from "../assets/keyboard-arrow-down-disabled.svg"

interface DropdownProps {
  label?: string
  required?: boolean
  helperText?: string
  error?: string
  options: readonly string[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  labelIcon?: React.ReactNode
  size?: "default" | "compact"
  ref?: Ref<HTMLButtonElement>
}

/** RMX-style dropdown trigger + floating panel — never a native <select>. */
export function Dropdown({
  label,
  required,
  helperText,
  error,
  options,
  value,
  onChange,
  placeholder = "",
  disabled,
  className,
  labelIcon,
  size = "default",
  ref,
}: DropdownProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const id = useId()

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDocClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div className={clsx("flex flex-col gap-xxs", className)} ref={rootRef}>
      {label && (
        <label htmlFor={id} className="inline-flex items-center gap-xxs text-sm font-normal text-label-gray">
          {label}
          {required && " *"}
          {labelIcon}
        </label>
      )}
      <div className="relative">
        <button
          id={id}
          ref={ref}
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className={clsx(
            "flex w-full items-center justify-between rounded-sm border px-sm text-left text-sm outline-none transition-colors",
            size === "compact" ? "h-8" : "h-9",
            disabled
              ? "cursor-not-allowed border-border-disabled bg-[#f8f8f8] text-[#b3b3b3]"
              : clsx(
                  "bg-input-fill text-text-primary hover:border-brand-blue/60 focus:border-brand-blue",
                  error ? "border-error" : open ? "border-brand-blue" : "border-border-primary",
                ),
          )}
        >
          <span className={clsx("min-w-0 truncate", !value && !disabled && "italic text-[#b3b3b3]")}>{value || placeholder}</span>
          {!disabled && (
            <img
              src={chevronDownIcon}
              alt=""
              className={clsx("h-5 w-5 shrink-0 transition-transform", open && "rotate-180")}
            />
          )}
          {disabled && <img src={chevronDownDisabledIcon} alt="" className="h-5 w-5 shrink-0" />}
        </button>

        {open && !disabled && (
          <div className="absolute left-0 top-[calc(100%+4px)] z-50 max-h-64 w-max min-w-full max-w-[320px] overflow-y-auto rounded-sm bg-white shadow-[0px_3px_6px_0px_rgba(0,0,0,0.15)]">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt)
                  setOpen(false)
                }}
                className={clsx(
                  "flex h-9 w-full items-center truncate whitespace-nowrap px-sm text-left text-sm",
                  opt === value ? "bg-brand-blue text-white" : "text-text-primary hover:bg-[#f5f8fa]",
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
      {error ? (
        <span className="text-xs text-error">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-text-secondary">{helperText}</span>
      ) : null}
    </div>
  )
}
