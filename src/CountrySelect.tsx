import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react"

import {
  buildCountryOptions,
  getCountryCallingCode,
  type ICountryOption,
} from "./core/countries"
import type { CountryCode } from "./core/types"
import { FlagIcon } from "./FlagIcon"
import { useOutsideClick } from "./useOutsideClick"

// Built once — pure data derived from google-libphonenumber's region list.
const COUNTRY_OPTIONS = buildCountryOptions()

function firstSelectable(options: ICountryOption[]): number {
  return options.findIndex((option) => !option.divider)
}

function nextSelectable(
  options: ICountryOption[],
  from: number,
  dir: 1 | -1,
): number {
  const count = options.length
  if (count === 0) return -1
  let index = from
  for (let step = 0; step < count; step += 1) {
    index += dir
    if (index < 0) index = count - 1
    if (index >= count) index = 0
    const option = options[index]
    if (option && !option.divider) return index
  }
  return from
}

interface CountrySelectProps {
  value?: CountryCode
  onChange: (country: CountryCode) => void
  disabled?: boolean
  classNames?: { select?: string; dropdown?: string; option?: string }
  ariaLabel?: string
}

/** Accessible combobox replacing antd `Select`: flag + calling code, searchable. */
export function CountrySelect({
  value,
  onChange,
  disabled,
  classNames,
  ariaLabel,
}: CountrySelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [activeIndex, setActiveIndex] = useState(-1)
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useOutsideClick(rootRef, () => setOpen(false), open)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return COUNTRY_OPTIONS
    return COUNTRY_OPTIONS.filter((option) => {
      if (option.divider) return false
      return `${option.callingCode} ${option.countryName}`
        .toLowerCase()
        .includes(query)
    })
  }, [search])

  // On open: focus the search box and highlight the first option. On close: reset.
  useEffect(() => {
    if (!open) {
      setSearch("")
      return undefined
    }
    setActiveIndex(firstSelectable(COUNTRY_OPTIONS))
    const handle = window.setTimeout(() => searchRef.current?.focus(), 0)
    return () => window.clearTimeout(handle)
  }, [open])

  // Keep the highlight valid as the filtered list changes.
  useEffect(() => {
    if (open) setActiveIndex(firstSelectable(filtered))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  // Scroll the active option into view (guarded — jsdom has no scrollIntoView).
  useEffect(() => {
    if (!open || activeIndex < 0) return
    const active = filtered[activeIndex]
    if (!active) return
    const element = document.getElementById(`ripn-opt-${active.value}`)
    if (element && typeof element.scrollIntoView === "function") {
      element.scrollIntoView({ block: "nearest" })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, open])

  const selectAt = (index: number) => {
    const option = filtered[index]
    if (!option || option.divider) return
    onChange(option.value)
    setOpen(false)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault()
        setActiveIndex((index) => nextSelectable(filtered, index, 1))
        break
      case "ArrowUp":
        event.preventDefault()
        setActiveIndex((index) => nextSelectable(filtered, index, -1))
        break
      case "Enter":
        event.preventDefault()
        selectAt(activeIndex)
        break
      case "Escape":
        event.preventDefault()
        setOpen(false)
        break
      default:
        break
    }
  }

  const callingCode = value ? `+${getCountryCallingCode(value)}` : "—"
  const activeOption = activeIndex >= 0 ? filtered[activeIndex] : undefined

  return (
    <div className="ripn-select-wrap" ref={rootRef}>
      <button
        type="button"
        className={`ripn-select ${classNames?.select ?? ""}`}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel ? `${ariaLabel} country code` : "Country calling code"}
        onClick={() => {
          if (!disabled) setOpen((isOpen) => !isOpen)
        }}
      >
        {value ? <FlagIcon code={value} className="ripn-select__flag" /> : null}
        <span className="ripn-select__code">{callingCode}</span>
        <span className="ripn-select__caret" aria-hidden>
          ▾
        </span>
      </button>

      {open ? (
        <div className={`ripn-dropdown ${classNames?.dropdown ?? ""}`}>
          <input
            ref={searchRef}
            className="ripn-dropdown__search"
            type="text"
            value={search}
            placeholder="Search country or code"
            aria-label="Search country or calling code"
            aria-activedescendant={
              activeOption ? `ripn-opt-${activeOption.value}` : undefined
            }
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={onKeyDown}
          />
          <ul className="ripn-dropdown__list" role="listbox" aria-label="Countries">
            {filtered.length === 0 ? (
              <li className="ripn-dropdown__empty">No match</li>
            ) : (
              filtered.map((option, index) =>
                option.divider ? (
                  <li
                    key="divider"
                    className="ripn-divider"
                    role="separator"
                    aria-hidden
                  />
                ) : (
                  <li
                    key={option.value}
                    id={`ripn-opt-${option.value}`}
                    role="option"
                    aria-selected={option.value === value}
                    className={[
                      "ripn-option",
                      classNames?.option ?? "",
                      index === activeIndex ? "ripn-option--active" : "",
                      option.value === value ? "ripn-option--selected" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseDown={(event) => {
                      event.preventDefault()
                      selectAt(index)
                    }}
                  >
                    <FlagIcon
                      code={option.countryName}
                      className="ripn-option__flag"
                    />
                    <span className="ripn-option__code">{option.callingCode}</span>
                    <span className="ripn-option__name">{option.countryName}</span>
                  </li>
                ),
              )
            )}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
