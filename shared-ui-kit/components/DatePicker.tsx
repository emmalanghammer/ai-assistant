import { useEffect, useId, useLayoutEffect, useRef, useState, type Ref, type RefObject } from "react"
import { createPortal } from "react-dom"
import clsx from "clsx"
import calendarIcon from "../assets/calendar-today.svg"

const PANEL_WIDTH = 320
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

interface DatePickerProps {
  label?: string
  required?: boolean
  helperText?: string
  error?: string
  value: string
  onChange: (value: string) => void
  className?: string
  labelIcon?: React.ReactNode
  disabled?: boolean
  ref?: Ref<HTMLButtonElement>
}

/** Attaches a DOM node to both an internal callback and an externally-passed ref. */
function mergeRefs<T>(internal: RefObject<T | null>, external: Ref<T> | undefined) {
  return (node: T | null) => {
    internal.current = node
    if (typeof external === "function") external(node)
    else if (external) (external as RefObject<T | null>).current = node
  }
}

function toISO(y: number, m: number, d: number) {
  return `${y.toString().padStart(4, "0")}-${(m + 1).toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`
}

function parseISO(value: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  return { y: Number(match[1]), m: Number(match[2]) - 1, d: Number(match[3]) }
}

function formatDisplay(value: string) {
  const parsed = parseISO(value)
  if (!parsed) return ""
  return `${(parsed.m + 1).toString().padStart(2, "0")}/${parsed.d.toString().padStart(2, "0")}/${parsed.y}`
}

export function DatePicker({ label, required, helperText, error, value, onChange, className, labelIcon, disabled, ref }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const today = new Date()
  const selected = parseISO(value)
  const [viewYear, setViewYear] = useState(selected?.y ?? today.getFullYear())
  const [viewMonth, setViewMonth] = useState(selected?.m ?? today.getMonth())
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
      const left = Math.min(Math.max(8, rect.right - PANEL_WIDTH), window.innerWidth - PANEL_WIDTH - 8)
      setPosition({ top: rect.bottom + 4, left })
    }
    updatePosition()
    window.addEventListener("scroll", updatePosition, true)
    window.addEventListener("resize", updatePosition)
    return () => {
      window.removeEventListener("scroll", updatePosition, true)
      window.removeEventListener("resize", updatePosition)
    }
  }, [open])

  function openPicker() {
    if (disabled) return
    const base = selected ?? { y: today.getFullYear(), m: today.getMonth() }
    setViewYear(base.y)
    setViewMonth(base.m)
    setOpen(true)
  }

  function goPrevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  function goNextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  const firstOfMonth = new Date(viewYear, viewMonth, 1)
  const startWeekday = firstOfMonth.getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate()

  type Cell = { y: number; m: number; d: number; inMonth: boolean }
  const cells: Cell[] = []
  for (let i = startWeekday - 1; i >= 0; i--) {
    const m = viewMonth === 0 ? 11 : viewMonth - 1
    const y = viewMonth === 0 ? viewYear - 1 : viewYear
    cells.push({ y, m, d: daysInPrevMonth - i, inMonth: false })
  }
  for (let d = 1; d <= daysInMonth; d++) cells.push({ y: viewYear, m: viewMonth, d, inMonth: true })
  while (cells.length % 7 !== 0 || cells.length < 42) {
    const last = cells[cells.length - 1]
    const nextDay = last.d + 1
    const rollOver = nextDay > new Date(last.y, last.m + 1, 0).getDate()
    if (rollOver) {
      const m = last.m === 11 ? 0 : last.m + 1
      const y = last.m === 11 ? last.y + 1 : last.y
      cells.push({ y, m, d: 1, inMonth: false })
    } else {
      cells.push({ y: last.y, m: last.m, d: nextDay, inMonth: false })
    }
    if (cells.length >= 42) break
  }

  const isToday = (c: Cell) => c.y === today.getFullYear() && c.m === today.getMonth() && c.d === today.getDate()
  const isSelected = (c: Cell) => !!selected && c.y === selected.y && c.m === selected.m && c.d === selected.d

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
          ref={mergeRefs(triggerRef, ref)}
          type="button"
          disabled={disabled}
          onClick={openPicker}
          className={clsx(
            "flex h-9 w-full items-center justify-between rounded-sm border px-sm text-left text-sm outline-none transition-colors",
            disabled
              ? "cursor-not-allowed border-border-disabled bg-[#f8f8f8] text-[#b3b3b3]"
              : clsx(
                  "bg-input-fill text-text-primary hover:border-brand-blue/60 focus:border-brand-blue",
                  error ? "border-error" : open ? "border-brand-blue" : "border-border-primary",
                ),
          )}
        >
          <span className={clsx(!value && "italic text-[#b3b3b3]")}>{value ? formatDisplay(value) : "mm/dd/yyyy"}</span>
          <img src={calendarIcon} alt="" className={clsx("h-4 w-4 shrink-0", disabled && "opacity-40")} />
        </button>

        {open &&
          !disabled &&
          createPortal(
            <div
              ref={panelRef}
              style={{ top: position.top, left: position.left, width: PANEL_WIDTH }}
              className="fixed z-50 rounded-sm bg-white p-md shadow-[var(--shadow-dropshadow-md)]"
            >
            <div className="mb-sm flex items-center justify-between">
              <button type="button" aria-label="Previous month" onClick={goPrevMonth} className="flex h-7 w-7 items-center justify-center rounded-sm text-text-secondary hover:bg-row-hover">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <span className="text-sm font-semibold text-text-primary">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <button type="button" aria-label="Next month" onClick={goNextMonth} className="flex h-7 w-7 items-center justify-center rounded-sm text-text-secondary hover:bg-row-hover">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-7">
              {WEEKDAYS.map((wd) => (
                <div key={wd} className="flex h-8 items-center justify-center text-xs font-semibold text-text-primary">
                  {wd}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {cells.map((c, i) => {
                const selectedCell = isSelected(c)
                const todayCell = isToday(c)
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      onChange(toISO(c.y, c.m, c.d))
                      setOpen(false)
                    }}
                    className={clsx(
                      "flex h-9 items-center justify-center text-sm",
                      !c.inMonth && "text-[#b3b3b3]",
                      c.inMonth && !selectedCell && "text-text-primary",
                      selectedCell ? "bg-brand-blue text-white rounded-sm" : todayCell ? "bg-[#ebf1f5] rounded-sm" : "hover:bg-row-hover rounded-sm",
                    )}
                  >
                    {c.d}
                  </button>
                )
              })}
            </div>

            <div className="mt-sm flex items-center justify-between border-t border-border-primary pt-sm">
              <button
                type="button"
                onClick={() => {
                  const t = new Date()
                  setViewYear(t.getFullYear())
                  setViewMonth(t.getMonth())
                  onChange(toISO(t.getFullYear(), t.getMonth(), t.getDate()))
                  setOpen(false)
                }}
                className="text-sm font-normal text-text-link hover:underline"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange("")
                  setOpen(false)
                }}
                className="text-sm font-normal text-text-link hover:underline"
              >
                Clear
              </button>
            </div>
            </div>,
            document.body,
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
