/**
 * Country data: calling codes, the supported-region list, and the dropdown
 * option model (preferred countries first, a divider, then the rest A→Z).
 */
import { util } from "./libphone"
import type { CountryCode } from "./types"

/** Calling code digits for a region (e.g. "60"), or "" for an unknown region. */
export function getCountryCallingCode(country: CountryCode): string {
  // getCountryCodeForRegion returns 0 (not throw) for unknown regions.
  const code = util.getCountryCodeForRegion(country)
  return code ? String(code) : ""
}

/** All region codes google-libphonenumber supports (~245). */
export function listSupportedCountries(): CountryCode[] {
  return util.getSupportedRegions() as CountryCode[]
}

/** Countries surfaced at the top of the dropdown (ported from the source component). */
export const PREFERRED_COUNTRIES: CountryCode[] = [
  "MY", // +60
  "ID", // +62
  "CN", // +86
  "IN", // +91
  "TH", // +66
  "BD", // +880
  "KH", // +855
  "VN", // +84
  "KR", // +82
  "JP", // +81
  "BR", // +55
  "PH", // +63
]

/** Sentinel value for the non-selectable divider row. */
export const DIVIDER_VALUE = "__divider__"

export interface ICountryOption {
  /** Region code, or DIVIDER_VALUE for the divider row. */
  value: string
  /** "+60" style calling code; "" for the divider. */
  callingCode: string
  /** Region code, used for the flag + search; "" for the divider. */
  countryName: CountryCode
  /** True only for the divider row. */
  divider?: boolean
}

function toOption(code: CountryCode): ICountryOption {
  return {
    value: code,
    callingCode: `+${getCountryCallingCode(code)}`,
    countryName: code,
  }
}

/** Preferred options, a divider, then every other supported region sorted A→Z. */
export function buildCountryOptions(): ICountryOption[] {
  const preferredSet = new Set(PREFERRED_COUNTRIES)
  const preferred = PREFERRED_COUNTRIES.map(toOption)
  const others = listSupportedCountries()
    .filter((code) => !preferredSet.has(code))
    .sort()
    .map(toOption)
  const divider: ICountryOption = {
    value: DIVIDER_VALUE,
    callingCode: "",
    countryName: "",
    divider: true,
  }
  return [...preferred, divider, ...others]
}
