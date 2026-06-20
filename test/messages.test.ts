import { describe, expect, it, vi } from "vitest"

import { makeResolver } from "../src/messages"

describe("makeResolver().reason — bridges to the core single source", () => {
  it("returns the core English message by default", () => {
    const resolve = makeResolver()
    expect(resolve.reason("TOO_LONG")).toBe("Phone number is too long.")
    expect(resolve.reason("INVALID_COUNTRY_CODE")).toBe(
      "Invalid country calling code.",
    )
  })

  it("bridges to a t() function via the legacy i18n key", () => {
    const t = vi.fn((key: string) =>
      key === "Label_PhoneNumber_TooShort" ? "太短" : key,
    )
    const resolve = makeResolver(undefined, t)
    expect(resolve.reason("TOO_SHORT")).toBe("太短")
    expect(t).toHaveBeenCalledWith("Label_PhoneNumber_TooShort")
  })

  it("falls back to core English when t() misses (echoes the key)", () => {
    const t = vi.fn((key: string) => key) // i18next echoes the key on a miss
    const resolve = makeResolver(undefined, t)
    expect(resolve.reason("NOT_VALID")).toBe(
      "Number length is valid but it is not a recognized number in this region.",
    )
  })
})
