/**
 * i18n: a typed `messages` object with English defaults AND/OR a `t(key, vars)`
 * function. Precedence: a present-and-resolved `t` translation wins; otherwise
 * the `messages` override; otherwise the built-in English default. The `t` path
 * is keyed by the legacy `Label_PhoneNumber_*` keys so existing apps reuse their
 * react-i18next locale files with zero key duplication.
 */
import type { PhoneNumberKind, PhoneValidationReason } from "./core/types"

export interface Messages {
  placeholder: string
  zeroHint: string
  ruleHintTitle: string
  /** Interpolated with {{example}} and {{lengths}}. */
  ruleHintLine: string
  /** Interpolated with {{lengths}}. */
  ruleHintLineNoExample: string

  reasonInvalidCountryCode: string
  reasonNotANumber: string
  reasonTooShort: string
  reasonTooLong: string
  reasonInvalidLength: string
  reasonNotValid: string

  typeMOBILE: string
  typeFIXED_LINE: string
  typeFIXED_LINE_OR_MOBILE: string
  typeTOLL_FREE: string
  typePREMIUM_RATE: string
  typeSHARED_COST: string
  typeVOIP: string
  typePERSONAL_NUMBER: string
  typePAGER: string
  typeUAN: string
  typeVOICEMAIL: string
}

export type TranslateFn = (
  key: string,
  vars?: Record<string, string | number>,
) => string

export const DEFAULT_MESSAGES: Messages = {
  placeholder: "Phone number",
  zeroHint: "Phone number cannot start with 0",
  ruleHintTitle: "Accepted number formats:",
  ruleHintLine: "{{example}} ({{lengths}} digits)",
  ruleHintLineNoExample: "{{lengths}} digits",

  reasonInvalidCountryCode: "Invalid country code.\n(INVALID_COUNTRY_CODE)",
  reasonNotANumber: "Phone number contains invalid characters.\n(NOT_A_NUMBER)",
  reasonTooShort: "Phone number is too short.\n(TOO_SHORT)",
  reasonTooLong: "Phone number is too long.\n(TOO_LONG)",
  reasonInvalidLength:
    "Phone number length does not match this country's numbering rules.\n(INVALID_LENGTH)",
  reasonNotValid:
    "Number length is valid but it is not a recognized number in this region.\n(NOT_VALID)",

  typeMOBILE: "Mobile",
  typeFIXED_LINE: "Landline",
  typeFIXED_LINE_OR_MOBILE: "Landline / Mobile",
  typeTOLL_FREE: "Toll-free",
  typePREMIUM_RATE: "Premium rate",
  typeSHARED_COST: "Shared cost",
  typeVOIP: "VoIP",
  typePERSONAL_NUMBER: "Personal number",
  typePAGER: "Pager",
  typeUAN: "UAN",
  typeVOICEMAIL: "Voicemail",
}

/** typed key → legacy i18n key, so a `t` function reuses existing translations. */
const KEY_MAP: Record<keyof Messages, string> = {
  placeholder: "Label_PhoneNumber_Placeholder",
  zeroHint: "Label_PhoneNumber_ZeroHint",
  ruleHintTitle: "Label_PhoneNumber_RuleHintTitle",
  ruleHintLine: "Label_PhoneNumber_RuleHintLine",
  ruleHintLineNoExample: "Label_PhoneNumber_RuleHintLineNoExample",

  reasonInvalidCountryCode: "Label_PhoneNumber_InvalidCountryCode",
  reasonNotANumber: "Label_PhoneNumber_NotANumber",
  reasonTooShort: "Label_PhoneNumber_TooShort",
  reasonTooLong: "Label_PhoneNumber_TooLong",
  reasonInvalidLength: "Label_PhoneNumber_InvalidLength",
  reasonNotValid: "Label_PhoneNumber_NotValid",

  typeMOBILE: "Label_PhoneNumber_Type_MOBILE",
  typeFIXED_LINE: "Label_PhoneNumber_Type_FIXED_LINE",
  typeFIXED_LINE_OR_MOBILE: "Label_PhoneNumber_Type_FIXED_LINE_OR_MOBILE",
  typeTOLL_FREE: "Label_PhoneNumber_Type_TOLL_FREE",
  typePREMIUM_RATE: "Label_PhoneNumber_Type_PREMIUM_RATE",
  typeSHARED_COST: "Label_PhoneNumber_Type_SHARED_COST",
  typeVOIP: "Label_PhoneNumber_Type_VOIP",
  typePERSONAL_NUMBER: "Label_PhoneNumber_Type_PERSONAL_NUMBER",
  typePAGER: "Label_PhoneNumber_Type_PAGER",
  typeUAN: "Label_PhoneNumber_Type_UAN",
  typeVOICEMAIL: "Label_PhoneNumber_Type_VOICEMAIL",
}

const REASON_KEY: Record<PhoneValidationReason, keyof Messages> = {
  INVALID_COUNTRY_CODE: "reasonInvalidCountryCode",
  NOT_A_NUMBER: "reasonNotANumber",
  TOO_SHORT: "reasonTooShort",
  TOO_LONG: "reasonTooLong",
  INVALID_LENGTH: "reasonInvalidLength",
  NOT_VALID: "reasonNotValid",
}

function interpolate(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key) =>
    key in vars ? String(vars[key]) : `{{${key}}}`,
  )
}

export interface MessageResolver {
  text(key: keyof Messages, vars?: Record<string, string | number>): string
  reason(reason: PhoneValidationReason): string
  type(kind: PhoneNumberKind): string
}

export function makeResolver(
  messages?: Partial<Messages>,
  t?: TranslateFn,
): MessageResolver {
  const merged: Messages = { ...DEFAULT_MESSAGES, ...messages }

  const text = (
    key: keyof Messages,
    vars?: Record<string, string | number>,
  ): string => {
    if (t) {
      const legacyKey = KEY_MAP[key]
      const translated = t(legacyKey, vars)
      // i18next echoes the key back on a miss — fall through in that case.
      if (translated && translated !== legacyKey) return translated
    }
    return interpolate(merged[key], vars)
  }

  return {
    text,
    reason: (reason) => text(REASON_KEY[reason]),
    type: (kind) => text(`type${kind}` as keyof Messages),
  }
}
