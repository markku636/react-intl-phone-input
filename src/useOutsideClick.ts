import { useEffect, type RefObject } from "react"

/** Calls `handler` on a pointer/touch press outside `ref`, while `active`. */
export function useOutsideClick(
  ref: RefObject<HTMLElement>,
  handler: () => void,
  active: boolean,
): void {
  useEffect(() => {
    if (!active) return undefined
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null
      if (ref.current && target && !ref.current.contains(target)) handler()
    }
    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("touchstart", onPointerDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("touchstart", onPointerDown)
    }
  }, [ref, handler, active])
}
