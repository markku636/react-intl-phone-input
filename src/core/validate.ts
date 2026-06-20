/**
 * The single source of truth for phone validity, usable WITHOUT React.
 *
 * `mobile-strict` note: google-libphonenumber@3.2.44 has NO `isValidNumberForType`,
 * so "mobile must be pattern-valid" is emulated as
 * `isValidNumber(pn) && getNumberType(pn) ∈ {MOBILE, FIXED_LINE_OR_MOBILE}`.
 *
 * Important semantic of `mobile-strict`: in countries where mobile and landline
 * share length ranges (US/MY/TH...), a possible-length number is rescued by the
 * "landline length-only" branch, so `mobile-strict` only REJECTS a number that
 * is mobile-length-possible, mobile-pattern-invalid, AND not landline-length-
 * possible. Discrimination is only observable in disjoint-length regions.
 */
import {
  parseStrict,
  PhoneNumberType,
  util,
  ValidationResult,
  type GlPhoneNumber,
} from "./libphone"
import { phoneReasonMessage } from "./reasons"
import type {
  CountryCode,
  PhoneValidationReason,
  ValidateOptions,
  ValidateResult,
  ValidationLevel,
} from "./types"

const passResult: ValidateResult = { valid: true, reason: null, message: null }

const fail = (reason: PhoneValidationReason): ValidateResult => ({
  valid: false,
  reason,
  message: phoneReasonMessage(reason),
})

const { MOBILE, FIXED_LINE, FIXED_LINE_OR_MOBILE } = PhoneNumberType

const isMobileValid = (pn: GlPhoneNumber): boolean => {
  if (!util.isValidNumber(pn)) return false
  const type = util.getNumberType(pn)
  return type === MOBILE || type === FIXED_LINE_OR_MOBILE
}

const possibleMobile = (pn: GlPhoneNumber): boolean =>
  util.isPossibleNumberForType(pn, MOBILE) ||
  util.isPossibleNumberForType(pn, FIXED_LINE_OR_MOBILE)

const possibleFixed = (pn: GlPhoneNumber): boolean =>
  util.isPossibleNumberForType(pn, FIXED_LINE) ||
  util.isPossibleNumberForType(pn, FIXED_LINE_OR_MOBILE)

/** Pick the most actionable length-based reason from mobile + fixed-line checks. */
function resolveLengthReason(pn: GlPhoneNumber): PhoneValidationReason {
  const results = [
    util.isPossibleNumberForTypeWithReason(pn, MOBILE),
    util.isPossibleNumberForTypeWithReason(pn, FIXED_LINE),
  ]
  const tooShort = (r: number) => r === ValidationResult.TOO_SHORT
  const tooLong = (r: number) => r === ValidationResult.TOO_LONG

  if (results.every(tooShort)) return "TOO_SHORT"
  if (results.every(tooLong)) return "TOO_LONG"
  if (results.some(tooShort) && !results.some(tooLong)) return "TOO_SHORT"
  if (results.some(tooLong) && !results.some(tooShort)) return "TOO_LONG"

  const whole = util.isPossibleNumberWithReason(pn)
  if (tooShort(whole)) return "TOO_SHORT"
  if (tooLong(whole)) return "TOO_LONG"
  return "INVALID_LENGTH"
}

/**
 * Validate a phone number at the given level.
 * Empty `value` is treated as valid (the caller owns the "required" rule).
 * `value` may be E.164 (`+...`) or a national string + `country`.
 */
export function validatePhoneNumber(
  value: string,
  opts: ValidateOptions,
): ValidateResult {
  if (!value) return passResult

  const region = value.startsWith("+") ? undefined : opts.country
  const outcome = parseStrict(value, region)
  if (!outcome.ok) return fail(outcome.reason)
  const pn = outcome.pn

  switch (opts.level) {
    case "strict": {
      if (util.isValidNumber(pn)) return passResult
      if (!util.isPossibleNumber(pn)) return fail(resolveLengthReason(pn))
      return fail("NOT_VALID")
    }
    case "mobile-strict": {
      if (isMobileValid(pn) || possibleFixed(pn)) return passResult
      if (!util.isPossibleNumber(pn)) return fail(resolveLengthReason(pn))
      return fail("NOT_VALID")
    }
    case "loose": {
      if (possibleMobile(pn) || possibleFixed(pn)) return passResult
      return fail(resolveLengthReason(pn))
    }
    default:
      return fail("NOT_VALID")
  }
}

/** Boolean convenience used by the React component's emit logic. */
export function isValidByLevel(value: string, opts: ValidateOptions): boolean {
  return validatePhoneNumber(value, opts).valid
}

/**
 * Back-compat shim. `level` is OPTIONAL here (defaults to `strict`, which matches
 * the original libphonenumber-js `isValidPhoneNumber` semantics) so existing call
 * sites `getPhoneNumberError(value)` keep compiling. The React component prop
 * `validationLevel` is, by contrast, REQUIRED.
 */
export function getPhoneNumberError(
  value: string,
  country?: CountryCode,
  level: ValidationLevel = "strict",
): PhoneValidationReason | null {
  return validatePhoneNumber(value, { country, level }).reason
}
