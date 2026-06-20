/**
 * Per-country, per-type example numbers + possible lengths, shown in the info-
 * icon tooltip. Synchronous now that google-libphonenumber is a normal dependency
 * (the original code dynamically imported it). Every path is wrapped so an
 * unsupported region can never crash render — failures degrade to [] / null.
 */
import {
  PhoneNumberFormat,
  PhoneNumberType,
  util,
  utilExtra,
} from "./libphone"
import type {
  CountryCode,
  IPhoneExampleHint,
  IPhoneTypeRule,
  PhoneNumberKind,
} from "./types"

/** Second arg type of getExampleNumberForType (the PhoneNumberType enum value). */
type GlNumberType = Parameters<typeof util.getExampleNumberForType>[1]

const PHONE_KIND_BY_VALUE: Record<number, PhoneNumberKind> = {
  0: "FIXED_LINE",
  1: "MOBILE",
  2: "FIXED_LINE_OR_MOBILE",
  3: "TOLL_FREE",
  4: "PREMIUM_RATE",
  5: "SHARED_COST",
  6: "VOIP",
  7: "PERSONAL_NUMBER",
  8: "PAGER",
  9: "UAN",
  10: "VOICEMAIL",
}

/** Kind → metadata getter that exposes possibleLengthArray(). */
const PHONE_DESC_GETTER: Record<PhoneNumberKind, string> = {
  MOBILE: "getMobile",
  FIXED_LINE: "getFixedLine",
  FIXED_LINE_OR_MOBILE: "getFixedLine",
  TOLL_FREE: "getTollFree",
  PREMIUM_RATE: "getPremiumRate",
  SHARED_COST: "getSharedCost",
  VOIP: "getVoip",
  PERSONAL_NUMBER: "getPersonalNumber",
  PAGER: "getPager",
  UAN: "getUan",
  VOICEMAIL: "getVoicemail",
}

/** Display order: mobile + landline first. */
const PHONE_KIND_ORDER: PhoneNumberKind[] = [
  "MOBILE",
  "FIXED_LINE",
  "FIXED_LINE_OR_MOBILE",
  "TOLL_FREE",
  "PREMIUM_RATE",
  "SHARED_COST",
  "UAN",
  "PERSONAL_NUMBER",
  "VOIP",
  "PAGER",
  "VOICEMAIL",
]

/** Mobile example + digit count for a country (null when none). */
export function getPhoneExampleHint(
  country: CountryCode,
): IPhoneExampleHint | null {
  try {
    const sample = util.getExampleNumberForType(country, PhoneNumberType.MOBILE)
    if (!sample) return null
    return {
      example: util.format(sample, PhoneNumberFormat.NATIONAL),
      digits: util.getNationalSignificantNumber(sample).length,
    }
  } catch {
    return null
  }
}

/** Example + possible lengths for every number type a country supports. */
export function getPhoneTypeHints(country: CountryCode): IPhoneTypeRule[] {
  try {
    const supportedTypes = Array.from(
      utilExtra.getSupportedTypesForRegion(country),
    )
    const metadata = utilExtra.getMetadataForRegion(country)

    const rules = supportedTypes
      .map((value): IPhoneTypeRule | null => {
        const kind = PHONE_KIND_BY_VALUE[value]
        if (!kind) return null

        let example = ""
        try {
          const sample = util.getExampleNumberForType(
            country,
            value as GlNumberType,
          )
          if (sample) {
            example = util
              .format(sample, PhoneNumberFormat.NATIONAL)
              .replace(/^0+/, "")
          }
        } catch {
          // no example for this type — keep lengths only
        }

        let lengths: number[] = []
        try {
          const desc = metadata[PHONE_DESC_GETTER[kind]]?.()
          lengths = desc?.possibleLengthArray?.() ?? []
        } catch {
          // lengths unavailable
        }

        return { type: kind, example, lengths }
      })
      .filter((rule): rule is IPhoneTypeRule => rule !== null)

    return rules.sort(
      (first, second) =>
        PHONE_KIND_ORDER.indexOf(first.type) -
        PHONE_KIND_ORDER.indexOf(second.type),
    )
  } catch {
    return []
  }
}
