/**
 * Framework-agnostic barrel. Import from `react-intl-phone-input/core` to use
 * the validation / formatting logic without React (e.g. server-side or form
 * validators).
 */
export type {
  CountryCode,
  ValidationLevel,
  PhoneValidationReason,
  PhoneNumberKind,
  ValidateOptions,
  ValidateResult,
  IPhoneExampleHint,
  IPhoneTypeRule,
} from "./types"

export {
  validatePhoneNumber,
  isValidByLevel,
  getPhoneNumberError,
} from "./validate"

export {
  phoneReasonI18nKey,
  phoneReasonMessage,
  PHONE_VALIDATION_REASONS,
} from "./reasons"

export { parseE164, toE164, formatNational, blurFormat } from "./format"

export {
  getCountryCallingCode,
  listSupportedCountries,
  buildCountryOptions,
  PREFERRED_COUNTRIES,
  DIVIDER_VALUE,
  type ICountryOption,
} from "./countries"

export { getPhoneTypeHints, getPhoneExampleHint } from "./hints"
