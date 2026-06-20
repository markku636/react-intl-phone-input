# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/) and the project uses
[Semantic Versioning](https://semver.org/).

## [0.2.0] - 2026-06-21

### Added

- **Built-in error display**: optional `showError` (auto-render the validation
  message under the input after blur) and `error` (explicit override, e.g. a
  "required" message) props. Adds a red border, `role="alert"` text,
  `aria-invalid`, and a `classNames.error` slot.
- `validatePhoneNumber()` result carries a default English `message` alongside the
  `reason` code; new `phoneReasonMessage(reason)` helper and the
  `PHONE_VALIDATION_REASONS` list.

### Changed

- Consolidated all reason → message → i18n-key data into a single source
  (`core/reasons.ts`). The React `Messages` object no longer contains `reason*`
  strings (they were never rendered by the component) — it now covers only the
  component-visible strings (placeholder, zero hint, format hints, type labels).
  `makeResolver().reason()` now reads from the core single source and bridges to
  your `t` via the `Label_PhoneNumber_*` keys.

### Breaking

- Removing `reason*` from the `Messages` type breaks callers that passed custom
  reason strings via `messages` (these had no visible effect before). Use
  `showError` / `error`, or translate error wording through your own `t`.

## [0.1.0] - 2026-06-20

### Added

- Initial release. `PhoneNumberInput` React component extracted from an internal
  admin app, with **no Ant Design dependency** (vanilla React + themeable CSS).
- All phone parsing / validation / formatting powered by `google-libphonenumber`
  (declared as a `peerDependency`).
- Configurable, **required** `validationLevel` prop: `strict`, `mobile-strict`,
  `loose`.
- Framework-agnostic core exported from `react-intl-phone-number/core`
  (`validatePhoneNumber`, `getPhoneNumberError`, `toE164`, `getPhoneTypeHints`, …).
- i18n via a `messages` object (English defaults) and/or a `t(key, vars)` function.
- Searchable country dropdown with flags (`country-flag-icons`) and calling-code
  search; modern, CSS-variable-driven, `classNames`-overridable styling.
