import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type Ref,
} from "react"

import {
  blurFormat,
  formatNational,
  getCountryCallingCode,
  getPhoneTypeHints,
  isValidByLevel,
  parseE164,
  toE164,
} from "./core"
import type {
  CountryCode,
  IPhoneTypeRule,
  PhoneNumberKind,
  ValidationLevel,
} from "./core"
import { CountrySelect } from "./CountrySelect"
import { InfoIcon } from "./InfoIcon"
import {
  makeResolver,
  type Messages,
  type TranslateFn,
} from "./messages"
import { PhoneTextInput } from "./PhoneTextInput"
import { Tooltip } from "./Tooltip"

/** Hint defaults: mobile + landline only (incl. the shared FIXED_LINE_OR_MOBILE). */
const DEFAULT_HINT_TYPES: PhoneNumberKind[] = [
  "MOBILE",
  "FIXED_LINE",
  "FIXED_LINE_OR_MOBILE",
]

export interface IPhoneNumberInputProps {
  /** Controlled E.164 value, e.g. "+66948383493". Empty string when cleared. */
  value?: string
  /**
   * Emits E.164 when the number satisfies `validationLevel`; otherwise emits a
   * truthy partial "+<callingCode><digits>" so a "required" rule cannot mask a
   * "format" rule. Empty string only when the national part is empty.
   */
  onChange?: (value: string) => void
  onBlur?: () => void
  /** ISO country (e.g. "MY"). Changing it adopts the new country and clears the number. */
  defaultCountry?: CountryCode
  disabled?: boolean
  /** REQUIRED. Decides what counts as "valid" for emit + the standalone validator. */
  validationLevel: ValidationLevel
  /** Which hint types the info-icon tooltip shows. Default: mobile + landline. */
  hintTypes?: PhoneNumberKind[]
  /** i18n strings; unspecified keys fall back to built-in English. */
  messages?: Partial<Messages>
  /** Optional translate fn (e.g. react-i18next's t). Wins over `messages`. */
  t?: TranslateFn
  /** Fires when computed validity (per validationLevel) changes. */
  onValidityChange?: (isValid: boolean) => void

  className?: string
  style?: CSSProperties
  classNames?: Partial<
    Record<
      "root" | "group" | "select" | "dropdown" | "option" | "input" | "tooltip" | "infoIcon",
      string
    >
  >
  id?: string
  name?: string
  "aria-label"?: string
  inputRef?: Ref<HTMLInputElement>
}

