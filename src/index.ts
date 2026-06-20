/**
 * Public entry. Also import the stylesheet once in your app:
 *   import "react-intl-phone-input/styles.css"
 */
import PhoneNumberInput from "./PhoneNumberInput"

export default PhoneNumberInput
export { PhoneNumberInput }
export type { IPhoneNumberInputProps } from "./PhoneNumberInput"

export {
  DEFAULT_MESSAGES,
  makeResolver,
  type Messages,
  type TranslateFn,
  type MessageResolver,
} from "./messages"

// Framework-agnostic core (also published at `react-intl-phone-input/core`).
export {
  validatePhoneNumber,
  isValidByLevel,
  getPhoneNumberError,
  phoneReasonI18nKey,
  parseE164,
  toE164,
  formatNational,
  blurFormat,
  getCountryCallingCode,
  listSupportedCountries,
  buildCountryOptions,
  getPhoneTypeHints,
  getPhoneExampleHint,
  PREFERRED_COUNTRIES,
  DIVIDER_VALUE,
} from "./core"

export type {
  CountryCode,
  ValidationLevel,
  PhoneValidationReason,
  PhoneNumberKind,
  ValidateOptions,
  ValidateResult,
  IPhoneExampleHint,
  IPhoneTypeRule,
  ICountryOption,
} from "./core"
