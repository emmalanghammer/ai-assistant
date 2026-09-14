import { useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import infoIcon from "../assets/icon-info-tooltip.svg"

const TOOLTIP_WIDTH = 312

interface InfoTooltipProps {
  text: string
  /** Override the default blue field-label icon, e.g. for a white icon on a dark register header. */
  icon?: string
  iconClassName?: string
}

/** Info icon that reveals a descriptive tooltip on hover/focus, next to a field label. */
export function InfoTooltip({ text, icon, iconClassName }: InfoTooltipProps) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)

  useLayoutEffect(() => {
    if (!open) return
    function updatePosition() {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return
      const left = Math.min(rect.left, window.innerWidth - TOOLTIP_WIDTH - 8)
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

  return (
    <span className="inline-flex">
      <button
        type="button"
        ref={triggerRef}
        aria-label="More info"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex"
      >
        <img src={icon ?? infoIcon} alt="" className={iconClassName ?? "h-4 w-4"} />
      </button>
      {open &&
        createPortal(
          <div
            role="tooltip"
            style={{ top: position.top, left: position.left, width: TOOLTIP_WIDTH }}
            className="fixed z-50 rounded-sm border border-border-primary bg-white p-md text-sm font-normal leading-[20px] text-text-primary drop-shadow-[0px_3px_3px_rgba(0,0,0,0.1)]"
          >
            {text}
          </div>,
          document.body,
        )}
    </span>
  )
}
