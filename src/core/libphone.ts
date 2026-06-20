/**
 * The ONLY module that imports google-libphonenumber at runtime.
 *
 * Centralizes:
 * - CommonJS default-interop (`mod.default ?? mod`), so the rest of the
 *   codebase never has to think about it.
 * - The singleton `PhoneNumberUtil`.
 * - Casts around two methods present at runtime (v3.2.44) but missing from
 *   `@types/google-libphonenumber` (`getSupportedTypesForRegion`,
 *   `getMetadataForRegion`).
 * - `parseStrict()` — `util.parse` THROWS on bad input; this wraps it and maps
 *   the two throw modes to discrete reasons.
 *
 * Verified against the installed google-libphonenumber@3.2.44:
 * `isValidNumberForType` does NOT exist; `ValidationResult` runtime values are
 * IS_POSSIBLE:0, INVALID_COUNTRY_CODE:1, TOO_SHORT:2, TOO_LONG:3,
 * IS_POSSIBLE_LOCAL_ONLY:4, INVALID_LENGTH:5 — so we read them off the runtime
 * object rather than trusting the @types enum ordering.
 */
import * as libphonenumber from "google-libphonenumber"
import type { PhoneNumber } from "google-libphonenumber"

// CommonJS interop: under Node ESM / some bundlers the named exports live under
// `.default`. Guard once here; nowhere else imports google-libphonenumber.
const gl: typeof libphonenumber =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (libphonenumber as any).default ?? libphonenumber

export const util = gl.PhoneNumberUtil.getInstance()
export const PhoneNumberFormat = gl.PhoneNumberFormat
export const PhoneNumberType = gl.PhoneNumberType
export const AsYouTypeFormatter = gl.AsYouTypeFormatter

/** Runtime ValidationResult (correct numeric values regardless of @types order). */
export const ValidationResult = (
  gl.PhoneNumberUtil as unknown as {
    ValidationResult: {
      IS_POSSIBLE: number
      IS_POSSIBLE_LOCAL_ONLY: number
      INVALID_COUNTRY_CODE: number
      TOO_SHORT: number
      INVALID_LENGTH: number
      TOO_LONG: number
    }
  }
).ValidationResult

export type GlPhoneNumber = PhoneNumber

/** Shape of the per-type metadata used for hint lengths (subset we touch). */
export type PhoneMetadataLike = Record<
  string,
  (() => { possibleLengthArray?: () => number[] } | undefined) | undefined
>

/** util + the two methods @types omits but runtime provides (v3.2.44+). */
export const utilExtra = util as unknown as typeof util & {
  getSupportedTypesForRegion(region: string): number[]
  getMetadataForRegion(region: string): PhoneMetadataLike
}

export type ParseFailReason = "INVALID_COUNTRY_CODE" | "NOT_A_NUMBER" | "TOO_LONG"

export type ParseOutcome =
  | { ok: true; pn: GlPhoneNumber }
  | { ok: false; reason: ParseFailReason }

/**
 * Safe wrapper around `util.parse`, which throws. Distinguishes the throw modes:
 * - "Invalid country calling code" → INVALID_COUNTRY_CODE
 * - "...too long..."               → TOO_LONG
 * - otherwise (non-numeric/empty)  → NOT_A_NUMBER
 */
export function parseStrict(value: string, region?: string): ParseOutcome {
  try {
    return { ok: true, pn: util.parse(value, region) }
  } catch (error) {
    const message = (error as Error).message || ""
    if (/country calling code/i.test(message)) {
      return { ok: false, reason: "INVALID_COUNTRY_CODE" }
    }
    if (/too long/i.test(message)) {
      return { ok: false, reason: "TOO_LONG" }
    }
    return { ok: false, reason: "NOT_A_NUMBER" }
  }
}
