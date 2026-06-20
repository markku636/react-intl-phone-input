import { useRef, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"

import { usePosition } from "./usePosition"

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  /** Controlled visibility (e.g. the zero hint). Omit for hover/focus mode. */
  open?: boolean
  variant?: "default" | "warning"
  /** Extra class on the trigger wrapper (e.g. to make it flex:1). */
  triggerClassName?: string
  /** Extra class on the tooltip bubble. */
  className?: string
}

/**
 * Dependency-free tooltip. Portals the bubble to `document.body` so it escapes
 * `overflow:hidden` ancestors (Modal / Form.Item). Hover+focus by default, or
 * fully controlled via `open`.
 */
export function Tooltip({
  content,
  children,
  open,
  variant = "default",
  triggerClassName,
  className,
}: TooltipProps) {
  const [hovered, setHovered] = useState(false)
  const triggerRef = useRef<HTMLSpanElement>(null)
  const controlled = open !== undefined
  const visible = controlled ? open : hovered
  const hasContent = content != null && content !== false
  const showBubble = !!visible && hasContent
  const position = usePosition(triggerRef, showBubble, "top")

  const hoverHandlers = controlled
    ? {}
    : {
        onMouseEnter: () => setHovered(true),
        onMouseLeave: () => setHovered(false),
        onFocus: () => setHovered(true),
        onBlur: () => setHovered(false),
      }

  return (
    <span
      ref={triggerRef}
      className={`ripn-tooltip-trigger ${triggerClassName ?? ""}`}
      {...hoverHandlers}
    >
      {children}
      {showBubble && position && typeof document !== "undefined"
        ? createPortal(
            <div
              role="tooltip"
              className={[
                "ripn-tooltip",
                `ripn-tooltip--${position.placement}`,
                variant === "warning" ? "ripn-tooltip--warning" : "",
                className ?? "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{ position: "fixed", top: position.top, left: position.left }}
            >
              {content}
              <span className="ripn-tooltip__arrow" />
            </div>,
            document.body,
          )
        : null}
    </span>
  )
}
