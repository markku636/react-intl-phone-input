/**
 * Single source of truth for phone-validation reasons: the code list, the
 * default English message per code, and the legacy i18n key per code.
 *
 * Both the core validator and the React layer's message resolver read from here,
 * so the wording lives in exactly one place.
 */
import type { PhoneValidationReason } from "./types"

/** All reason codes (mirrors google-libphonenumber's classification). */
export const PHONE_VALIDATION_REASONS: PhoneValidationReason[] = [
  "INVALID_COUNTRY_CODE",
  "NOT_A_NUMBER",
  "TOO_SHORT",
  "TOO_LONG",
  "INVALID_LENGTH",
  "NOT_VALID",
]

const REASON_I18N_KEY: Record<PhoneValidationReason, string> = {
  INVALID_COUNTRY_CODE: "Label_PhoneNumber_InvalidCountryCode",
  NOT_A_NUMBER: "Label_PhoneNumber_NotANumber",
  TOO_SHORT: "Label_PhoneNumber_TooShort",
  TOO_LONG: "Label_PhoneNumber_TooLong",
  INVALID_LENGTH: "Label_PhoneNumber_InvalidLength",
  NOT_VALID: "Label_PhoneNumber_NotValid",
}

/** Default English message per reason code (plain text, no trailing code suffix). */
const REASON_MESSAGE: Record<PhoneValidationReason, string> = {
  INVALID_COUNTRY_CODE: "Invalid country calling code.",
  NOT_A_NUMBER: "Phone number contains invalid characters.",
  TOO_SHORT: "Phone number is too short.",
  TOO_LONG: "Phone number is too long.",
  INVALID_LENGTH:
    "Phone number length does not match this country's numbering rules.",
  NOT_VALID:
    "Number length is valid but it is not a recognized number in this region.",
}

/** Reason code → legacy i18n key (for bridging to react-i18next etc.). */
export const phoneReasonI18nKey = (reason: PhoneValidationReason): string =>
  REASON_I18N_KEY[reason]

/** Reason code → default English message (for callers that want a string). */
export const phoneReasonMessage = (reason: PhoneValidationReason): string =>
  REASON_MESSAGE[reason]
