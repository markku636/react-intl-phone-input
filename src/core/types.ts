/**
 * Framework-agnostic types. No React, no google-libphonenumber runtime import.
 */

/** ISO 3166-1 alpha-2 region code, e.g. "MY", "TH", "US". */
export type CountryCode = string

/**
 * How strict validation is.
 * - `strict`        — mobile AND landline must fully match the country pattern.
 * - `mobile-strict` — mobile must be pattern-valid; landline only length-checked.
 * - `loose`         — mobile and landline both only length-checked.
 */
export type ValidationLevel = "strict" | "mobile-strict" | "loose"

/** Detailed failure reason (kept in sync with the backend PhoneNumberValidator taxonomy). */
export type PhoneValidationReason =
  | "INVALID_COUNTRY_CODE"
  | "NOT_A_NUMBER"
  | "TOO_SHORT"
  | "TOO_LONG"
  | "INVALID_LENGTH"
  | "NOT_VALID"

/** google-libphonenumber number type names (map to i18n keys `Label_PhoneNumber_Type_*`). */
export type PhoneNumberKind =
  | "MOBILE"
  | "FIXED_LINE"
  | "FIXED_LINE_OR_MOBILE"
  | "TOLL_FREE"
  | "PREMIUM_RATE"
  | "SHARED_COST"
  | "VOIP"
  | "PERSONAL_NUMBER"
  | "PAGER"
  | "UAN"
  | "VOICEMAIL"

export interface ValidateOptions {
  /** Default region used only when `value` has no `+` country prefix. */
  country?: CountryCode
  level: ValidationLevel
}

export interface ValidateResult {
  valid: boolean
  reason: PhoneValidationReason | null
}

export interface IPhoneExampleHint {
  /** Nationally formatted example number, e.g. "08 1234 5678". */
  example: string
  /** National significant number digit count. */
  digits: number
}

export interface IPhoneTypeRule {
  type: PhoneNumberKind
  /** Nationally formatted example (leading 0 stripped); "" when no example exists. */
  example: string
  /** Possible national digit counts for this type, e.g. [9, 10]. */
  lengths: number[]
}
