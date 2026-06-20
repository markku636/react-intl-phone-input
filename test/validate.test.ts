import { describe, expect, it } from "vitest"

import {
  getPhoneNumberError,
  phoneReasonMessage,
  validatePhoneNumber,
} from "../src/core"
import type { ValidationLevel } from "../src/core"

const LEVELS: ValidationLevel[] = ["strict", "mobile-strict", "loose"]

describe("validatePhoneNumber — ported cases", () => {
  it("treats empty value as valid (required is the caller's job)", () => {
    LEVELS.forEach((level) => {
      expect(validatePhoneNumber("", { level })).toEqual({
        valid: true,
        reason: null,
        message: null,
      })
    })
  })

  it("accepts a valid number under strict", () => {
    expect(validatePhoneNumber("+66948383493", { level: "strict" })).toEqual({
      valid: true,
      reason: null,
      message: null,
    })
  })

  it("returns TOO_SHORT for an obviously short number", () => {
    expect(validatePhoneNumber("+6612", { level: "strict" }).reason).toBe(
      "TOO_SHORT",
    )
  })

  it("returns TOO_LONG for an over-long number", () => {
    expect(
      validatePhoneNumber("+6694838349312345", { level: "strict" }).reason,
    ).toBe("TOO_LONG")
  })

  it("returns INVALID_COUNTRY_CODE for an unassigned calling code", () => {
    LEVELS.forEach((level) => {
      expect(validatePhoneNumber("+99912345678", { level }).reason).toBe(
        "INVALID_COUNTRY_CODE",
      )
    })
  })

  it("returns NOT_A_NUMBER for non-numeric input", () => {
    expect(
      validatePhoneNumber("abc", { country: "MY", level: "loose" }).reason,
    ).toBe("NOT_A_NUMBER")
  })
})

describe("validatePhoneNumber — level matrix", () => {
  const validNumbers = [
    "+60123456789", // MY mobile
    "+60323856789", // MY KL landline
    "+66948383493", // TH mobile
  ]

  it("accepts valid mobile/landline numbers at every level", () => {
    validNumbers.forEach((value) => {
      LEVELS.forEach((level) => {
        expect(validatePhoneNumber(value, { level }).valid).toBe(true)
      })
    })
  })

  it("widens with looseness: possible-length-but-pattern-invalid", () => {
    // +10000000000 (US): isPossible=true, isValid=false.
    const value = "+10000000000"
    expect(validatePhoneNumber(value, { level: "strict" })).toMatchObject({
      valid: false,
      reason: "NOT_VALID",
    })
    // mobile-strict accepts it as a possible landline (documented collapse in
    // shared-length regions).
    expect(validatePhoneNumber(value, { level: "mobile-strict" }).valid).toBe(
      true,
    )
    expect(validatePhoneNumber(value, { level: "loose" }).valid).toBe(true)
  })

  it("keeps too-short partials rejected at every level (required cannot mask format)", () => {
    LEVELS.forEach((level) => {
      const result = validatePhoneNumber("+6612", { level })
      expect(result.valid).toBe(false)
      expect(result.reason).toBe("TOO_SHORT")
    })
  })
})

describe("error exposes both the code and an English message", () => {
  it("returns reason (google-derived code) + default English message", () => {
    const result = validatePhoneNumber("+6612", { level: "strict" })
    expect(result.reason).toBe("TOO_SHORT")
    expect(result.message).toBe("Phone number is too short.")
  })

  it("message is null when valid", () => {
    expect(validatePhoneNumber("+66948383493", { level: "strict" }).message).toBeNull()
  })

  it("phoneReasonMessage maps every reason to English text", () => {
    expect(phoneReasonMessage("TOO_LONG")).toBe("Phone number is too long.")
    expect(phoneReasonMessage("INVALID_COUNTRY_CODE")).toBe(
      "Invalid country calling code.",
    )
  })
})

describe("getPhoneNumberError back-compat shim", () => {
  it("defaults to strict and matches the original contract", () => {
    expect(getPhoneNumberError("+66948383493")).toBeNull()
    expect(getPhoneNumberError("+6612")).toBe("TOO_SHORT")
    expect(getPhoneNumberError("+99912345678")).toBe("INVALID_COUNTRY_CODE")
    expect(getPhoneNumberError("+10000000000")).toBe("NOT_VALID")
    expect(getPhoneNumberError("")).toBeNull()
  })
})