/** International phone number input — antd-free, E.164 in/out, leveled validation. */
function PhoneNumberInput({
  value,
  onChange,
  onBlur,
  defaultCountry,
  disabled,
  validationLevel,
  hintTypes = DEFAULT_HINT_TYPES,
  messages,
  t,
  onValidityChange,
  className,
  style,
  classNames,
  id,
  name,
  "aria-label": ariaLabel,
  inputRef,
}: IPhoneNumberInputProps) {
  const resolve = makeResolver(messages, t)

  const parsed = parseE164(value ?? "")
  const initCountry = parsed.country ?? defaultCountry
  const initDisplay = (() => {
    if (!value) return ""
    const country = parsed.country ?? defaultCountry
    if (country) {
      const formatted = formatNational(country, parsed.nationalNumber)
      if (formatted) return formatted
    }
    return parsed.nationalNumber
  })()

  const [country, setCountry] = useState<CountryCode | undefined>(initCountry)
  const [displayValue, setDisplayValue] = useState(initDisplay)
  const [showZeroHint, setShowZeroHint] = useState(false)
  const [typeHints, setTypeHints] = useState<IPhoneTypeRule[]>([])

  const lastEmittedRef = useRef(value ?? "")
  const hintTypesKey = hintTypes.join(",")

  // Sync from external value (modal pre-fill, form.setFieldsValue).
  useEffect(() => {
    const incoming = value ?? ""
    if (incoming === lastEmittedRef.current) return
    lastEmittedRef.current = incoming
    const next = parseE164(incoming)
    const resolvedCountry = next.country ?? defaultCountry
    setCountry(resolvedCountry)
    if (incoming && resolvedCountry) {
      const formatted = formatNational(resolvedCountry, next.nationalNumber)
      setDisplayValue(formatted || next.nationalNumber)
    } else {
      setDisplayValue(next.nationalNumber)
    }
  }, [value, defaultCountry])

  // Load per-type hint rules when the country (or requested hint types) change.
  useEffect(() => {
    if (!country) {
      setTypeHints([])
      return
    }
    const rules = getPhoneTypeHints(country).filter((rule) =>
      hintTypes.includes(rule.type),
    )
    setTypeHints(rules)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, hintTypesKey])

  // When the caller changes defaultCountry (currency selector), adopt + clear.
  useEffect(() => {
    if (defaultCountry && defaultCountry !== country) {
      setCountry(defaultCountry)
      setDisplayValue("")
      lastEmittedRef.current = ""
      onChange?.("")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultCountry])

  // Report validity only when the caller opted in (avoids a parse per keystroke).
  useEffect(() => {
    if (!onValidityChange) return
    onValidityChange(
      value ? isValidByLevel(value, { level: validationLevel }) : false,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, validationLevel])

  const handleCountryChange = (newCountry: CountryCode) => {
    setCountry(newCountry)
    setDisplayValue("")
    lastEmittedRef.current = ""
    onChange?.("")
  }

  const emitDigits = (resolvedCountry: CountryCode, digits: string) => {
    const e164 = toE164(resolvedCountry, digits)
    const valid = e164
      ? isValidByLevel(e164, { country: resolvedCountry, level: validationLevel })
      : false
    if (valid) {
      lastEmittedRef.current = e164
      onChange?.(e164)
    } else {
      // Truthy-but-invalid so a "required" rule doesn't fire instead of "format".
      const partial = `+${getCountryCallingCode(resolvedCountry)}${digits}`
      lastEmittedRef.current = partial
      onChange?.(partial)
    }
  }

  const handleNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    const isPaste =
      (event.nativeEvent as InputEvent).inputType === "insertFromPaste"
    const raw = event.target.value.replace(/\D/g, "")

    if (isPaste) {
      const digits = raw.replace(/^0+/, "")
      setDisplayValue(digits)
      setShowZeroHint(false)
      if (!country || !digits) {
        lastEmittedRef.current = ""
        onChange?.("")
        return
      }
      emitDigits(country, digits)
      return
    }

    if (raw === "0") {
      setDisplayValue("0")
      setShowZeroHint(true)
      lastEmittedRef.current = ""
      onChange?.("")
      return
    }

    const digits = raw.replace(/^0+/, "")
    setDisplayValue(digits)
    setShowZeroHint(false)

    if (!country || !digits) {
      lastEmittedRef.current = ""
      onChange?.("")
      return
    }
    emitDigits(country, digits)
  }

  const handleNumberFocus = () => {
    setDisplayValue((prev) => prev.replace(/\D/g, ""))
  }

  const handleNumberBlur = () => {
    setShowZeroHint(false)
    if (!country) {
      onBlur?.()
      return
    }
    const digits = displayValue.replace(/\D/g, "").replace(/^0+/, "")
    if (!digits) {
      setDisplayValue("")
      onBlur?.()
      return
    }
    const formatted = blurFormat(country, digits)
    if (formatted) setDisplayValue(formatted)
    const e164 = toE164(country, digits)
    if (e164 && isValidByLevel(e164, { country, level: validationLevel })) {
      lastEmittedRef.current = e164
      onChange?.(e164)
    }
    onBlur?.()
  }

  const ruleHintContent = typeHints.length ? (
    <div className="ripn-rulehint">
      <div className="ripn-rulehint__title">{resolve.text("ruleHintTitle")}</div>
      {typeHints.map((rule) => {
        const lengths = rule.lengths.join("/")
        const detail = rule.example
          ? resolve.text("ruleHintLine", { example: rule.example, lengths })
          : resolve.text("ruleHintLineNoExample", { lengths })
        return (
          <div key={rule.type} className="ripn-rulehint__line">
            {resolve.type(rule.type)}: {detail}
          </div>
        )
      })}
    </div>
  ) : null

  return (
    <div
      className={[
        "ripn-root",
        classNames?.root ?? "",
        className ?? "",
        disabled ? "ripn--disabled" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      id={id}
    >
      <div className={`ripn-group ${classNames?.group ?? ""}`}>
        <CountrySelect
          value={country}
          onChange={handleCountryChange}
          disabled={disabled}
          classNames={{
            select: classNames?.select,
            dropdown: classNames?.dropdown,
            option: classNames?.option,
          }}
          ariaLabel={ariaLabel}
        />
        <Tooltip
          open={showZeroHint}
          variant="warning"
          content={resolve.text("zeroHint")}
          triggerClassName="ripn-input-trigger"
          className={classNames?.tooltip}
        >
          <PhoneTextInput
            value={displayValue}
            disabled={disabled}
            placeholder={resolve.text("placeholder")}
            onChange={handleNumberChange}
            onFocus={handleNumberFocus}
            onBlur={handleNumberBlur}
            inputRef={inputRef}
            name={name}
            id={id ? `${id}-input` : undefined}
            ariaLabel={ariaLabel}
            className={classNames?.input}
            suffix={
              ruleHintContent ? (
                <Tooltip content={ruleHintContent} className={classNames?.tooltip}>
                  <span className={`ripn-info-btn ${classNames?.infoIcon ?? ""}`}>
                    <InfoIcon />
                  </span>
                </Tooltip>
              ) : null
            }
          />
        </Tooltip>
      </div>
    </div>
  )
}

export default PhoneNumberInput
