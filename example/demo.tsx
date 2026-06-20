import { useState } from "react"
import ReactDOM from "react-dom"

import PhoneNumberInput, { validatePhoneNumber } from "../src"
import type { ValidationLevel } from "../src"
import "../src/styles.css"

function Field({
  label,
  initial = "",
  defaultCountry,
  level,
  required,
}: {
  label: string
  initial?: string
  defaultCountry?: string
  level: ValidationLevel
  required?: boolean
}) {
  const [value, setValue] = useState(initial)
  // Validate on blur (and reflect it live once the field has been touched).
  const [touched, setTouched] = useState(initial !== "" || Boolean(required))

  const result = validatePhoneNumber(value, { level })
  const isEmptyRequired = required && !value
  const invalid = touched && (isEmptyRequired || (!!value && !result.valid))

  let status = null
  if (touched) {
    if (value && result.valid) {
      status = <div className="status status--ok">✓ Valid · {level}</div>
    } else if (value && !result.valid) {
      status = (
        <div className="status status--bad">✗ Invalid · {result.reason}</div>
      )
    } else if (isEmptyRequired) {
      status = <div className="status status--bad">Phone Number is required</div>
    }
  }

  return (
    <div className="field">
      <label className="field__label">{label}</label>
      <PhoneNumberInput
        value={value}
        onChange={setValue}
        onBlur={() => setTouched(true)}
        defaultCountry={defaultCountry}
        validationLevel={level}
        classNames={invalid ? { group: "ripn-error" } : undefined}
      />
      {status}
      <div className="field__value">value: {value || "—"}</div>
    </div>
  )
}

function Demo() {
  return (
    <div className="page">
      <div className="card">
        <h1 className="title">react-intl-phone-input</h1>
        <p className="subtitle">
          antd-free · E.164 · google-libphonenumber · themeable
        </p>
        <Field
          label="Malaysia — valid mobile"
          initial="+60123456789"
          defaultCountry="MY"
          level="mobile-strict"
        />
        <Field
          label="Thailand — too long (validation catches it)"
          initial="+6688888889999"
          defaultCountry="TH"
          level="strict"
        />
        <Field
          label="Vietnam — required (error state)"
          defaultCountry="VN"
          level="strict"
          required
        />
      </div>
    </div>
  )
}

ReactDOM.render(<Demo />, document.getElementById("root"))
