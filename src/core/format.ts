/**
 * Parsing / formatting helpers (replace libphonenumber-js), all over
 * google-libphonenumber via the centralized singleton.
 */
import {
  AsYouTypeFormatter,
  parseStrict,
  PhoneNumberFormat,
  util,
} from "./libphone"
import type { CountryCode } from "./types"

/** Split an E.164 string into its region + national significant number. */
export function parseE164(e164: string): {
  country?: CountryCode
  nationalNumber: string
} {
  if (!e164) return { nationalNumber: "" }
  const outcome = parseStrict(e164, undefined)
  if (!outcome.ok) return { nationalNumber: "" }
  return {
    country: util.getRegionCodeForNumber(outcome.pn) as CountryCode | undefined,
    nationalNumber: util.getNationalSignificantNumber(outcome.pn),
  }
}

/** National digits + region → E.164, or "" when unparseable. */
export function toE164(country: CountryCode, digits: string): string {
  if (!country || !digits) return ""
  const outcome = parseStrict(digits, country)
  return outcome.ok ? util.format(outcome.pn, PhoneNumberFormat.E164) : ""
}

/** National-format with spaces/dashes, leading national-trunk 0 stripped. */
export function formatNational(country: CountryCode, digits: string): string {
  if (!country || !digits) return ""
  const outcome = parseStrict(digits, country)
  if (!outcome.ok) return ""
  return util.format(outcome.pn, PhoneNumberFormat.NATIONAL).replace(/^0+/, "")
}

/** As-you-type fallback used only when a number is otherwise unparseable. */
function formatAsYouType(country: CountryCode, digits: string): string {
  const formatter = new AsYouTypeFormatter(country)
  let output = ""
  for (const char of digits) output = formatter.inputDigit(char)
  return output
}

/** Blur-time display formatter: national spaces first, AsYouType as last resort. */
export function blurFormat(country: CountryCode, digits: string): string {
  return formatNational(country, digits) || formatAsYouType(country, digits)
}
