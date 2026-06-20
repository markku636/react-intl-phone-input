import type { ChangeEvent, ReactNode, Ref } from "react"

interface PhoneTextInputProps {
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  onFocus?: () => void
  onBlur?: () => void
  disabled?: boolean
  placeholder?: string
  /** Right-aligned slot (the info-icon tooltip). */
  suffix?: ReactNode
  inputRef?: Ref<HTMLInputElement>
  name?: string
  id?: string
  ariaLabel?: string
  ariaInvalid?: boolean
  describedBy?: string
  className?: string
}

/** Native `<input type="tel">` + optional suffix (replaces antd `Input`). */
export function PhoneTextInput({
  value,
  onChange,
  onFocus,
  onBlur,
  disabled,
  placeholder,
  suffix,
  inputRef,
  name,
  id,
  ariaLabel,
  ariaInvalid,
  describedBy,
  className,
}: PhoneTextInputProps) {
  return (
    <span className="ripn-input-shell">
      <input
        ref={inputRef}
        type="tel"
        className={`ripn-input ${className ?? ""}`}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        name={name}
        id={id}
        aria-label={ariaLabel}
        aria-invalid={ariaInvalid || undefined}
        aria-describedby={describedBy}
        autoComplete="tel-national"
        inputMode="numeric"
      />
      {suffix ? <span className="ripn-suffix">{suffix}</span> : null}
    </span>
  )
}
