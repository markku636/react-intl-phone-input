import { useState } from "react"
import ReactDOM from "react-dom"

import PhoneNumberInput from "../src"
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
  const [valid, setValid] = useState<boolean | null>(null)
  return (
    <div className="field">
      <label className="field__label">{label}</label>
      {/* showError = built-in error display; error = explicit override (required). */}
      <PhoneNumberInput
        value={value}
        onChange={setValue}
        onValidityChange={setValid}
        defaultCountry={defaultCountry}
        validationLevel={level}
        showError
        error={required && !value ? "Phone Number is required" : undefined}
      />
      {value && valid ? (
        <div className="status status--ok">✓ Valid · {level}</div>
      ) : null}
      <div className="field__value">value: {value || "—"}</div>
    </div>
  )
}

function Demo() {
  return (
    <div className="page">
      <div className="card">
        <h1 className="title">react-intl-phone-number</h1>
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
          label="Thailand — too long (built-in error)"
          initial="+6688888889999"
          defaultCountry="TH"
          level="strict"
        />
        <Field
          label="Vietnam — required (error prop)"
          defaultCountry="VN"
          level="strict"
          required
        />
      </div>
    </div>
  )
}

ReactDOM.render(<Demo />, document.getElementById("root"))
