import { fireEvent, render, screen } from "@testing-library/react"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import PhoneNumberInput from "../src"
import type { IPhoneNumberInputProps } from "../src"

const PLACEHOLDER = "Phone number"

/** Controlled wrapper — the built-in error renders from the `value` prop. */
function Controlled(props: Omit<IPhoneNumberInputProps, "value" | "onChange">) {
  const [value, setValue] = useState("")
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <PhoneNumberInput value={value} onChange={setValue} {...props} />
}

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

  it("shows the built-in error after blur when showError is set", () => {
    render(<Controlled validationLevel="strict" defaultCountry="TH" showError />)
    const input = screen.getByPlaceholderText(PLACEHOLDER)
    fireEvent.change(input, { target: { value: "12" } }) // too short for TH
    fireEvent.blur(input)
    expect(screen.getByRole("alert")).toHaveTextContent("Phone number is too short.")
    expect(input).toHaveAttribute("aria-invalid", "true")
  })

  it("shows no error for a valid number", () => {
    render(<Controlled validationLevel="strict" defaultCountry="MY" showError />)
    const input = screen.getByPlaceholderText(PLACEHOLDER)
    fireEvent.change(input, { target: { value: "123456789" } }) // valid MY mobile
    fireEvent.blur(input)
    expect(screen.queryByRole("alert")).toBeNull()
  })

  it("renders an explicit error prop (overriding the built-in one)", () => {
    render(
      <PhoneNumberInput
        validationLevel="strict"
        defaultCountry="VN"
        error="Phone Number is required"
      />,
    )
    expect(screen.getByRole("alert")).toHaveTextContent("Phone Number is required")
  })
})
