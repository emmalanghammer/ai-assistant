import { type ButtonHTMLAttributes } from "react"
import clsx from "clsx"

type Variant = "primary" | "secondary" | "text" | "danger" | "marketing"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-brand-blue text-white hover:bg-hover-primary disabled:bg-brand-blue/50 disabled:text-white",
  secondary:
    "bg-white text-brand-blue border border-brand-blue hover:bg-hover-secondary disabled:border-border-disabled disabled:text-[#b3b3b3]",
  text: "bg-transparent text-text-link hover:underline disabled:text-[#b3b3b3]",
  danger: "bg-error text-white hover:bg-[#c42430]",
  marketing: "h-12 w-[296px] shrink-0 bg-brand-orange text-brand-navy font-normal text-base hover:bg-[#f9b479]",
}

export function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex h-9 items-center justify-center gap-xxs rounded-sm px-lg text-sm font-normal transition-colors disabled:cursor-not-allowed",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
