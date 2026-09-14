import { useEffect, useId, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import clsx from "clsx"
import chevronDownIcon from "../assets/keyboard-arrow-down.svg"

const PANEL_WIDTH = 368

interface Option {
  value: string
  description?: string
}

interface MultiSelectDropdownProps {
  label?: string
  required?: boolean
  options: Option[]
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  size?: "default" | "compact"
}

/** RMX-style multi-select: search box + checkbox list with descriptions + "N selected" / "clear" footer. */
export function MultiSelectDropdown({
  label,
  required,
  options,
  values,
  onChange,
  placeholder = "",
  disabled,
  className,
  size = "default",
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const id = useId()

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (
        rootRef.current &&
        !rootRef.current.contains(e.target as Node) &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
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

  useLayoutEffect(() => {
    if (!open) return
    function updatePosition() {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return
      const left = Math.min(rect.left, window.innerWidth - PANEL_WIDTH - 8)
      setPosition({ top: rect.bottom + 4, left: Math.max(8, left) })
    }
    updatePosition()
    window.addEventListener("scroll", updatePosition, true)
    window.addEventListener("resize", updatePosition)
    return () => {
      window.removeEventListener("scroll", updatePosition, true)
      window.removeEventListener("resize", updatePosition)
    }
  }, [open])

  function toggle(value: string) {
    onChange(values.includes(value) ? values.filter((v) => v !== value) : [...values, value])
  }

  const filtered = options.filter((o) => o.value.toLowerCase().includes(query.toLowerCase()))
  const triggerText = values.length > 1 ? `${values.length} Selected` : values.length === 1 ? values[0] : placeholder

  return (
    <div className={clsx("flex flex-col gap-xxs", className)} ref={rootRef}>
      {label && (
        <label htmlFor={id} className="inline-flex items-center gap-xxs text-sm font-normal text-label-gray">
          {label}
          {required && " *"}
        </label>
      )}
      <div className="relative">
        <button
          id={id}
          ref={triggerRef}
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className={clsx(
            "flex w-full items-center justify-between rounded-sm border bg-input-fill px-sm text-left text-sm outline-none transition-colors",
            size === "compact" ? "h-8" : "h-9",
            open ? "border-brand-blue" : "border-border-primary",
            disabled ? "cursor-not-allowed bg-[#f2f2f2] text-[#b3b3b3]" : "text-text-primary hover:border-brand-blue/60",
          )}
        >
          <span className={clsx("min-w-0 truncate", !values.length && "italic text-[#b3b3b3]")}>{triggerText}</span>
          <img
            src={chevronDownIcon}
            alt=""
            className={clsx("h-5 w-5 shrink-0 transition-transform", open && "rotate-180", disabled && "opacity-40")}
          />
        </button>

        {open &&
          !disabled &&
          createPortal(
            <div
              ref={panelRef}
              style={{ top: position.top, left: position.left, width: PANEL_WIDTH }}
              className="fixed z-50 overflow-hidden rounded-sm bg-white shadow-[var(--shadow-dropshadow-md)]"
            >
              <div className="border-b border-border-primary p-xs">
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search"
                  className="h-9 w-full rounded-sm border border-border-primary bg-input-fill px-sm text-sm italic text-[#b3b3b3] outline-none placeholder:italic placeholder:text-[#b3b3b3] focus:border-brand-blue focus:text-text-primary focus:not-italic"
                />
              </div>

              <div className="max-h-72 overflow-y-auto">
                {filtered.map((opt) => {
                  const checked = values.includes(opt.value)
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggle(opt.value)}
                      className="flex w-full flex-col gap-xxxs p-xs text-left hover:bg-row-hover"
                    >
                      <span className="flex items-center gap-xs">
                        <span
                          aria-hidden="true"
                          className={clsx(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-xs border-2",
                            checked ? "border-brand-orange bg-brand-orange" : "border-[#b3b3b3] bg-white",
                          )}
                        >
                          {checked && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          )}
                        </span>
                        <span className="text-sm text-text-primary">{opt.value}</span>
                      </span>
                      {opt.description && <span className="pl-[28px] text-[10px] text-label-gray">{opt.description}</span>}
                    </button>
                  )
                })}
              </div>

              <div className="flex h-9 items-center justify-between border-t border-border-primary px-sm">
                <span className="text-sm text-label-gray">{values.length} selected</span>
                <button type="button" onClick={() => onChange([])} className="text-sm font-normal text-text-link hover:underline">
                  clear
                </button>
              </div>
            </div>,
            document.body,
          )}
      </div>
    </div>
  )
}
