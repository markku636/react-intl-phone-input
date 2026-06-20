import { useCallback, useEffect, useState, type RefObject } from "react"

export interface AnchoredPosition {
  top: number
  left: number
  /** Trigger width, useful for matching a dropdown's min-width. */
  minWidth: number
  /** Resolved placement after viewport-edge flip. */
  placement: "top" | "bottom"
}

/**
 * Fixed-position anchor for a portalled popup (dropdown / tooltip). Recomputes on
 * open, scroll (capture) and resize. For `desired === "top"` it anchors to the
 * trigger's top-center and flips to bottom near the viewport top; for `"bottom"`
 * it anchors to the trigger's bottom-left.
 */
export function usePosition(
  triggerRef: RefObject<HTMLElement>,
  open: boolean,
  desired: "top" | "bottom" = "bottom",
): AnchoredPosition | undefined {
  const [position, setPosition] = useState<AnchoredPosition | undefined>(
    undefined,
  )

  const update = useCallback(() => {
    const element = triggerRef.current
    if (!element) return
    const rect = element.getBoundingClientRect()
    if (desired === "bottom") {
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
        minWidth: rect.width,
        placement: "bottom",
      })
      return
    }
    // tooltip: top-center, flip below when too close to the viewport top.
    const flip = rect.top < 64
    setPosition({
      top: flip ? rect.bottom : rect.top,
      left: rect.left + rect.width / 2,
      minWidth: rect.width,
      placement: flip ? "bottom" : "top",
    })
  }, [triggerRef, desired])

  useEffect(() => {
    if (!open) return undefined
    update()
    const onReflow = () => update()
    window.addEventListener("scroll", onReflow, true)
    window.addEventListener("resize", onReflow)
    return () => {
      window.removeEventListener("scroll", onReflow, true)
      window.removeEventListener("resize", onReflow)
    }
  }, [open, update])

  return open ? position : undefined
}
