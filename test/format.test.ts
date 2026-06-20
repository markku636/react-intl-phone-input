import { describe, expect, it } from "vitest"

import {
  formatNational,
  getCountryCallingCode,
  getPhoneExampleHint,
  getPhoneTypeHints,
  parseE164,
  toE164,
} from "../src/core"

describe("parse / format round trips", () => {
  it("splits an E.164 number into region + national significant number", () => {
    expect(parseE164("+66948383493")).toEqual({
      country: "TH",
      nationalNumber: "948383493",
    })
  })

  it("returns an empty result for junk input", () => {
    expect(parseE164("not-a-number")).toEqual({ nationalNumber: "" })
  })

  it("builds E.164 from national digits + region", () => {
    expect(toE164("TH", "948383493")).toBe("+66948383493")
  })

  it("formats nationally with the national-trunk 0 stripped", () => {
    const formatted = formatNational("TH", "948383493")
    expect(formatted.startsWith("0")).toBe(false)
    expect(formatted.replace(/\D/g, "")).toBe("948383493")
    expect(formatted).toMatch(/\s/) // grouped with spaces
  })
})

describe("country helpers", () => {
  it("returns the calling code for a known region", () => {
    expect(getCountryCallingCode("TH")).toBe("66")
    expect(getCountryCallingCode("MY")).toBe("60")
  })

  it("returns an empty string for an unknown region", () => {
    expect(getCountryCallingCode("ZZ")).toBe("")
  })
})

describe("hints", () => {
  it("returns example + lengths for every supported type", () => {
    const hints = getPhoneTypeHints("TH")
    expect(hints.length).toBeGreaterThan(0)
    const mobile = hints.find((rule) => rule.type === "MOBILE")
    expect(mobile).toBeDefined()
    expect(mobile?.lengths.length).toBeGreaterThan(0)
  })

  it("returns a mobile example hint for a supported country", () => {
    const hint = getPhoneExampleHint("TH")
    expect(hint).not.toBeNull()
    expect(hint?.example.length).toBeGreaterThan(0)
    expect(hint?.digits).toBeGreaterThan(0)
  })

  it("degrades to [] / null for an unsupported region rather than throwing", () => {
    expect(getPhoneTypeHints("ZZ")).toEqual([])
    expect(getPhoneExampleHint("ZZ")).toBeNull()
  })
})
