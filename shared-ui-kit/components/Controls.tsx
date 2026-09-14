import clsx from "clsx"

interface CheckboxProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  /** The register select-all checkbox uses blue instead of the standard orange. */
  variant?: "default" | "register"
}

export function Checkbox({ label, checked, onChange, disabled, variant = "default" }: CheckboxProps) {
  return (
    <label className={clsx("flex items-center gap-xs text-sm", disabled ? "cursor-not-allowed text-[#b3b3b3]" : "cursor-pointer text-label-gray")}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={clsx(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-xs border-2 outline-none",
          disabled
            ? "border-[#b3b3b3] bg-[#f2f2f2]"
            : checked
              ? variant === "register"
                ? "border-brand-blue bg-brand-blue"
                : "border-brand-orange bg-brand-orange"
              : "border-[#b3b3b3] bg-white",
        )}
      >
        {checked && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )}
      </span>
      {label}
    </label>
  )
}

interface RadioOption {
  value: string
  label: string
}

interface RadioGroupProps {
  legend: string
  options: RadioOption[]
  value: string
  onChange: (value: string) => void
  required?: boolean
}

export function RadioGroup({ legend, options, value, onChange, required }: RadioGroupProps) {
  return (
    <div role="group" aria-label={legend} className="flex flex-col gap-md">
      <p className="text-sm font-normal text-label-gray">
        {legend}
        {required && " *"}
      </p>
      <div className="flex gap-md">
        {options.map((opt) => {
          const selected = value === opt.value
          return (
            <label key={opt.value} className="flex cursor-pointer items-center gap-xs text-sm text-label-gray">
              <input
                type="radio"
                checked={selected}
                onChange={() => onChange(opt.value)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-round border-2 border-border-primary"
              >
                {selected && <span className="h-3 w-3 rounded-round bg-brand-blue" />}
              </span>
              {opt.label}
            </label>
          )
        })}
      </div>
    </div>
  )
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={clsx("rounded-sm border border-border-primary bg-white p-md", className)}>{children}</div>
}
