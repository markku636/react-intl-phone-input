import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import PhoneNumberInput from "../src"

const PLACEHOLDER = "Phone number"

describe("PhoneNumberInput", () => {
  it("renders the phone input", () => {
    render(<PhoneNumberInput validationLevel="strict" defaultCountry="MY" />)
    expect(screen.getByPlaceholderText(PLACEHOLDER)).toBeInTheDocument()
  })

  it("emits E.164 when the typed number is valid", () => {
    const onChange = vi.fn()
    render(
      <PhoneNumberInput
        validationLevel="strict"
        defaultCountry="MY"
        onChange={onChange}
      />,
    )
    const input = screen.getByPlaceholderText(PLACEHOLDER)
    fireEvent.change(input, { target: { value: "123456789" } })
    expect(onChange).toHaveBeenLastCalledWith("+60123456789")
  })

  it("strips a leading zero while typing", () => {
    render(<PhoneNumberInput validationLevel="strict" defaultCountry="MY" />)
    const input = screen.getByPlaceholderText(PLACEHOLDER)
    fireEvent.change(input, { target: { value: "0123" } })
    expect(input).toHaveValue("123")
  })

  it("warns when a lone zero is entered", async () => {
    render(<PhoneNumberInput validationLevel="strict" defaultCountry="MY" />)
    const input = screen.getByPlaceholderText(PLACEHOLDER)
    fireEvent.change(input, { target: { value: "0" } })
    expect(
      await screen.findByText("Phone number cannot start with 0"),
    ).toBeInTheDocument()
  })

  it("clears the number and emits once when defaultCountry changes", () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <PhoneNumberInput
        validationLevel="strict"
        defaultCountry="MY"
        onChange={onChange}
      />,
    )
    const input = screen.getByPlaceholderText(PLACEHOLDER)
    fireEvent.change(input, { target: { value: "123456789" } })

    onChange.mockClear()
    rerender(
      <PhoneNumberInput
        validationLevel="strict"
        defaultCountry="TH"
        onChange={onChange}
      />,
    )
    expect(input).toHaveValue("")
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith("")
  })

  it("honours a messages override", () => {
    render(
      <PhoneNumberInput
        validationLevel="strict"
        defaultCountry="MY"
        messages={{ placeholder: "輸入電話號碼" }}
      />,
    )
    expect(screen.getByPlaceholderText("輸入電話號碼")).toBeInTheDocument()
  })
})
