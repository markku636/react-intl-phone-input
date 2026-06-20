import * as Flags from "country-flag-icons/react/3x2"
import type { ComponentType, SVGProps } from "react"

import type { CountryCode } from "./core/types"

type FlagComponent = ComponentType<SVGProps<SVGSVGElement>>

/** Renders the SVG flag for a region; falls back to the region code text. */
export function FlagIcon({
  code,
  className,
}: {
  code: CountryCode
  className?: string
}) {
  const Flag = (Flags as Record<string, FlagComponent>)[code]
  if (!Flag) {
    return <span className="ripn-flag-fallback">{code}</span>
  }
  return <Flag className={className ?? "ripn-flag"} aria-hidden />
}
